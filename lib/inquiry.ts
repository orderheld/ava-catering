'use server'

import { createHash } from 'node:crypto'
import { and, eq, gte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { z } from 'zod'
import { inquiries } from '@/db/schema'
import { serviceOptions } from './content'
import { getCategories } from './data'
import { getDb } from './db'
import { sendInquiryMails } from './mail'

export type InquiryState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; name?: string } | null

const optional = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null))

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
  location: optional(160),
  service: optional(40),
  budget: optional(40),
  name: z.string().trim().min(2, 'Bitte Ihren Namen angeben').max(120),
  company: optional(160),
  email: z.string().trim().email('Bitte eine gültige E-Mail-Adresse angeben').max(200),
  phone: optional(40),
  message: optional(4000),
  consent: z.literal('on', { error: 'Bitte bestätigen Sie die Datenschutzhinweise' }),
})

export async function submitInquiry(_prev: InquiryState, fd: FormData): Promise<InquiryState> {
  // Spam-Schutz: Honeypot + Mindestzeit zum Ausfüllen
  const started = Number(fd.get('t') ?? 0)
  if (fd.get('website') || (started && Date.now() - started < 2500)) {
    return { ok: true, name: String(fd.get('name') ?? '') }
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

  const record = { ...d, offerings, service, guests: d.guests ?? null, ipHash }
  let id = 0
  const db = getDb()
  if (db) {
    try {
      if (ipHash) {
        const [{ n }] = await db
          .select({ n: sql<number>`count(*)::int` })
          .from(inquiries)
          .where(and(eq(inquiries.ipHash, ipHash), gte(inquiries.createdAt, sql`now() - interval '1 hour'`)))
        if (n >= 5) return { ok: false, error: 'Sie haben bereits mehrere Anfragen gesendet. Bitte rufen Sie uns direkt an.' }
      }
      const [row] = await db
        .insert(inquiries)
        .values(record)
        .returning({ id: inquiries.id })
      id = row.id
    } catch (err) {
      console.error('[anfrage] Speichern fehlgeschlagen:', err)
      if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns an.' }
    }
  } else if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'Das Formular ist noch nicht eingerichtet. Bitte kontaktieren Sie uns per Telefon oder E-Mail.' }
  }

  try {
    await sendInquiryMails({ id, ...record })
  } catch (err) {
    console.error('[anfrage] E-Mail-Versand fehlgeschlagen:', err)
  }
  return { ok: true, name: d.name.split(' ')[0] }
}
