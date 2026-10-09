import 'server-only'
import { eq, inArray, sql } from 'drizzle-orm'
import webpush from 'web-push'
import { inquiries, pushSubscriptions, settings } from '@/db/schema'
import { pushCategories, type PushCategory } from './push-shared'
import { getDb } from './db'

export type PushMessage = {
  category: PushCategory
  title: string
  body: string
  /** Seite, die beim Antippen geöffnet wird, z.B. /admin/anfragen/12 */
  url?: string
  /** Gleicher Tag ersetzt eine ältere Mitteilung statt eine zweite anzuzeigen. */
  tag?: string
}

let tableReady: Promise<unknown> | null = null

/** Legt die Tabelle beim ersten Gebrauch an, damit nach dem Deploy kein `db:push` nötig ist. */
function ensureTable() {
  const db = getDb()
  if (!db) return null
  tableReady ??= db
    .execute(
      sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
        id serial PRIMARY KEY,
        created_at timestamptz DEFAULT now() NOT NULL,
        endpoint text UNIQUE NOT NULL,
        p256dh text NOT NULL,
        auth text NOT NULL,
        device text,
        categories jsonb DEFAULT '["anfragen","nachrichten","erinnerungen"]'::jsonb NOT NULL
      )`,
    )
    .catch((err) => {
      tableReady = null
      throw err
    })
  return tableReady.then(() => db)
}

type Vapid = { publicKey: string; privateKey: string }
let vapid: Promise<Vapid | null> | null = null

/** VAPID-Schlüssel aus den Umgebungsvariablen oder – falls keine gesetzt sind – einmalig erzeugt und in der Datenbank gespeichert. */
export function getVapid(): Promise<Vapid | null> {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return Promise.resolve({ publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY })
  }
  vapid ??= (async () => {
    const db = getDb()
    if (!db) return null
    const read = async () => (await db.query.settings.findFirst({ where: eq(settings.key, 'push_vapid') }))?.value as Vapid | undefined
    const existing = await read()
    if (existing) return existing
    const keys = webpush.generateVAPIDKeys()
    await db.insert(settings).values({ key: 'push_vapid', value: keys }).onConflictDoNothing()
    return (await read()) ?? null
  })().catch((err) => {
    vapid = null
    console.error('[push] VAPID-Schlüssel nicht verfügbar:', err)
    return null
  })
  return vapid
}

export type SubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } }

export async function saveSubscription(sub: SubscriptionInput, device: string | null) {
  const db = await ensureTable()
  if (!db) throw new Error('Datenbank ist nicht verbunden.')
  // Bestehende Auswahl der Kategorien bleibt beim erneuten Anmelden erhalten
  await db
    .insert(pushSubscriptions)
    .values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, device })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, device } })
  const [row] = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint))
  return row
}

export async function getSubscription(endpoint: string) {
  const db = await ensureTable()
  if (!db) return null
  const [row] = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
  return row ?? null
}

export async function setCategories(endpoint: string, categories: PushCategory[]) {
  const db = await ensureTable()
  if (!db) return
  const valid = pushCategories.filter((c) => categories.includes(c))
  await db.update(pushSubscriptions).set({ categories: valid }).where(eq(pushSubscriptions.endpoint, endpoint))
}

export async function removeSubscription(endpoint: string) {
  const db = await ensureTable()
  if (!db) return
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
}

export async function countSubscriptions() {
  const db = await ensureTable()
  if (!db) return 0
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(pushSubscriptions)
  return r.n
}

/** Schickt eine Mitteilung an alle Geräte, die diese Kategorie eingeschaltet haben.
 *  Wirft nie – ein Push-Fehler darf eine Anfrage nicht scheitern lassen. */
export async function notifyAdmins(msg: PushMessage, only?: { endpoint: string }) {
  try {
    const db = await ensureTable()
    const keys = await getVapid()
    if (!db || !keys) return { sent: 0 }

    const rows = only
      ? await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, only.endpoint))
      : await db.select().from(pushSubscriptions).where(sql`${pushSubscriptions.categories} @> ${JSON.stringify([msg.category])}::jsonb`)
    if (!rows.length) return { sent: 0 }

    const [{ n: badge }] = await db.select({ n: sql<number>`count(*)::int` }).from(inquiries).where(eq(inquiries.status, 'neu'))
    const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url ?? '/admin', tag: msg.tag, badge })
    const subject = `mailto:${process.env.MAIL_NOTIFY_TO?.match(/[^<\s]+@[^>\s]+/)?.[0] ?? 'kontakt@avacatering.ch'}`

    const gone: string[] = []
    let sent = 0
    await Promise.all(
      rows.map(async (r) => {
        try {
          await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, payload, {
            vapidDetails: { subject, publicKey: keys.publicKey, privateKey: keys.privateKey },
            TTL: 60 * 60 * 24,
            urgency: msg.category === 'erinnerungen' ? 'normal' : 'high',
            topic: msg.tag?.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined,
          })
          sent++
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode
          // Abo abgelaufen oder auf dem Gerät entfernt
          if (status === 404 || status === 410) gone.push(r.endpoint)
          else console.error('[push] Versand fehlgeschlagen:', status, (err as Error).message)
        }
      }),
    )
    if (gone.length) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, gone))
    return { sent }
  } catch (err) {
    console.error('[push] Fehler:', err)
    return { sent: 0 }
  }
}
