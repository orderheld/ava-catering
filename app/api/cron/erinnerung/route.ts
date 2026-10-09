import { and, eq, inArray, lt, sql } from 'drizzle-orm'
import { inquiries, settings } from '@/db/schema'
import { getDb } from '@/lib/db'
import { notifyAdmins } from '@/lib/push'
import { formatDate } from '@/lib/utils'

// Tägliche Erinnerung per Push (Vercel Cron, siehe vercel.json).
export const dynamic = 'force-dynamic'

const zurichDay = (offset = 0) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date(Date.now() + offset * 864e5))

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) return new Response(null, { status: 401 })
  const db = getDb()
  if (!db) return Response.json({ skipped: 'keine Datenbank' })

  // Höchstens eine Erinnerung pro Tag, auch wenn die Adresse mehrfach aufgerufen wird
  const today = zurichDay()
  const claimed = await db
    .insert(settings)
    .values({ key: 'push_reminder_day', value: today })
    .onConflictDoUpdate({ target: settings.key, set: { value: today }, setWhere: sql`${settings.value} <> ${JSON.stringify(today)}::jsonb` })
    .returning({ key: settings.key })
  if (!claimed.length) return Response.json({ skipped: 'heute schon gesendet' })

  const tomorrow = zurichDay(1)
  const active = ['neu', 'in_bearbeitung', 'offeriert', 'bestaetigt'] as const
  const [events, [waiting], [offers]] = await Promise.all([
    db
      .select()
      .from(inquiries)
      .where(and(inArray(inquiries.eventDate, [today, tomorrow]), inArray(inquiries.status, [...active])))
      .orderBy(inquiries.eventDate, inquiries.eventTime),
    db.select({ n: sql<number>`count(*)::int` }).from(inquiries).where(and(eq(inquiries.status, 'neu'), lt(inquiries.createdAt, sql`now() - interval '24 hours'`))),
    db.select({ n: sql<number>`count(*)::int` }).from(inquiries).where(and(eq(inquiries.status, 'offeriert'), lt(inquiries.updatedAt, sql`now() - interval '7 days'`))),
  ])

  const lines: string[] = []
  for (const e of events) {
    const when = e.eventDate === today ? 'Heute' : 'Morgen'
    const who = e.company || e.name
    const details = [e.eventTime, e.guests && `${e.guests} Gäste`, e.location].filter(Boolean).join(', ')
    const unconfirmed = e.status === 'bestaetigt' ? '' : ' (noch nicht bestätigt)'
    lines.push(`${when}: ${who}${details ? ` · ${details}` : ''}${unconfirmed}`)
  }
  if (waiting.n) lines.push(`${waiting.n === 1 ? '1 Anfrage wartet' : `${waiting.n} Anfragen warten`} seit über 24 Std. auf Antwort`)
  if (offers.n) lines.push(`${offers.n === 1 ? '1 Offerte' : `${offers.n} Offerten`} seit über einer Woche ohne Rückmeldung`)
  if (!lines.length) return Response.json({ sent: 0, reason: 'nichts anstehend' })

  const title = events.length
    ? `${events.length === 1 ? '1 Anlass' : `${events.length} Anlässe`} heute & morgen`
    : `Guten Morgen – ${formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}`
  const url = events.length === 1 ? `/admin/anfragen/${events[0].id}` : events.length ? '/admin/kalender' : '/admin/anfragen'
  const res = await notifyAdmins({ category: 'erinnerungen', title, body: lines.join('\n'), url, tag: `erinnerung-${today}` })
  return Response.json(res)
}
