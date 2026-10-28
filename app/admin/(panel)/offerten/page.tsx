import Link from 'next/link'
import { desc, eq, sql } from 'drizzle-orm'
import { createOffer } from '@/app/admin/offer-actions'
import { OfferBadge } from '@/components/admin/OfferBadge'
import { SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle } from '@/components/admin/ui'
import { offers } from '@/db/schema'
import { getDb } from '@/lib/db'
import { formatChf, offerNumber, offerStatuses, offerStatusMeta, type OfferStatus } from '@/lib/offer'
import { cn, formatDate } from '@/lib/utils'

export const metadata = { title: 'Offerten' }

export default async function OffertenPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'alle' } = await searchParams
  const db = getDb()
  if (!db) return (<><PageTitle title="Offerten" /><DbMissing /></>)
  const filter = offerStatuses.includes(status as OfferStatus) ? eq(offers.status, status as OfferStatus) : undefined
  const [rows, counts] = await Promise.all([
    db.select().from(offers).where(filter).orderBy(desc(offers.createdAt)).limit(200),
    db.select({ status: offers.status, n: sql<number>`count(*)::int` }).from(offers).groupBy(offers.status),
  ])
  const total = counts.reduce((a, c) => a + c.n, 0)
  const tabs = [{ key: 'alle', label: 'Alle', n: total }, ...offerStatuses.map((s) => ({ key: s, label: offerStatusMeta[s].label, n: counts.find((c) => c.status === s)?.n ?? 0 }))]

  return (
    <>
      <PageTitle title="Offerten" text="Am einfachsten erstellen Sie eine Offerte direkt aus einer Anfrage – Kunde, Anlass und Buffets sind dann schon ausgefüllt.">
        <form action={createOffer}>
          <SubmitButton pendingText="Wird erstellt …">+ Neue Offerte</SubmitButton>
        </form>
      </PageTitle>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/offerten?status=${t.key}`}
            className={cn('shrink-0 rounded-full border px-4 py-2.5 transition', status === t.key ? 'bg-olive border-olive text-white' : 'border-line bg-white hover:border-olive/40')}
          >
            {t.label} <span className="opacity-60">{t.n}</span>
          </Link>
        ))}
      </div>
      <div className="border-line overflow-hidden rounded-3xl border bg-white">
        {rows.length === 0 ? (
          <p className="text-muted p-8 text-center">
            Noch keine Offerten. Öffnen Sie eine <Link href="/admin/anfragen" className="text-orange">Anfrage</Link> und tippen Sie auf «Offerte erstellen».
          </p>
        ) : (
          <ul className="divide-line divide-y">
            {rows.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/offerten/${o.id}`} className="hover:bg-sand/40 active:bg-sand/50 flex items-center gap-4 px-4 py-4 sm:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[1.05rem] font-medium">{o.company || o.name || 'Ohne Namen'}</span>
                    <span className="text-muted block truncate text-sm">
                      {[`Nr. ${offerNumber(o)}`, o.eventType, o.eventDate && formatDate(o.eventDate, { day: 'numeric', month: 'short', year: 'numeric' }), o.guests && `${o.guests} P.`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-olive-deep font-medium whitespace-nowrap">{formatChf(o.totalCents / 100)}</span>
                    <OfferBadge status={o.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
