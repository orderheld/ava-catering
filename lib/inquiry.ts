'use server'

import { createHash } from 'node:crypto'
import { and, eq, gte, ne, sql, type SQL } from 'drizzle-orm'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { z } from 'zod'
import { inquiries, inquiryLog } from '@/db/schema'
import { serviceOptions } from './content'
import { getCategories } from './data'
import { getDb } from './db'
import { sendInquiryMails } from './mail'
import { notifyAdmins } from './push'
import { checkFormToken, createFormToken, spamCheck } from './spam'
import { formatDate } from './utils'

export type InquiryState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; name?: string } | null

const optional = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null))

// Links in Name, Firma oder Ort sind fast immer Formular-Spam, der über die Bestätigungsmail
// an fremde Adressen verteilt werden soll – das würde den Ruf der Absenderdomain ruinieren.
const hasLink = (v: string | null | undefined) => !!v && /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info|biz|io)\b)/i.test(v)
const noLink = 'Bitte ohne Internetadresse'

const schema = z.object({
  kind: z.enum(['anfrage', 'kontakt']).default('anfrage'),
  eventType: optional(80),
  offerings: z.array(z.string().max(80)).max(10),
  themes: z.array(z.string().max(80)).max(10),
  dietary: z.array(z.string().max(40)).max(10),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || null),
  eventTime: optional(20),
  guests: z.coerce.number().int().min(1, 'Bitte Personenzahl angeben').max(5000).optional().or(z.literal('').transform(() => undefined)),
  location: optional(160).refine((v) => !hasLink(v), noLink),
  service: optional(40),
  budget: optional(40),
  name: z.string().trim().min(2, 'Bitte Ihren Namen angeben').max(120).refine((v) => !hasLink(v), noLink),
  company: optional(160).refine((v) => !hasLink(v), noLink),
  email: z.string().trim().email('Bitte eine gültige E-Mail-Adresse angeben').max(200),
  phone: optional(40),
  message: optional(4000),
  consent: z.literal('on', { error: 'Bitte bestätigen Sie die Datenschutzhinweise' }),
})

/** Signierter Zeitstempel fürs Formular (Spam-Schutz, siehe lib/spam.ts). */
export async function getFormToken() {
  return createFormToken()
}

