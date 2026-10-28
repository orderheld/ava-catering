import Link from 'next/link'
import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { deleteInquiry, saveInquiryNotes, updateInquiryStatus } from '@/app/admin/actions'
import { createOffer } from '@/app/admin/offer-actions'
import { OfferBadge } from '@/components/admin/OfferBadge'
import { ActionForm, QuickForm, SubmitButton } from '@/components/admin/forms'
import { ReplyComposer } from '@/components/admin/ReplyComposer'
import { DbMissing, Panel, StatusBadge, statusMeta } from '@/components/admin/ui'
import { inquiries, inquiryLog, inquiryStatuses, offers } from '@/db/schema'
import { getDb } from '@/lib/db'
import { formatChf, offerNumber } from '@/lib/offer'
import { formatDate, formatDateTime, telHref } from '@/lib/utils'

export const metadata = { title: 'Anfrage' }

export default async function AnfrageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  if (!db) return <DbMissing />
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, Number(id)) })
  if (!inq) notFound()
  const [log, offerList] = await Promise.all([
    db.select().from(inquiryLog).where(eq(inquiryLog.inquiryId, inq.id)).orderBy(desc(inquiryLog.createdAt)),
    db.select().from(offers).where(eq(offers.inquiryId, inq.id)).orderBy(desc(offers.createdAt)),
  ])
  const latestOffer = offerList[0]
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
      <Link href="/admin/anfragen" className="text-olive hover:text-orange inline-flex items-center gap-2 py-2">← Alle Anfragen</Link>
      <div className="mt-4 mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={inq.status} />
            <span className="text-muted text-sm">
              #{inq.id} · {inq.kind === 'kontakt' ? 'Kontaktnachricht' : 'Anfrage'} vom {formatDateTime(inq.createdAt)}
            </span>
          </div>
          <h1 className="text-olive-deep mt-3 font-serif text-4xl break-words sm:text-5xl">{inq.name}</h1>
          {inq.company && <p className="text-muted mt-1 text-lg">{inq.company}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          {inq.kind !== 'kontakt' &&
            (latestOffer ? (
              <Link href={`/admin/offerten/${latestOffer.id}`} className="btn btn-primary !py-3.5">
                Offerte öffnen · {formatChf(latestOffer.totalCents / 100)}
              </Link>
            ) : (
              <form action={createOffer}>
                <input type="hidden" name="inquiryId" value={inq.id} />
                <SubmitButton pendingText="Wird erstellt …" className="w-full !py-3.5 sm:w-auto">+ Offerte erstellen</SubmitButton>
              </form>
            ))}
        <QuickForm key={inq.status} action={updateInquiryStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={inq.id} />
          <select name="status" defaultValue={inq.status} className="field !w-auto min-w-0 flex-1 !rounded-full !py-3">
            {inquiryStatuses.map((s) => (
              <option key={s} value={s}>{statusMeta[s].label}</option>
            ))}
          </select>
          <SubmitButton pendingText="…" className="btn-secondary !bg-transparent !text-olive !shadow-none hover:!bg-olive hover:!text-white">Status setzen</SubmitButton>
        </QuickForm>
        </div>
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
              <p className="leading-relaxed break-words whitespace-pre-line">{inq.message}</p>
            </Panel>
          )}
          <Panel title="Antworten">
            <ReplyComposer id={inq.id} firstName={inq.name.split(' ')[0]} eventLabel={eventLabel} status={inq.status} />
          </Panel>
        </div>

        <div className="space-y-6">
          {offerList.length > 0 && (
            <Panel
              title="Offerten"
              actions={
                <form action={createOffer}>
                  <input type="hidden" name="inquiryId" value={inq.id} />
                  <button className="text-orange text-sm">+ Weitere Offerte</button>
                </form>
              }
            >
              <ul className="divide-line -my-3 divide-y">
                {offerList.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/offerten/${o.id}`} className="hover:bg-sand/50 -mx-3 flex items-center justify-between gap-3 rounded-xl px-3 py-3">
                      <span>
                        <span className="block font-medium">{formatChf(o.totalCents / 100)}</span>
                        <span className="text-muted text-sm">Nr. {offerNumber(o)}</span>
                      </span>
                      <OfferBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          <Panel title="Kontakt">
            <div className="space-y-3">
              <a href={`mailto:${inq.email}`} className="hover:text-orange block break-all">✉ {inq.email}</a>
              {inq.phone && <a href={telHref(inq.phone)} className="hover:text-orange block">☎ {inq.phone}</a>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {inq.phone && <a href={telHref(inq.phone)} className="btn btn-secondary !px-5 !py-3">Anrufen</a>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary !px-5 !py-3">WhatsApp</a>}
              <a href={`mailto:${inq.email}`} className="btn btn-secondary !px-5 !py-3">E-Mail</a>
            </div>
          </Panel>
          <Panel title="Interne Notizen">
            <ActionForm key={inq.id} action={saveInquiryNotes} className="space-y-4">
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
          <QuickForm action={deleteInquiry} confirm="Diese Anfrage löschen? (Im Verlauf wiederherstellbar)" className="text-right">
            <input type="hidden" name="id" value={inq.id} />
            <button className="text-muted rounded-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700">Anfrage löschen</button>
          </QuickForm>
        </div>
      </div>
    </>
  )
}
