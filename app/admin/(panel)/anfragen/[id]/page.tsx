import Link from 'next/link'
import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { deleteInquiry, saveInquiryNotes, updateInquiryStatus } from '@/app/admin/actions'
import { ActionForm, ConfirmButton, SubmitButton } from '@/components/admin/forms'
import { ReplyComposer } from '@/components/admin/ReplyComposer'
import { DbMissing, Panel, StatusBadge, statusMeta } from '@/components/admin/ui'
import { inquiries, inquiryLog, inquiryStatuses } from '@/db/schema'
import { getDb } from '@/lib/db'
import { formatDate, formatDateTime, telHref } from '@/lib/utils'

export const metadata = { title: 'Anfrage' }

export default async function AnfrageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  if (!db) return <DbMissing />
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, Number(id)) })
  if (!inq) notFound()
  const log = await db.select().from(inquiryLog).where(eq(inquiryLog.inquiryId, inq.id)).orderBy(desc(inquiryLog.createdAt))
  const eventLabel = [inq.eventType, inq.eventDate && formatDate(inq.eventDate)].filter(Boolean).join(' am ') || 'Ihre Anfrage'
  const wa = inq.phone ? inq.phone.replace(/\D/g, '').replace(/^0/, '41') : null

  const facts: [string, React.ReactNode][] = [
    ['Anlass', inq.eventType],
    ['Datum', inq.eventDate ? `${formatDate(inq.eventDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${inq.eventTime ? `, ${inq.eventTime} Uhr` : ''}` : null],
    ['Personen', inq.guests],
    ['Ort', inq.location],
    ['Service', inq.service],
    ['Budget p.P.', inq.budget],
    ['Angebot', inq.offerings.join(', ')],
    ['Themen', inq.themes.join(', ')],
    ['Ernährung', inq.dietary.join(', ')],
  ]

  return (
    <>
      <Link href="/admin/anfragen" className="text-muted hover:text-orange text-sm">← Alle Anfragen</Link>
      <div className="mt-4 mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={inq.status} />
            <span className="text-muted text-sm">
              #{inq.id} · {inq.kind === 'kontakt' ? 'Kontaktnachricht' : 'Anfrage'} vom {formatDateTime(inq.createdAt)}
            </span>
          </div>
          <h1 className="text-olive-deep mt-3 font-serif text-4xl sm:text-5xl">{inq.name}</h1>
          {inq.company && <p className="text-muted mt-1 text-lg">{inq.company}</p>}
        </div>
        <form key={inq.status} action={updateInquiryStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={inq.id} />
          <select name="status" defaultValue={inq.status} className="field !w-auto !rounded-full !py-2.5 text-sm">
            {inquiryStatuses.map((s) => (
              <option key={s} value={s}>{statusMeta[s].label}</option>
            ))}
          </select>
          <SubmitButton pendingText="…">Status setzen</SubmitButton>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {inq.kind !== 'kontakt' && (
            <Panel title="Anlass">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {facts
                  .filter(([, v]) => v !== null && v !== undefined && v !== '')
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted text-xs tracking-[0.15em] uppercase">{k}</dt>
                      <dd className="mt-1">{v}</dd>
                    </div>
                  ))}
              </dl>
            </Panel>
          )}
          {inq.message && (
            <Panel title="Nachricht">
              <p className="leading-relaxed whitespace-pre-line">{inq.message}</p>
            </Panel>
          )}
          <Panel title="Antworten">
            <ReplyComposer id={inq.id} firstName={inq.name.split(' ')[0]} eventLabel={eventLabel} status={inq.status} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Kontakt">
            <div className="space-y-3">
              <a href={`mailto:${inq.email}`} className="hover:text-orange block break-all">✉ {inq.email}</a>
              {inq.phone && <a href={telHref(inq.phone)} className="hover:text-orange block">☎ {inq.phone}</a>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {inq.phone && <a href={telHref(inq.phone)} className="btn btn-secondary !px-4 !py-2 text-sm">Anrufen</a>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !px-4 !py-2 text-sm">WhatsApp</a>}
            </div>
          </Panel>
          <Panel title="Interne Notizen">
            <ActionForm key={inq.updatedAt.toISOString()} action={saveInquiryNotes} className="space-y-4">
              <input type="hidden" name="id" value={inq.id} />
              <div>
                <label className="label" htmlFor="offerAmount">Offertbetrag (CHF)</label>
                <input id="offerAmount" name="offerAmount" defaultValue={inq.offerAmount ?? ''} placeholder="z.B. 1'250.–" className="field" />
              </div>
              <div>
                <label className="label" htmlFor="internalNotes">Notizen (nur für Sie sichtbar)</label>
                <textarea id="internalNotes" name="internalNotes" rows={6} defaultValue={inq.internalNotes ?? ''} className="field resize-y" placeholder="Menü, Mengen, Absprachen …" />
              </div>
              <SubmitButton>Speichern</SubmitButton>
            </ActionForm>
          </Panel>
          <Panel title="Verlauf">
            <ol className="border-line space-y-4 border-l pl-5 text-sm">
              {log.map((l) => (
                <li key={l.id} className="relative">
                  <span className="bg-orange absolute top-1.5 -left-[1.42rem] size-2 rounded-full" />
                  <p className="text-muted text-xs">{formatDateTime(l.createdAt)}</p>
                  {l.type === 'status' ? (
                    <p>Status → {statusMeta[l.subject as keyof typeof statusMeta]?.label ?? l.subject}</p>
                  ) : (
                    <details>
                      <summary className="cursor-pointer">E-Mail: {l.subject}</summary>
                      <p className="text-muted mt-2 whitespace-pre-line">{l.body}</p>
                    </details>
                  )}
                </li>
              ))}
              <li className="relative">
                <span className="bg-olive absolute top-1.5 -left-[1.42rem] size-2 rounded-full" />
                <p className="text-muted text-xs">{formatDateTime(inq.createdAt)}</p>
                <p>Anfrage eingegangen</p>
              </li>
            </ol>
          </Panel>
          <form action={deleteInquiry} className="text-right">
            <input type="hidden" name="id" value={inq.id} />
            <ConfirmButton message="Diese Anfrage endgültig löschen?" className="text-muted text-sm hover:text-red-700">
              Anfrage löschen
            </ConfirmButton>
          </form>
        </div>
      </div>
    </>
  )
}
