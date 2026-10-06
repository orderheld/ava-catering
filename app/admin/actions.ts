'use server'

import { asc, eq, max } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { blockedDates, categories, gallery, inquiries, inquiryLog, inquiryStatuses, menuItems, settings, themes, type InquiryStatus } from '@/db/schema'
import { checkPassword, createSession, destroySession, requireAdmin } from '@/lib/auth'
import { defaultCategories, defaultGallery, defaultSettings, defaultThemes, type SiteSettings } from '@/lib/content'
import { requireDb } from '@/lib/db'
import { sendReply } from '@/lib/mail'

export type ActionState = { ok?: boolean; error?: string; message?: string } | null

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const num = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k))
  return Number.isFinite(n) ? n : d
}
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true'
const refreshSite = () => revalidatePath('/', 'layout')

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

export async function updateInquiryStatus(fd: FormData) {
  await requireAdmin()
  const id = num(fd, 'id')
  const status = str(fd, 'status') as InquiryStatus
  if (!inquiryStatuses.includes(status)) return
  const db = requireDb()
  await db.update(inquiries).set({ status, updatedAt: new Date() }).where(eq(inquiries.id, id))
  await db.insert(inquiryLog).values({ inquiryId: id, type: 'status', subject: status })
  revalidatePath('/admin', 'layout')
}

export async function saveInquiryNotes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  await db
    .update(inquiries)
    .set({ internalNotes: str(fd, 'internalNotes') || null, offerAmount: str(fd, 'offerAmount') || null, updatedAt: new Date() })
    .where(eq(inquiries.id, num(fd, 'id')))
  revalidatePath('/admin', 'layout')
  return { ok: true, message: 'Gespeichert' }
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
  return { ok: true, message: `E-Mail an ${inq.email} gesendet` }
}

export async function deleteInquiry(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(inquiries).where(eq(inquiries.id, num(fd, 'id')))
  revalidatePath('/admin', 'layout')
  redirect('/admin/anfragen')
}

/* ───────── Angebot ───────── */

export async function importDefaults(fd: FormData) {
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
}

export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) return { error: 'Titel fehlt.' }
  const values = {
    title,
    subtitle: str(fd, 'subtitle') || null,
    description: str(fd, 'description') || null,
    image: str(fd, 'image') || null,
    sort: num(fd, 'sort'),
    visible: bool(fd, 'visible'),
  }
  if (id) await db.update(categories).set(values).where(eq(categories.id, id))
  else {
    const slug =
      title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `kategorie-${Date.now()}`
    await db.insert(categories).values({ ...values, slug })
  }
  refreshSite()
  return { ok: true, message: 'Gespeichert' }
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(categories).where(eq(categories.id, num(fd, 'id')))
  refreshSite()
}

export async function saveItem(fd: FormData) {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const name = str(fd, 'name')
  if (!name) return
  const values = { name, description: str(fd, 'description') || null, visible: id ? bool(fd, 'visible') : true }
  if (id) await db.update(menuItems).set(values).where(eq(menuItems.id, id))
  else {
    const categoryId = num(fd, 'categoryId')
    const [{ m }] = await db.select({ m: max(menuItems.sort) }).from(menuItems).where(eq(menuItems.categoryId, categoryId))
    await db.insert(menuItems).values({ ...values, categoryId, sort: (m ?? -1) + 1 })
  }
  refreshSite()
}

export async function deleteItem(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(menuItems).where(eq(menuItems.id, num(fd, 'id')))
  refreshSite()
}

export async function saveTheme(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) return { error: 'Titel fehlt.' }
  const values = { title, description: str(fd, 'description') || null, image: str(fd, 'image') || null, sort: num(fd, 'sort'), visible: bool(fd, 'visible') }
  if (id) await db.update(themes).set(values).where(eq(themes.id, id))
  else await db.insert(themes).values(values)
  refreshSite()
  return { ok: true, message: 'Gespeichert' }
}

export async function deleteTheme(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(themes).where(eq(themes.id, num(fd, 'id')))
  refreshSite()
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
  await db.insert(gallery).values({ src, alt: str(fd, 'alt'), sort: (m ?? -1) + 1 })
  refreshSite()
  return { ok: true, message: 'Bild hinzugefügt' }
}

export async function updateGalleryImage(fd: FormData) {
  await requireAdmin()
  await requireDb()
    .update(gallery)
    .set({ alt: str(fd, 'alt'), visible: bool(fd, 'visible') })
    .where(eq(gallery.id, num(fd, 'id')))
  refreshSite()
}

export async function moveGalleryImage(fd: FormData) {
  await requireAdmin()
  const db = requireDb()
  const id = num(fd, 'id')
  const dir = num(fd, 'dir')
  const all = await db.select().from(gallery).orderBy(asc(gallery.sort), asc(gallery.id))
  const i = all.findIndex((g) => g.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= all.length) return
  ;[all[i], all[j]] = [all[j], all[i]]
  await Promise.all(all.map((g, k) => (g.sort !== k ? db.update(gallery).set({ sort: k }).where(eq(gallery.id, g.id)) : null)))
  refreshSite()
}

export async function deleteGalleryImage(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(gallery).where(eq(gallery.id, num(fd, 'id')))
  refreshSite()
}

/* ───────── Einstellungen & Kalender ───────── */

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const value = Object.fromEntries(
    (Object.keys(defaultSettings) as (keyof SiteSettings)[]).map((k) => [k, k === 'aboutText' ? String(fd.get(k) ?? '').trim() : str(fd, k)]),
  ) as SiteSettings
  if (!value.phone || !value.email) return { error: 'Telefon und E-Mail sind Pflichtfelder.' }
  value.whatsapp = value.whatsapp.replace(/\D/g, '')
  await requireDb()
    .insert(settings)
    .values({ key: 'site', value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
  refreshSite()
  return { ok: true, message: 'Einstellungen gespeichert – die Website ist aktualisiert.' }
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
  return { ok: true, message: 'Datum blockiert' }
}

export async function removeBlockedDate(fd: FormData) {
  await requireAdmin()
  await requireDb().delete(blockedDates).where(eq(blockedDates.day, str(fd, 'day')))
  revalidatePath('/admin/kalender')
  revalidatePath('/anfrage')
}
