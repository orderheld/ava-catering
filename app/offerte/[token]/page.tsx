import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { and, eq, isNull } from 'drizzle-orm'
import { offers } from '@/db/schema'
import { getDb } from '@/lib/db'
import { formatAmount, formatChf, lineTotal, offerNumber, offerUnits } from '@/lib/offer'
import { formatDate, formatDateTime } from '@/lib/utils'
import { AcceptOffer, PrintButton } from './AcceptOffer'

export const metadata: Metadata = { title: 'Ihre Offerte', robots: { index: false, follow: false } }

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date())

/** Offerte für die Kundin / den Kunden: ansehen, als PDF speichern und annehmen (Link aus der E-Mail). */
export default async function OfferView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const db = getDb()
  if (!db || token.length < 16) notFound()
  const o = await db.query.offers.findFirst({ where: eq(offers.token, token) })
  if (!o) notFound()

  // Erstes Öffnen durch den Kunden festhalten (Vorschau aus dem Admin zählt nicht)
  const isAdmin = (await cookies()).has('ava_admin')
  if (!isAdmin && !o.viewedAt && o.status !== 'entwurf') {
    await db.update(offers).set({ viewedAt: new Date() }).where(and(eq(offers.id, o.id), isNull(offers.viewedAt))).catch(() => {})
  }

  const expired = o.status === 'gesendet' && o.validUntil && o.validUntil < today()
  const facts: [string, string | number | null][] = [
    ['Anlass', o.eventType],
    ['Datum', o.eventDate ? `${formatDate(o.eventDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${o.eventTime ? `, ${o.eventTime} Uhr` : ''}` : null],
    ['Personen', o.guests],
    ['Ort', o.location],
  ]

  return (
    <main className="bg-sand min-h-dvh px-3 py-6 sm:px-6 sm:py-12 print:bg-white print:p-0">
      <style>{'@page{size:A4;margin:14mm 16mm}'}</style>
      {o.status === 'entwurf' && (
        <p className="bg-orange-soft text-orange-deep mx-auto mb-4 max-w-3xl rounded-2xl px-5 py-3 text-center print:hidden">
          Vorschau – diese Offerte ist noch ein Entwurf und wurde nicht gesendet.
        </p>
      )}
      <article className="bg-cream text-ink mx-auto max-w-3xl rounded-[1.75rem] p-6 shadow-[0_30px_80px_-40px_rgba(47,57,22,0.45)] sm:p-12 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-orange text-sm font-medium tracking-[0.2em] uppercase">Offerte</p>
            <h1 className="text-olive-deep mt-1 font-serif text-4xl leading-tight sm:text-5xl">Nr. {offerNumber(o)}</h1>
            <p className="text-muted mt-1">vom {formatDate(o.sentAt ?? o.createdAt)}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo.svg" alt="AVA Catering" className="h-16 w-auto self-start sm:h-20" />
        </header>

        <div className="mt-8 grid gap-6 text-[0.95rem] sm:grid-cols-2">
          <div>
            <p className="text-muted text-xs tracking-[0.15em] uppercase">Für</p>
            <p className="mt-1 leading-relaxed whitespace-pre-line">
              {[o.company, o.name, o.address].filter(Boolean).join('\n')}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-muted text-xs tracking-[0.15em] uppercase">Von</p>
            <p className="mt-1 leading-relaxed">
              AVA Catering · Dilsah Sever
              <br />
              Stegmatt 9a, 6264 Pfaffnau
              <br />
              078 264 69 62 · kontakt@avacatering.ch
            </p>
          </div>
        </div>

        {facts.some(([, v]) => v) && (
          <dl className="border-line mt-8 grid gap-x-8 gap-y-3 border-y py-5 sm:grid-cols-2">
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted text-xs tracking-[0.15em] uppercase">{k}</dt>
                  <dd className="mt-0.5">{v}</dd>
                </div>
              ))}
          </dl>
        )}

        {o.intro && <p className="mt-8 leading-relaxed whitespace-pre-line">{o.intro}</p>}

        <table className="mt-8 w-full text-left">
          <thead className="text-muted border-line border-b text-xs tracking-[0.12em] uppercase">
            <tr>
              <th className="pb-2 font-medium">Position</th>
              <th className="hidden pb-2 text-right font-medium sm:table-cell">Menge</th>
              <th className="hidden pb-2 text-right font-medium sm:table-cell">Preis</th>
              <th className="pb-2 text-right font-medium">CHF</th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {o.positions.map((p, i) => (
              <tr key={i} className="align-top break-inside-avoid">
                <td className="py-3.5 pr-4">
                  <p className="font-medium">{p.text}</p>
                  {p.detail && <p className="text-muted text-sm">{p.detail}</p>}
                  <p className="text-muted text-sm sm:hidden">
                    {p.unit === 'pauschal' ? 'pauschal' : `${p.qty} × ${formatAmount(p.price)} ${offerUnits[p.unit]}`}
                  </p>
                </td>
                <td className="hidden py-3.5 pr-4 text-right whitespace-nowrap sm:table-cell">{p.unit === 'pauschal' ? '' : p.qty}</td>
                <td className="text-muted hidden py-3.5 pr-4 text-right whitespace-nowrap sm:table-cell">
                  {p.unit === 'pauschal' ? 'pauschal' : `${formatAmount(p.price)} ${offerUnits[p.unit].replace('pro ', '/ ')}`}
                </td>
                <td className="py-3.5 text-right whitespace-nowrap">{formatAmount(lineTotal(p))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-olive-deep border-t-2">
              <td className="pt-4 font-serif text-2xl" colSpan={1}>Total</td>
              <td className="hidden sm:table-cell" colSpan={2} />
              <td className="text-olive-deep pt-4 text-right font-serif text-2xl whitespace-nowrap">{formatChf(o.totalCents / 100)}</td>
            </tr>
          </tfoot>
        </table>

        {(o.notes || o.validUntil) && (
          <div className="text-muted mt-8 space-y-2 text-sm leading-relaxed">
            {o.notes && <p className="whitespace-pre-line">{o.notes}</p>}
            {o.validUntil && <p>Diese Offerte ist gültig bis {formatDate(o.validUntil)}.</p>}
          </div>
        )}

        <p className="mt-10">
          Herzliche Grüsse
          <br />
          <span className="text-olive-deep font-serif text-2xl">Dilsah Sever</span>
          <br />
          <span className="text-muted text-sm">AVA Catering</span>
        </p>

        <div className="border-line mt-10 space-y-4 border-t pt-8 text-center print:hidden">
          {o.status === 'angenommen' ? (
            <div className="bg-olive rounded-[1.6rem] p-6 text-white">
              <p className="font-serif text-3xl">✓ Angenommen</p>
              <p className="mt-1 text-white/85">{o.acceptedAt ? `am ${formatDateTime(o.acceptedAt)} – ` : ''}vielen Dank für Ihren Auftrag!</p>
            </div>
          ) : o.status === 'gesendet' ? (
            <>
              {expired && <p className="text-orange-deep">Die Gültigkeit dieser Offerte ist abgelaufen. Sie können sie trotzdem annehmen – wir bestätigen dann die Verfügbarkeit.</p>}
              <AcceptOffer token={o.token} />
            </>
          ) : o.status === 'abgelehnt' ? (
            <p className="text-muted">Diese Offerte ist nicht mehr gültig. Für eine neue Offerte melden Sie sich gerne bei uns.</p>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrintButton />
            <a href="tel:+41782646962" className="btn btn-secondary w-full sm:w-auto">Fragen? 078 264 69 62</a>
          </div>
        </div>
      </article>
    </main>
  )
}
