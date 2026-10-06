import Link from 'next/link'
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { DbMissing, PageTitle, Panel, StatusBadge } from '@/components/admin/ui'
import { inquiries } from '@/db/schema'
import { getDb } from '@/lib/db'
import { formatDate, formatDateTime } from '@/lib/utils'

export default async function Dashboard() {
  const db = getDb()
  if (!db) return (<><PageTitle title="Übersicht" /><DbMissing /></>)

  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 7)}-01`
  const [counts, latest, upcoming] = await Promise.all([
    db
      .select({
        neu: sql<number>`count(*) filter (where ${inquiries.status} = 'neu')::int`,
        offen: sql<number>`count(*) filter (where ${inquiries.status} in ('in_bearbeitung','offeriert'))::int`,
        bestaetigt: sql<number>`count(*) filter (where ${inquiries.status} = 'bestaetigt' and ${inquiries.eventDate} >= ${today})::int`,
        monat: sql<number>`count(*) filter (where ${inquiries.createdAt} >= ${monthStart})::int`,
      })
      .from(inquiries),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(6),
    db
      .select()
      .from(inquiries)
      .where(and(gte(inquiries.eventDate, today), inArray(inquiries.status, ['bestaetigt', 'offeriert', 'in_bearbeitung', 'neu'])))
      .orderBy(asc(inquiries.eventDate))
      .limit(6),
  ])
  const c = counts[0]
  const hour = Number(new Intl.DateTimeFormat('de-CH', { hour: 'numeric', timeZone: 'Europe/Zurich' }).format(new Date()))
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend'

  return (
    <>
      <PageTitle title={`${greet}, Dilsah`} text="Hier sehen Sie auf einen Blick, was ansteht." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Neue Anfragen', value: c.neu, href: '/admin/anfragen?status=neu', accent: true },
          { label: 'In Bearbeitung', value: c.offen, href: '/admin/anfragen?status=offen' },
          { label: 'Bestätigte Events', value: c.bestaetigt, href: '/admin/kalender' },
          { label: 'Anfragen diesen Monat', value: c.monat, href: '/admin/anfragen' },
        ].map((k) => (
          <Link key={k.label} href={k.href} className={`rounded-3xl border p-6 transition hover:-translate-y-0.5 ${k.accent ? 'bg-orange border-orange text-white' : 'border-line bg-white'}`}>
            <p className={`text-xs tracking-[0.15em] uppercase ${k.accent ? 'text-white/80' : 'text-muted'}`}>{k.label}</p>
            <p className={`mt-3 font-serif text-5xl ${k.accent ? '' : 'text-olive-deep'}`}>{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Neueste Anfragen" actions={<Link href="/admin/anfragen" className="text-orange text-sm">Alle →</Link>}>
          {latest.length === 0 ? (
            <p className="text-muted">Noch keine Anfragen – sobald jemand das Formular ausfüllt, erscheint sie hier.</p>
          ) : (
            <ul className="divide-line -my-3 divide-y">
              {latest.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/anfragen/${i.id}`} className="hover:bg-sand/50 -mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{i.name}</span>
                      <span className="text-muted block truncate text-sm">
                        {i.kind === 'kontakt' ? 'Kontaktnachricht' : `${i.eventType ?? 'Anfrage'}${i.guests ? ` · ${i.guests} P.` : ''}`} · {formatDateTime(i.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Nächste Anlässe" actions={<Link href="/admin/kalender" className="text-orange text-sm">Kalender →</Link>}>
          {upcoming.length === 0 ? (
            <p className="text-muted">Keine anstehenden Anlässe.</p>
          ) : (
            <ul className="divide-line -my-3 divide-y">
              {upcoming.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/anfragen/${i.id}`} className="hover:bg-sand/50 -mx-3 flex items-center gap-4 rounded-xl px-3 py-3">
                    <span className="bg-sand text-olive-deep grid w-14 shrink-0 place-items-center rounded-xl py-1.5 text-center leading-tight">
                      <span className="font-serif text-2xl">{formatDate(i.eventDate, { day: '2-digit' })}</span>
                      <span className="text-[0.65rem] tracking-wider uppercase">{formatDate(i.eventDate, { month: 'short' })}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{i.company || i.name}</span>
                      <span className="text-muted block truncate text-sm">
                        {i.eventType} · {i.guests ?? '?'} Personen{i.eventTime ? ` · ${i.eventTime}` : ''}
                      </span>
                    </span>
                    <StatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
