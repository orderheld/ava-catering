import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { deleteOffer, duplicateOffer, setOfferStatus } from '@/app/admin/offer-actions'
import { OfferBadge } from '@/components/admin/OfferBadge'
import { OfferEditor } from '@/components/admin/OfferEditor'
import { QuickForm } from '@/components/admin/forms'
import { DbMissing } from '@/components/admin/ui'
import { offers } from '@/db/schema'
import { getDb } from '@/lib/db'
import { offerNumber } from '@/lib/offer'
import { getSuggestions } from '@/lib/offers'
import { formatDateTime } from '@/lib/utils'

export const metadata = { title: 'Offerte' }

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  if (!db) return <DbMissing />
  const o = await db.query.offers.findFirst({ where: eq(offers.id, Number(id)) })
  if (!o) notFound()
  const suggestions = await getSuggestions()

  const events = [
    o.sentAt && `Gesendet ${formatDateTime(o.sentAt)}`,
    o.viewedAt && `Vom Kunden angesehen ${formatDateTime(o.viewedAt)}`,
    o.acceptedAt && `Angenommen ${formatDateTime(o.acceptedAt)}`,
  ].filter(Boolean)
  const pill = 'border-line hover:border-olive rounded-full border bg-white px-4 py-2.5 text-[0.95rem] transition'

  return (
    <>
      <Link href={o.inquiryId ? `/admin/anfragen/${o.inquiryId}` : '/admin/offerten'} className="text-olive hover:text-orange inline-flex items-center gap-2 py-2">
        ← {o.inquiryId ? 'Zur Anfrage' : 'Alle Offerten'}
      </Link>
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <OfferBadge status={o.status} />
          <span className="text-muted text-sm">Nr. {offerNumber(o)}</span>
        </div>
        <h1 className="text-olive-deep mt-3 font-serif text-4xl break-words sm:text-5xl">Offerte{o.company || o.name ? ` für ${o.company || o.name}` : ''}</h1>
        {events.length > 0 && <p className="text-muted mt-2 text-sm">{events.join(' · ')}</p>}
      </div>

      {o.customerNote && (
        <div className="bg-olive-soft text-olive-deep mb-6 rounded-[1.6rem] p-5">
          <p className="text-sm font-medium">Bemerkung des Kunden beim Annehmen:</p>
          <p className="mt-1 whitespace-pre-line">{o.customerNote}</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <a href={`/offerte/${o.token}`} target="_blank" className={pill}>👁 Kunden-Ansicht / PDF</a>
        {o.status !== 'angenommen' && (
          <QuickForm action={setOfferStatus} confirm="Offerte als angenommen markieren? (z.B. nach Zusage am Telefon)">
            <input type="hidden" name="id" value={o.id} />
            <input type="hidden" name="status" value="angenommen" />
            <button className={pill}>✓ Angenommen</button>
          </QuickForm>
        )}
        {o.status === 'gesendet' && (
          <QuickForm action={setOfferStatus}>
            <input type="hidden" name="id" value={o.id} />
            <input type="hidden" name="status" value="abgelehnt" />
            <button className={pill}>Abgelehnt</button>
          </QuickForm>
        )}
        <QuickForm action={duplicateOffer}>
          <input type="hidden" name="id" value={o.id} />
          <button className={pill}>Kopie erstellen</button>
        </QuickForm>
      </div>

      <OfferEditor
        key={o.updatedAt.toISOString()}
        id={o.id}
        offer={o}
        positions={o.positions}
        suggestions={suggestions}
        sent={Boolean(o.sentAt)}
      />

      <QuickForm action={deleteOffer} confirm="Diese Offerte löschen? (Im Verlauf wiederherstellbar)" className="mt-6 text-right">
        <input type="hidden" name="id" value={o.id} />
        <button className="text-muted rounded-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700">Offerte löschen</button>
      </QuickForm>
    </>
  )
}
