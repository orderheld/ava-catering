import Link from 'next/link'
import { and, asc, gte, lte, ne } from 'drizzle-orm'
import { addBlockedDate, removeBlockedDate } from '@/app/admin/actions'
import { ActionForm, SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle, Panel, statusMeta } from '@/components/admin/ui'
import { blockedDates, inquiries } from '@/db/schema'
import { getDb } from '@/lib/db'
import { cn, formatDate } from '@/lib/utils'

export const metadata = { title: 'Kalender' }

const pad = (n: number) => String(n).padStart(2, '0')

export default async function KalenderPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams
  const db = getDb()
  if (!db) return (<><PageTitle title="Kalender" /><DbMissing /></>)

  const now = new Date()
  const [y, mo] = m && /^\d{4}-\d{2}$/.test(m) ? m.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
  const first = `${y}-${pad(mo)}-01`
  const daysInMonth = new Date(y, mo, 0).getDate()
  const last = `${y}-${pad(mo)}-${pad(daysInMonth)}`
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${pad(mo - 1)}`
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${pad(mo + 1)}`
  const offset = (new Date(y, mo - 1, 1).getDay() + 6) % 7 // Montag zuerst
  const today = now.toISOString().slice(0, 10)

  const [events, blocked, upcomingBlocked] = await Promise.all([
    db.select().from(inquiries).where(and(gte(inquiries.eventDate, first), lte(inquiries.eventDate, last), ne(inquiries.status, 'abgesagt'))).orderBy(asc(inquiries.eventTime)),
    db.select().from(blockedDates).where(and(gte(blockedDates.day, first), lte(blockedDates.day, last))),
    db.select().from(blockedDates).where(gte(blockedDates.day, today)).orderBy(asc(blockedDates.day)),
  ])

  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1
    return d >= 1 && d <= daysInMonth ? `${y}-${pad(mo)}-${pad(d)}` : null
  })

  return (
    <>
      <PageTitle title="Kalender" text="Anlässe aus Anfragen und blockierte Tage. Blockierte Tage sehen Kundinnen und Kunden im Anfrage-Formular als «ausgebucht»." />
      <Panel
        title={formatDate(first, { month: 'long', year: 'numeric' })}
        actions={
          <div className="flex gap-2">
            <Link href={`/admin/kalender?m=${prev}`} className="border-line hover:border-olive grid size-10 place-items-center rounded-full border" aria-label="Vorheriger Monat">‹</Link>
            <Link href="/admin/kalender" className="border-line hover:border-olive rounded-full border px-4 py-2 text-sm">Heute</Link>
            <Link href={`/admin/kalender?m=${next}`} className="border-line hover:border-olive grid size-10 place-items-center rounded-full border" aria-label="Nächster Monat">›</Link>
          </div>
        }
      >
        <div className="text-muted grid grid-cols-7 gap-1 pb-2 text-center text-xs tracking-wider uppercase">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const ev = events.filter((e) => e.eventDate === day)
            const bl = blocked.find((b) => b.day === day)
            return (
              <div key={day} className={cn('min-h-24 rounded-xl border p-1.5 sm:p-2', day === today ? 'border-orange' : 'border-line', bl && 'bg-stone-100')}>
                <p className={cn('text-xs', day === today ? 'text-orange font-semibold' : 'text-muted')}>{Number(day.slice(8))}</p>
                {bl && <p className="mt-1 truncate rounded bg-stone-300/70 px-1 text-[0.65rem]">Blockiert{bl.note ? `: ${bl.note}` : ''}</p>}
                {ev.map((e) => (
                  <Link key={e.id} href={`/admin/anfragen/${e.id}`} className={cn('mt-1 block truncate rounded px-1 py-0.5 text-[0.68rem] leading-tight', statusMeta[e.status].cls)}>
                    {e.eventTime ? `${e.eventTime} ` : ''}
                    {e.company || e.name}
                    {e.guests ? ` · ${e.guests}P` : ''}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Tag blockieren">
          <ActionForm action={addBlockedDate} resetOnSuccess className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-end">
            <div>
              <label className="label" htmlFor="day">Datum</label>
              <input id="day" name="day" type="date" min={today} className="field" required />
            </div>
            <div>
              <label className="label" htmlFor="note">Notiz (optional)</label>
              <input id="note" name="note" placeholder="z.B. Ferien" className="field" />
            </div>
            <SubmitButton>Blockieren</SubmitButton>
          </ActionForm>
        </Panel>
        <Panel title="Blockierte Tage">
          {upcomingBlocked.length === 0 ? (
            <p className="text-muted">Keine blockierten Tage.</p>
          ) : (
            <ul className="divide-line divide-y">
              {upcomingBlocked.map((b) => (
                <li key={b.day} className="flex items-center justify-between py-2.5">
                  <span>
                    {formatDate(b.day, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    {b.note && <span className="text-muted"> · {b.note}</span>}
                  </span>
                  <form action={removeBlockedDate}>
                    <input type="hidden" name="day" value={b.day} />
                    <button className="text-muted hover:text-orange text-sm">Freigeben</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
