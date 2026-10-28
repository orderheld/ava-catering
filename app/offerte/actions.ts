'use server'

import { and, eq } from 'drizzle-orm'
import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { offers } from '@/db/schema'
import { getDb } from '@/lib/db'
import { sendOfferAccepted } from '@/lib/mail'
import { formatChf, offerNumber } from '@/lib/offer'
import { syncInquiry } from '@/lib/offers'
import { notifyAdmins } from '@/lib/push'

export type AcceptState = { ok?: boolean; error?: string } | null

/** Kundin / Kunde nimmt die Offerte über den Link in der E-Mail an. */
export async function acceptOffer(_prev: AcceptState, fd: FormData): Promise<AcceptState> {
  const db = getDb()
  if (!db) return { error: 'Das hat leider nicht geklappt. Bitte rufen Sie uns an: 078 264 69 62.' }
  const token = String(fd.get('token') ?? '')
  const note = String(fd.get('note') ?? '').trim().slice(0, 2000) || null
  const [o] = await db
    .update(offers)
    .set({ status: 'angenommen', acceptedAt: new Date(), customerNote: note, updatedAt: new Date() })
    .where(and(eq(offers.token, token), eq(offers.status, 'gesendet')))
    .returning()
  if (!o) return { error: 'Diese Offerte kann nicht mehr angenommen werden. Bitte kontaktieren Sie uns: 078 264 69 62.' }
  await syncInquiry(o, 'bestaetigt')
  after(async () => {
    const who = o.company ? `${o.name} (${o.company})` : o.name
    await Promise.all([
      notifyAdmins({
        category: 'offerten',
        title: `Offerte angenommen: ${who}`,
        body: [`${formatChf(o.totalCents / 100)} · Nr. ${offerNumber(o)}`, note].filter(Boolean).join('\n'),
        url: `/admin/offerten/${o.id}`,
        tag: `offerte-${o.id}`,
      }),
      sendOfferAccepted(o).catch((err) => console.error('[offerte] E-Mail nach Annahme fehlgeschlagen:', err)),
    ])
  })
  revalidatePath('/admin', 'layout')
  revalidatePath(`/offerte/${token}`)
  return { ok: true }
}
