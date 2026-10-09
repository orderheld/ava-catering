import Link from 'next/link'
import { and, desc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm'
import { DbMissing, PageTitle, StatusBadge, statusMeta } from '@/components/admin/ui'
import { inquiries, inquiryStatuses, type InquiryStatus } from '@/db/schema'
import { getDb } from '@/lib/db'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

export const metadata = { title: 'Anfragen' }

export default async function AnfragenPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = 'alle', q = '' } = await searchParams
  const db = getDb()
  if (!db) return (<><PageTitle title="Anfragen" /><DbMissing /></>)

  const where: SQL[] = []
  if (status === 'offen') where.push(inArray(inquiries.status, ['in_bearbeitung', 'offeriert']))
  else if (inquiryStatuses.includes(status as InquiryStatus)) where.push(eq(inquiries.status, status as InquiryStatus))
  if (q.trim()) {
    const like = `%${q.trim()}%`
    where.push(or(ilike(inquiries.name, like), ilike(inquiries.email, like), ilike(inquiries.company, like), ilike(inquiries.location, like))!)
  }
  const [rows, counts] = await Promise.all([
    db.select().from(inquiries).where(where.length ? and(...where) : undefined).orderBy(desc(inquiries.createdAt)).limit(200),
    db.select({ status: inquiries.status, n: sql<number>`count(*)::int` }).from(inquiries).groupBy(inquiries.status),
  ])
  const count = (s: string) => counts.find((c) => c.status === s)?.n ?? 0
  const total = counts.reduce((a, c) => a + c.n, 0)
  const tabs = [
    { key: 'alle', label: 'Alle', n: total },
    { key: 'neu', label: 'Neu', n: count('neu') },
    { key: 'offen', label: 'In Bearbeitung', n: count('in_bearbeitung') + count('offeriert') },
    { key: 'bestaetigt', label: 'Bestätigt', n: count('bestaetigt') },
    { key: 'erledigt', label: 'Erledigt', n: count('erledigt') },
    { key: 'abgesagt', label: 'Abgesagt', n: count('abgesagt') },
  ]

  return (
    <>
      <PageTitle title="Anfragen" text="Alle Anfragen und Kontaktnachrichten von der Website." />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/anfragen?status=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={cn('shrink-0 rounded-full border px-4 py-2.5 transition', status === t.key ? 'bg-olive border-olive text-white' : 'border-line bg-white hover:border-olive/40')}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </Link>
          ))}
        </div>
        <form className="flex min-w-0 gap-2" action="/admin/anfragen" role="search">
          <input type="hidden" name="status" value={status} />
          <input name="q" type="search" defaultValue={q} placeholder="Suchen: Name, Firma, Ort …" className="field min-w-0 !rounded-full !py-3 lg:!w-72" />
        </form>
      </div>

      <div className="border-line overflow-hidden rounded-3xl border bg-white">
        {rows.length === 0 ? (
          <p className="text-muted p-8 text-center">Keine Anfragen gefunden.</p>
        ) : (
          <>
          <ul className="divide-line divide-y md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/anfragen/${r.id}`} className="active:bg-sand/50 flex items-start gap-3 px-4 py-4">
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-[1.05rem]', r.status === 'neu' && 'font-semibold')}>{r.company || r.name}</span>
                    <span className="text-muted block truncate text-sm">
                      {r.kind === 'kontakt' ? 'Kontaktnachricht' : [r.eventType, r.eventDate && formatDate(r.eventDate, { day: 'numeric', month: 'short' }), r.guests && `${r.guests} P.`].filter(Boolean).join(' · ')}
                    </span>
                    <span className="text-muted/80 block text-xs">Eingang {formatDateTime(r.createdAt)}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
          <table className="hidden w-full text-left md:table">
            <thead className="bg-sand/60 text-muted text-xs tracking-wider uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Kunde</th>
                <th className="px-5 py-3 font-medium">Anlass</th>
                <th className="px-5 py-3 font-medium">Datum Anlass</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Eingang</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {rows.map((r) => (
                <tr key={r.id} className={cn('hover:bg-sand/40 relative transition', r.status === 'neu' && 'font-medium')}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/anfragen/${r.id}`} className="after:absolute after:inset-0">
                      {r.name}
                    </Link>
                    <span className="text-muted block text-xs font-normal">{r.company || r.email}</span>
                  </td>
                  <td className="px-5 py-4">
                    {r.kind === 'kontakt' ? <span className="text-muted">Kontaktnachricht</span> : r.eventType}
                    {r.guests && <span className="text-muted block text-xs font-normal">{r.guests} Personen</span>}
                  </td>
                  <td className="px-5 py-4">{r.eventDate ? formatDate(r.eventDate, { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}</td>
                  <td className="text-muted hidden px-5 py-4 font-normal lg:table-cell">{formatDateTime(r.createdAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
      <p className="text-muted mt-4 text-sm">Ablauf: {Object.values(statusMeta).map((s) => s.label).join(' → ')}</p>
    </>
  )
}