export async function submitInquiry(_prev: InquiryState, fd: FormData): Promise<InquiryState> {
  // Spam-Schutz 1: Formular-Token (Mindestzeit, nur über die Website). Bots bekommen still «Danke».
  const silent = { ok: true, name: String(fd.get('name') ?? '').split(' ')[0] }
  const token = checkFormToken(fd.get('ft'))
  if (token === 'expired') return { ok: false, error: 'Das Formular war sehr lange offen. Bitte laden Sie die Seite neu und senden Sie es nochmals.' }
  if (token !== 'ok') {
    console.warn('[anfrage] verworfen, Token:', token)
    return silent
  }

  const parsed = schema.safeParse({
    kind: fd.get('kind') ?? 'anfrage',
    eventType: fd.get('eventType') ?? undefined,
    offerings: fd.getAll('offerings').map(String),
    themes: fd.getAll('themes').map(String),
    dietary: fd.getAll('dietary').map(String),
    eventDate: fd.get('eventDate') ?? '',
    eventTime: fd.get('eventTime') ?? undefined,
    guests: fd.get('guests') ?? '',
    location: fd.get('location') ?? undefined,
    service: fd.get('service') ?? undefined,
    budget: fd.get('budget') ?? undefined,
    name: fd.get('name') ?? '',
    company: fd.get('company') ?? undefined,
    email: fd.get('email') ?? '',
    phone: fd.get('phone') ?? undefined,
    message: fd.get('message') ?? undefined,
    consent: fd.get('consent') ?? undefined,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { ok: false, error: 'Bitte prüfen Sie die markierten Felder.', fieldErrors }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { consent, ...d } = parsed.data
  if (d.kind === 'anfrage' && !d.phone) {
    return { ok: false, error: 'Bitte geben Sie eine Telefonnummer an.', fieldErrors: { phone: 'Für Rückfragen zu Ihrem Anlass' } }
  }

  // Lesbare Bezeichnungen speichern
  const cats = await getCategories({ includeHidden: true })
  const offerings = d.offerings.map((slug) => cats.find((c) => c.slug === slug)?.title ?? slug)
  const service = serviceOptions.find((o) => o.value === d.service)?.label ?? d.service

  const h = await headers()
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || ''
  const ipHash = ip ? createHash('sha256').update(`${ip}:${process.env.AUTH_SECRET ?? 'ava'}`).digest('hex') : null

  // Spam-Schutz 2: verdächtiger Inhalt landet im Admin unter «Spam» (ohne E-Mail/Push), damit nichts verloren geht.
  const check = spamCheck(d)
  // Unsichtbares Feld ausgefüllt: fast sicher ein Bot – trotzdem nur ablegen, falls ein Browser es automatisch befüllt hat
  if (fd.get('website')) {
    check.spam = true
    check.reasons.push('Verstecktes Feld ausgefüllt')
  }
  const record = { ...d, offerings, service, guests: d.guests ?? null, ipHash }
  let id = 0
  let spam = check.spam
  const db = getDb()
  if (db) {
    try {
      // Spam-Schutz 3: Limits pro Absender
      const recent = (col: SQL, interval: string) =>
        db
          .select({ n: sql<number>`count(*)::int` })
          .from(inquiries)
          .where(and(col, gte(inquiries.createdAt, sql.raw(`now() - interval '${interval}'`))))
          .then(([r]) => r.n)
      const [ipHour, ipDay, mailHour, allHour] = await Promise.all([
        ipHash ? recent(eq(inquiries.ipHash, ipHash), '1 hour') : 0,
        ipHash ? recent(eq(inquiries.ipHash, ipHash), '1 day') : 0,
        recent(sql`lower(${inquiries.email}) = ${d.email.toLowerCase()}`, '1 hour'),
        recent(ne(inquiries.status, 'spam'), '1 hour'),
      ])
      if (ipHour >= 5 || ipDay >= 12 || mailHour >= 3) return { ok: false, error: 'Sie haben bereits mehrere Anfragen gesendet. Bitte rufen Sie uns direkt an.' }
      // Flut von vielen Adressen gleichzeitig: weiter speichern, aber nicht mehr benachrichtigen
      if (allHour >= 30 && !spam) {
        spam = true
        check.reasons.push('Über 30 Anfragen in einer Stunde')
      }
      const [row] = await db
        .insert(inquiries)
        .values({ ...record, status: spam ? 'spam' : 'neu' })
        .returning({ id: inquiries.id })
      id = row.id
      if (spam) await db.insert(inquiryLog).values({ inquiryId: id, type: 'note', subject: 'Als Spam erkannt', body: check.reasons.join(', ') })
    } catch (err) {
      console.error('[anfrage] Speichern fehlgeschlagen:', err)
      if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns an.' }
    }
  } else if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'Das Formular ist noch nicht eingerichtet. Bitte kontaktieren Sie uns per Telefon oder E-Mail.' }
  }

  if (spam) {
    console.warn('[anfrage] als Spam abgelegt:', id || '(nicht gespeichert)', check.reasons.join(', '))
    return silent
  }

  if (id) after(() => notifyAdmins(pushFor(id, record)))

  let mailed = false
  try {
    const [owner] = await sendInquiryMails({ id, ...record })
    mailed = owner.ok
  } catch (err) {
    console.error('[anfrage] E-Mail-Versand fehlgeschlagen:', err)
  }
  // Weder gespeichert noch per E-Mail angekommen: nicht «Danke» zeigen, sonst geht die Anfrage verloren.
  if (!id && !mailed) {
    return { ok: false, error: 'Die Anfrage konnte leider nicht gesendet werden. Bitte rufen Sie uns an oder schreiben Sie an kontakt@avacatering.ch.' }
  }
  return { ok: true, name: d.name.split(' ')[0] }
}

/** Push-Mitteilung fürs Admin-Panel zu einer neuen Anfrage bzw. Nachricht. */
function pushFor(id: number, d: { kind: string; name: string; company: string | null; eventType: string | null; eventDate: string | null; guests: number | null; offerings: string[]; message: string | null }) {
  const who = d.company ? `${d.name} (${d.company})` : d.name
  const excerpt = d.message ? (d.message.length > 140 ? `${d.message.slice(0, 140)}…` : d.message) : ''
  if (d.kind === 'kontakt') {
    return { category: 'nachrichten' as const, title: `Neue Nachricht von ${who}`, body: excerpt || 'Über das Kontaktformular', url: `/admin/anfragen/${id}`, tag: `anfrage-${id}` }
  }
  const facts = [d.eventType, d.eventDate && formatDate(d.eventDate, { weekday: 'short', day: 'numeric', month: 'short' }), d.guests && `${d.guests} Gäste`]
    .filter(Boolean)
    .join(' · ')
  const body = [facts, d.offerings.join(', '), excerpt].filter(Boolean).join('\n')
  return { category: 'anfragen' as const, title: `Neue Anfrage von ${who}`, body: body || 'Details im Admin ansehen', url: `/admin/anfragen/${id}`, tag: `anfrage-${id}` }
}
