'use server'

import { asc, eq, max } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { blockedDates, categories, gallery, inquiries, inquiryLog, inquiryStatuses, menuItems, settings, themes, type InquiryStatus } from '@/db/schema'
import { checkPassword, createSession, destroySession, requireAdmin } from '@/lib/auth'
import { defaultCategories, defaultGallery, defaultSettings, defaultThemes, type SiteSettings } from '@/lib/content'
import { requireDb } from '@/lib/db'
import { record, undo } from '@/lib/history'
import { sendReply } from '@/lib/mail'

export type ActionState = { ok?: boolean; error?: string; message?: string } | null

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const num = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k))
  return Number.isFinite(n) ? n : d
}
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true'
const refreshSite = () => revalidatePath('/', 'layout')
const done = (message: string): ActionState => ({ ok: true, message })

/* ───────── Login ───────── */

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await new Promise((r) => setTimeout(r, 400)) // bremst Brute-Force
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return { error: 'ADMIN_PASSWORD und AUTH_SECRET sind noch nicht gesetzt (siehe README).' }
  }
  if (!checkPassword(str(fd, 'password'))) return { error: 'Das Passwort stimmt nicht.' }
  await createSession()
  const next = str(fd, 'next')
  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function logout() {
  await destroySession()
  redirect('/admin/login')
}

/* ───────── Anfragen ───────── */

export async function updateInquiryStatus(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const id = num(fd, 'id')
  const status = str(fd, 'status') as InquiryStatus
  if (!inquiryStatuses.includes(status)) return { error: 'Unbekannter Status.' }
  const db = requireDb()
  await db.update(inquiries).set({ status, updatedAt: new Date() }).where(eq(inquiries.id, id))
  await db.insert(inquiryLog).values({ inquiryId: id, type: 'status', subject: status })
  revalidatePath('/admin', 'layout')
  return done('Status gespeichert')
}

export async function saveInquiryNotes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  await db
    .update(inquiries)
    .set({ internalNotes: str(fd, 'internalNotes') || null, offerAmount: str(fd, 'offerAmount') || null, updatedAt: new Date() })
    .where(eq(inquiries.id, num(fd, 'id')))
  revalidatePath('/admin', 'layout')
  return done('Notizen gespeichert')
}

export async function replyToInquiry(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const id = num(fd, 'id')
  const subject = str(fd, 'subject')
  const body = String(fd.get('body') ?? '').trim()
  if (!subject || !body) return { error: 'Betreff und Text dürfen nicht leer sein.' }
  const db = requireDb()
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) })
  if (!inq) return { error: 'Anfrage nicht gefunden.' }
  const res = await sendReply(inq.email, subject, body)
  if (!res.ok) return { error: `E-Mail konnte nicht gesendet werden: ${res.error}` }
  await db.insert(inquiryLog).values({ inquiryId: id, type: 'mail', subject, body })
  const setStatus = str(fd, 'setStatus') as InquiryStatus
  if (inquiryStatuses.includes(setStatus) && setStatus !== inq.status) {
    await db.update(inquiries).set({ status: setStatus, updatedAt: new Date() }).where(eq(inquiries.id, id))
    await db.insert(inquiryLog).values({ inquiryId: id, type: 'status', subject: setStatus })
  }
  revalidatePath('/admin', 'layout')
  return done(`E-Mail an ${inq.email} gesendet`)
}

export async function deleteInquiry(fd: FormData) {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const row = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) })
  if (row) {
    const log = await db.select().from(inquiryLog).where(eq(inquiryLog.inquiryId, id))
    await record('inquiry', id, 'delete', `Anfrage von ${row.name}`, { row, log })
    await db.delete(inquiries).where(eq(inquiries.id, id))
  }
  revalidatePath('/admin', 'layout')
  redirect('/admin/anfragen')
}

/* ───────── Angebot ───────── */

