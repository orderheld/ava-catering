'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { offers } from '@/db/schema'
import type { ActionState } from '@/app/admin/actions'
import { requireAdmin } from '@/lib/auth'
import { requireDb } from '@/lib/db'
import { record } from '@/lib/history'
import { sendOffer } from '@/lib/mail'
import { formatChf, offerNumber, offerStatuses, offerTotal, offerUnits, parseAmount, type OfferPosition, type OfferStatus, type OfferUnit } from '@/lib/offer'
import { createDraft, logOfferMail, newToken, offerTitle, syncInquiry } from '@/lib/offers'

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const orNull = (v: string) => v || null
const isDay = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)
const refresh = () => revalidatePath('/admin', 'layout')

export async function createOffer(fd: FormData) {
  await requireAdmin()
  const inquiryId = Number(fd.get('inquiryId')) || null
  const id = await createDraft(inquiryId)
  refresh()
  redirect(`/admin/offerten/${id}`)
}

function readPositions(fd: FormData): OfferPosition[] {
  let raw: unknown
  try {
    raw = JSON.parse(String(fd.get('positions') ?? '[]'))
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  return raw
    .map((p) => {
      const unit = (p?.unit in offerUnits ? p.unit : 'person') as OfferUnit
      return {
        text: String(p?.text ?? '').trim().slice(0, 200),
        detail: String(p?.detail ?? '').trim().slice(0, 500) || undefined,
        qty: unit === 'pauschal' ? 1 : Math.max(0, parseAmount(p?.qty)),
        unit,
        price: Math.round(parseAmount(p?.price) * 100) / 100,
      }
    })
    .filter((p) => p.text)
    .slice(0, 60)
}

/** Speichert die Offerte. Mit intent=send wird sie danach per E-Mail verschickt. */
export async function saveOffer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const id = Number(fd.get('id'))
  const existing = await db.query.offers.findFirst({ where: eq(offers.id, id) })
  if (!existing) return { error: 'Offerte nicht gefunden.' }
  const positions = readPositions(fd)
  const guests = Math.round(parseAmount(fd.get('guests'))) || null
  const values = {
    name: str(fd, 'name'),
    company: orNull(str(fd, 'company')),
    email: orNull(str(fd, 'email')),
    phone: orNull(str(fd, 'phone')),
    address: orNull(str(fd, 'address')),
    eventType: orNull(str(fd, 'eventType')),
    eventDate: isDay(str(fd, 'eventDate')),
    eventTime: orNull(str(fd, 'eventTime')),
    guests,
    location: orNull(str(fd, 'location')),
    intro: orNull(String(fd.get('intro') ?? '').trim()),
    notes: orNull(String(fd.get('notes') ?? '').trim()),
    validUntil: isDay(str(fd, 'validUntil')),
    positions,
    totalCents: Math.round(offerTotal(positions) * 100),
    updatedAt: new Date(),
  }
  if (!values.name) return { error: 'Bitte den Namen der Kundin / des Kunden eingeben.' }
  const [saved] = await db.update(offers).set(values).where(eq(offers.id, id)).returning()
  refresh()

  if (fd.get('intent') !== 'send') return { ok: true, message: 'Offerte gespeichert' }

  if (!saved.email) return { error: 'Gespeichert – zum Senden fehlt noch die E-Mail-Adresse.' }
  if (!positions.length) return { error: 'Gespeichert – bitte zuerst mindestens eine Position erfassen.' }
  const res = await sendOffer({ ...saved, email: saved.email })
  if (!res.ok) return { error: `Gespeichert, aber die E-Mail konnte nicht gesendet werden: ${res.error}` }
  const [sent] = await db
    .update(offers)
    .set({ status: saved.status === 'angenommen' ? 'angenommen' : 'gesendet', sentAt: new Date() })
    .where(eq(offers.id, id))
    .returning()
  await logOfferMail(sent, `Offerte ${offerNumber(sent)} gesendet`, `${formatChf(sent.totalCents / 100)} · ${positions.map((p) => p.text).join(', ')}`)
  await syncInquiry(sent, 'offeriert')
  refresh()
  return { ok: true, message: `Offerte an ${saved.email} gesendet` }
}

export async function setOfferStatus(fd: FormData): Promise<ActionState> {
  await requireAdmin()
  const db = requireDb()
  const status = str(fd, 'status') as OfferStatus
  if (!offerStatuses.includes(status)) return { error: 'Unbekannter Status.' }
  const [row] = await db
    .update(offers)
    .set({ status, updatedAt: new Date(), ...(status === 'angenommen' ? { acceptedAt: new Date() } : {}) })
    .where(eq(offers.id, Number(fd.get('id'))))
    .returning()
  if (!row) return { error: 'Offerte nicht gefunden.' }
  if (status === 'angenommen') await syncInquiry(row, 'bestaetigt')
  refresh()
  return { ok: true, message: status === 'angenommen' ? 'Als angenommen markiert – Anfrage ist bestätigt' : 'Status gespeichert' }
}

export async function duplicateOffer(fd: FormData) {
  await requireAdmin()
  const db = requireDb()
  const src = await db.query.offers.findFirst({ where: eq(offers.id, Number(fd.get('id'))) })
  if (!src) return
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, sentAt, viewedAt, acceptedAt, customerNote, status, token, ...copy } = src
  const [row] = await db.insert(offers).values({ ...copy, token: newToken() }).returning({ id: offers.id })
  refresh()
  redirect(`/admin/offerten/${row.id}`)
}

export async function deleteOffer(fd: FormData) {
  await requireAdmin()
  const db = requireDb()
  const id = Number(fd.get('id'))
  const row = await db.query.offers.findFirst({ where: eq(offers.id, id) })
  if (row) {
    await record('offer', id, 'delete', `${offerTitle(row)} gelöscht`, row)
    await db.delete(offers).where(eq(offers.id, id))
  }
  refresh()
  redirect(row?.inquiryId ? `/admin/anfragen/${row.inquiryId}` : '/admin/offerten')
}
