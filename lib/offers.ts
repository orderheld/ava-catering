import 'server-only'
import { randomBytes } from 'node:crypto'
import { desc, eq, inArray } from 'drizzle-orm'
import { inquiries, inquiryLog, offers, type InquiryStatus } from '@/db/schema'
import { getCategories } from './data'
import { requireDb } from './db'
import { formatChf, offerNumber, type OfferPosition, type OfferUnit } from './offer'

export type Offer = typeof offers.$inferSelect
export type Suggestion = { text: string; detail?: string; unit: OfferUnit; price: number }

export const newToken = () => randomBytes(18).toString('base64url')

const addDays = (days: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date(Date.now() + days * 864e5))

const defaultNotes =
  'Alle Preise in CHF. Die definitive Personenzahl bitte bis spätestens 5 Tage vor dem Anlass bestätigen.\nGerne passe ich die Offerte an Ihre Wünsche an.'

/** Zuletzt verwendete Preise: pro Positionstext der neuste Eintrag aus früheren Offerten. */
async function lastPositions(): Promise<Map<string, OfferPosition>> {
  const rows = await requireDb().select({ positions: offers.positions }).from(offers).orderBy(desc(offers.updatedAt)).limit(60)
  const map = new Map<string, OfferPosition>()
  for (const r of rows) for (const p of r.positions) if (p.text && !map.has(p.text.toLowerCase())) map.set(p.text.toLowerCase(), p)
  return map
}

/** Vorschläge zum schnellen Hinzufügen: Buffets der Website, übliche Extras und früher verwendete Positionen – mit dem letzten Preis. */
export async function getSuggestions(): Promise<Suggestion[]> {
  const [cats, last] = await Promise.all([getCategories(), lastPositions()])
  const base: Suggestion[] = [
    ...cats.map((c) => ({ text: c.title, unit: 'person' as const, price: 0 })),
    { text: 'Lieferung', unit: 'pauschal', price: 0 },
    { text: 'Aufbau & Abbau', unit: 'pauschal', price: 0 },
    { text: 'Service-Personal', unit: 'stunde', price: 0 },
    { text: 'Getränke', unit: 'person', price: 0 },
  ]
  const seen = new Set(base.map((s) => s.text.toLowerCase()))
  const withPrices = base.map((s) => {
    const p = last.get(s.text.toLowerCase())
    return p ? { text: s.text, detail: p.detail, unit: p.unit, price: p.price } : s
  })
  const earlier = [...last.values()].filter((p) => !seen.has(p.text.toLowerCase())).slice(0, 12)
  return [...withPrices, ...earlier.map((p) => ({ text: p.text, detail: p.detail, unit: p.unit, price: p.price }))]
}

/** Neuer Entwurf – aus einer Anfrage vorausgefüllt (Kunde, Anlass, gewählte Buffets mit Personenzahl und letztem Preis). */
export async function createDraft(inquiryId: number | null): Promise<number> {
  const db = requireDb()
  const inq = inquiryId ? await db.query.inquiries.findFirst({ where: eq(inquiries.id, inquiryId) }) : null
  const [last, previous] = await Promise.all([
    lastPositions(),
    db.select({ notes: offers.notes }).from(offers).orderBy(desc(offers.createdAt)).limit(1),
  ])
  const positions: OfferPosition[] = []
  if (inq) {
    const guests = inq.guests ?? 1
    for (const title of inq.offerings) {
      const p = last.get(title.toLowerCase())
      positions.push({ text: title, detail: p?.detail, qty: guests, unit: p?.unit ?? 'person', price: p?.price ?? 0 })
    }
    if (inq.service && /lieferung/i.test(inq.service)) {
      const text = /aufbau/i.test(inq.service) ? 'Lieferung & Aufbau' : 'Lieferung'
      const p = last.get(text.toLowerCase())
      positions.push({ text, qty: 1, unit: 'pauschal', price: p?.price ?? 0 })
    }
  }
  const [row] = await db
    .insert(offers)
    .values({
      inquiryId: inq?.id ?? null,
      token: newToken(),
      name: inq?.name ?? '',
      company: inq?.company,
      email: inq?.email,
      phone: inq?.phone,
      eventType: inq?.eventType,
      eventDate: inq?.eventDate,
      eventTime: inq?.eventTime,
      guests: inq?.guests,
      location: inq?.location,
      intro: `Guten Tag${inq ? ` ${inq.name}` : ''}\n\nHerzlichen Dank für Ihre Anfrage. Sehr gerne offeriere ich Ihnen für Ihren Anlass:`,
      positions,
      notes: previous[0]?.notes ?? defaultNotes,
      validUntil: addDays(30),
    })
    .returning({ id: offers.id })
  return row.id
}

/** Status der Anfrage nachziehen, ohne einen weiter fortgeschrittenen Status zurückzusetzen. */
export async function syncInquiry(offer: Offer, status: InquiryStatus) {
  if (!offer.inquiryId) return
  const db = requireDb()
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, offer.inquiryId) })
  if (!inq) return
  const from: InquiryStatus[] = status === 'offeriert' ? ['neu', 'in_bearbeitung'] : ['neu', 'in_bearbeitung', 'offeriert']
  const values: Partial<typeof inquiries.$inferInsert> = { offerAmount: formatChf(offer.totalCents / 100), updatedAt: new Date() }
  if (from.includes(inq.status)) values.status = status
  await db.update(inquiries).set(values).where(eq(inquiries.id, inq.id))
  if (values.status) await db.insert(inquiryLog).values({ inquiryId: inq.id, type: 'status', subject: status })
}

export async function logOfferMail(offer: Offer, subject: string, body: string) {
  if (offer.inquiryId) await requireDb().insert(inquiryLog).values({ inquiryId: offer.inquiryId, type: 'mail', subject, body })
}

export const offerTitle = (o: Pick<Offer, 'id' | 'createdAt' | 'name' | 'company'>) => `Offerte ${offerNumber(o)} · ${o.company || o.name || 'ohne Namen'}`

export async function offersForInquiries(ids: number[]) {
  if (!ids.length) return []
  return requireDb().select().from(offers).where(inArray(offers.inquiryId, ids)).orderBy(desc(offers.createdAt))
}