export async function importDefaults(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const what = str(fd, 'what')
  if (what === 'angebot') {
    const existing = await db.select({ id: categories.id }).from(categories).limit(1)
    if (existing.length === 0) {
      for (const c of defaultCategories) {
        const { items, ...cat } = c
        const [row] = await db.insert(categories).values(cat).returning({ id: categories.id })
        if (items.length) await db.insert(menuItems).values(items.map((i) => ({ ...i, categoryId: row.id })))
      }
    }
    const t = await db.select({ id: themes.id }).from(themes).limit(1)
    if (t.length === 0) await db.insert(themes).values(defaultThemes)
  }
  if (what === 'galerie') {
    const existing = await db.select({ id: gallery.id }).from(gallery).limit(1)
    if (existing.length === 0) await db.insert(gallery).values(defaultGallery)
  }
  refreshSite()
  return done('Standardinhalte übernommen – jetzt bearbeitbar')
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `kategorie-${Date.now()}`

export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) return { error: 'Bitte einen Titel eingeben.' }
  const values = {
    title,
    subtitle: str(fd, 'subtitle') || null,
    description: str(fd, 'description') || null,
    image: str(fd, 'image') || null,
    sort: num(fd, 'sort'),
    visible: bool(fd, 'visible'),
  }
  if (id) {
    const before = await db.query.categories.findFirst({ where: eq(categories.id, id) })
    await db.update(categories).set(values).where(eq(categories.id, id))
    await record('category', id, 'update', `Buffet «${title}» geändert`, before, values)
  } else {
    const [row] = await db.insert(categories).values({ ...values, slug: slugify(title) }).returning()
    await record('category', row.id, 'create', `Buffet «${title}» angelegt`, null, row)
  }
  refreshSite()
  return done(`Buffet «${title}» gespeichert`)
}

export async function deleteCategory(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const row = await db.query.categories.findFirst({ where: eq(categories.id, id) })
  if (!row) return { error: 'Buffet nicht gefunden.' }
  const items = await db.select().from(menuItems).where(eq(menuItems.categoryId, id))
  await record('category', id, 'delete', `Buffet «${row.title}» gelöscht`, { row, items })
  await db.delete(categories).where(eq(categories.id, id))
  refreshSite()
  return done(`Buffet «${row.title}» gelöscht – im Verlauf wiederherstellbar`)
}

export async function saveItem(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const name = str(fd, 'name')
  if (!name) return { error: 'Bitte einen Namen eingeben.' }
  const values = { name, description: str(fd, 'description') || null, visible: id ? bool(fd, 'visible') : true }
  if (id) {
    const before = await db.query.menuItems.findFirst({ where: eq(menuItems.id, id) })
    await db.update(menuItems).set(values).where(eq(menuItems.id, id))
    await record('item', id, 'update', `Beispiel «${name}» geändert`, before, values)
  } else {
    const categoryId = num(fd, 'categoryId')
    const [{ m }] = await db.select({ m: max(menuItems.sort) }).from(menuItems).where(eq(menuItems.categoryId, categoryId))
    const [row] = await db.insert(menuItems).values({ ...values, categoryId, sort: (m ?? -1) + 1 }).returning()
    await record('item', row.id, 'create', `Beispiel «${name}» hinzugefügt`, null, row)
  }
  refreshSite()
  return done(id ? `«${name}» gespeichert` : `«${name}» hinzugefügt`)
}

export async function deleteItem(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const row = await db.query.menuItems.findFirst({ where: eq(menuItems.id, id) })
  if (!row) return { error: 'Beispiel nicht gefunden.' }
  await record('item', id, 'delete', `Beispiel «${row.name}» entfernt`, row)
  await db.delete(menuItems).where(eq(menuItems.id, id))
  refreshSite()
  return done(`«${row.name}» entfernt`)
}

export async function saveTheme(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) return { error: 'Bitte einen Titel eingeben.' }
  const values = { title, description: str(fd, 'description') || null, image: str(fd, 'image') || null, sort: num(fd, 'sort'), visible: bool(fd, 'visible') }
  if (id) {
    const before = await db.query.themes.findFirst({ where: eq(themes.id, id) })
    await db.update(themes).set(values).where(eq(themes.id, id))
    await record('theme', id, 'update', `Thema «${title}» geändert`, before, values)
  } else {
    const [row] = await db.insert(themes).values(values).returning()
    await record('theme', row.id, 'create', `Thema «${title}» angelegt`, null, row)
  }
  refreshSite()
  return done(`Thema «${title}» gespeichert`)
}

export async function deleteTheme(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const row = await db.query.themes.findFirst({ where: eq(themes.id, id) })
  if (!row) return { error: 'Thema nicht gefunden.' }
  await record('theme', id, 'delete', `Thema «${row.title}» gelöscht`, row)
  await db.delete(themes).where(eq(themes.id, id))
  refreshSite()
  return done(`Thema «${row.title}» gelöscht – im Verlauf wiederherstellbar`)
}

/* ───────── Galerie ───────── */

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()
  const file = fd.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Keine Datei ausgewählt.' }
  if (!file.type.startsWith('image/')) return { error: 'Bitte ein Bild hochladen (JPG, PNG, WebP).' }
  if (file.size > 8 * 1024 * 1024) return { error: 'Das Bild ist grösser als 8 MB.' }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { error: 'Bild-Upload ist noch nicht eingerichtet (BLOB_READ_WRITE_TOKEN fehlt).' }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const blob = await put(`ava/${safeName}`, file, { access: 'public', addRandomSuffix: true })
  return { url: blob.url }
}

export async function addGalleryImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const src = str(fd, 'src')
  if (!src) return { error: 'Bitte zuerst ein Bild hochladen oder eine URL angeben.' }
  const db = requireDb()
  const [{ m }] = await db.select({ m: max(gallery.sort) }).from(gallery)
  const [row] = await db.insert(gallery).values({ src, alt: str(fd, 'alt'), sort: (m ?? -1) + 1 }).returning()
  await record('gallery', row.id, 'create', `Galeriebild «${row.alt || 'ohne Beschreibung'}» hinzugefügt`, null, row)
  refreshSite()
  return done('Bild hinzugefügt')
}

export async function updateGalleryImage(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const before = await db.query.gallery.findFirst({ where: eq(gallery.id, id) })
  const values = { alt: str(fd, 'alt'), visible: bool(fd, 'visible') }
  await db.update(gallery).set(values).where(eq(gallery.id, id))
  await record('gallery', id, 'update', `Galeriebild «${values.alt || 'ohne Beschreibung'}» geändert`, before, values)
  refreshSite()
  return done('Bild gespeichert')
}

export async function moveGalleryImage(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const dir = num(fd, 'dir')
  const all = await db.select().from(gallery).orderBy(asc(gallery.sort), asc(gallery.id))
  const i = all.findIndex((g) => g.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= all.length) return null
  ;[all[i], all[j]] = [all[j], all[i]]
  await Promise.all(all.map((g, k) => (g.sort !== k ? db.update(gallery).set({ sort: k }).where(eq(gallery.id, g.id)) : null)))
  refreshSite()
  return done('Reihenfolge geändert')
}

export async function deleteGalleryImage(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const row = await db.query.gallery.findFirst({ where: eq(gallery.id, id) })
  if (!row) return { error: 'Bild nicht gefunden.' }
  await record('gallery', id, 'delete', `Galeriebild «${row.alt || 'ohne Beschreibung'}» entfernt`, row)
  await db.delete(gallery).where(eq(gallery.id, id))
  refreshSite()
  return done('Bild entfernt – im Verlauf wiederherstellbar')
}

/* ───────── Einstellungen & Kalender ───────── */

async function writeSettings(value: SiteSettings, label: string) {
  const db = requireDb()
  const before = (await db.query.settings.findFirst({ where: eq(settings.key, 'site') }))?.value ?? null
  await db.insert(settings).values({ key: 'site', value }).onConflictDoUpdate({ target: settings.key, set: { value } })
  await record('settings', 'site', 'update', label, before, value)
  refreshSite()
}

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const value = Object.fromEntries(
    (Object.keys(defaultSettings) as (keyof SiteSettings)[]).map((k) => [k, k === 'aboutText' ? String(fd.get(k) ?? '').trim() : str(fd, k)]),
  ) as SiteSettings
  if (!value.phone || !value.email) return { error: 'Telefon und E-Mail sind Pflichtfelder.' }
  value.whatsapp = value.whatsapp.replace(/\D/g, '')
  await writeSettings(value, 'Einstellungen gespeichert')
  return done('Gespeichert – die Website ist aktualisiert')
}

/* ───────── Inhalte prüfen & Verlauf ───────── */

/** Setzt ein einzelnes Feld der Einstellungen auf den Standardtext zurück. */
export async function resetSetting(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const key = str(fd, 'key') as keyof SiteSettings
  if (!(key in defaultSettings)) return { error: 'Unbekanntes Feld.' }
  const db = requireDb()
  const current = ((await db.query.settings.findFirst({ where: eq(settings.key, 'site') }))?.value ?? {}) as Partial<SiteSettings>
  await writeSettings({ ...defaultSettings, ...current, [key]: defaultSettings[key] }, `Einstellung «${key}» auf Standard gesetzt`)
  return done('Standardtext wiederhergestellt')
}

/** Stellt einen Standard-Inhalt wieder her (fehlendes Buffet, Beispiel, Thema, Bild oder geänderte Texte eines Buffets). */
export async function restoreDefault(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const kind = str(fd, 'kind')
  const key = str(fd, 'key')
  if (kind === 'category') {
    const def = defaultCategories.find((c) => c.slug === key)
    if (!def) return { error: 'Standard nicht gefunden.' }
    const { items, ...cat } = def
    const existing = await db.query.categories.findFirst({ where: eq(categories.slug, key) })
    if (existing) {
      const values = { title: cat.title, subtitle: cat.subtitle, description: cat.description, image: cat.image }
      await db.update(categories).set(values).where(eq(categories.id, existing.id))
      await record('category', existing.id, 'update', `Buffet «${cat.title}» auf Standard gesetzt`, existing, values)
    } else {
      const [row] = await db.insert(categories).values(cat).returning()
      if (items.length) await db.insert(menuItems).values(items.map((i) => ({ ...i, categoryId: row.id })))
      await record('category', row.id, 'create', `Buffet «${cat.title}» wiederhergestellt`, null, row)
    }
  } else if (kind === 'item') {
    const [slug, name] = key.split('::')
    const def = defaultCategories.find((c) => c.slug === slug)?.items.find((i) => i.name === name)
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, slug) })
    if (!def || !cat) return { error: 'Standard nicht gefunden.' }
    const [row] = await db.insert(menuItems).values({ ...def, categoryId: cat.id }).returning()
    await record('item', row.id, 'create', `Beispiel «${name}» wiederhergestellt`, null, row)
  } else if (kind === 'theme') {
    const def = defaultThemes.find((t) => t.title === key)
    if (!def) return { error: 'Standard nicht gefunden.' }
    const [row] = await db.insert(themes).values(def).returning()
    await record('theme', row.id, 'create', `Thema «${key}» wiederhergestellt`, null, row)
  } else if (kind === 'gallery') {
    const def = defaultGallery.find((g) => g.src === key)
    if (!def) return { error: 'Standard nicht gefunden.' }
    const [row] = await db.insert(gallery).values(def).returning()
    await record('gallery', row.id, 'create', `Galeriebild «${def.alt}» wiederhergestellt`, null, row)
  } else return { error: 'Unbekannter Inhalt.' }
  refreshSite()
  return done('Wiederhergestellt')
}

export async function undoChange(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const res = await undo(num(fd, 'id'))
  if (!res.ok) return { error: res.message }
  refreshSite()
  revalidatePath('/admin', 'layout')
  return done(res.message)
}

export async function addBlockedDate(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const day = str(fd, 'day')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { error: 'Bitte ein Datum wählen.' }
  await requireDb()
    .insert(blockedDates)
    .values({ day, note: str(fd, 'note') || null })
    .onConflictDoUpdate({ target: blockedDates.day, set: { note: str(fd, 'note') || null } })
  revalidatePath('/admin/kalender')
  revalidatePath('/anfrage')
  return done('Tag blockiert')
}

export async function removeBlockedDate(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  await requireDb().delete(blockedDates).where(eq(blockedDates.day, str(fd, 'day')))
  revalidatePath('/admin/kalender')
  revalidatePath('/anfrage')
  return done('Tag wieder freigegeben')
}
