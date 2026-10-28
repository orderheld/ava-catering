'use client'

import { useRef, useState } from 'react'
import { saveOffer } from '@/app/admin/offer-actions'
import { formatAmount, lineTotal, offerTotal, offerUnits, parseAmount, type OfferPosition, type OfferUnit } from '@/lib/offer'
import type { Suggestion } from '@/lib/offers'
import { cn } from '@/lib/utils'
import { ActionForm, SubmitButton } from './forms'

type Customer = {
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  eventType: string | null
  eventDate: string | null
  eventTime: string | null
  guests: number | null
  location: string | null
  intro: string | null
  notes: string | null
  validUntil: string | null
}

// Im Formular als Text, damit «12,50» beim Tippen nicht springt
type Row = { key: number; text: string; detail: string; qty: string; unit: OfferUnit; price: string }

let nextKey = 1
const toRow = (p: Partial<OfferPosition> & { text: string }, guests: number | null): Row => ({
  key: nextKey++,
  text: p.text,
  detail: p.detail ?? '',
  qty: String(p.qty ?? (p.unit === 'person' || !p.unit ? guests ?? 1 : 1)),
  unit: p.unit ?? 'person',
  price: p.price ? String(p.price) : '',
})
const toPosition = (r: Row): OfferPosition => ({ text: r.text.trim(), detail: r.detail.trim() || undefined, qty: parseAmount(r.qty), unit: r.unit, price: parseAmount(r.price) })

export function OfferEditor({ id, offer, positions, suggestions, sent }: { id: number; offer: Customer; positions: OfferPosition[]; suggestions: Suggestion[]; sent: boolean }) {
  const [rows, setRows] = useState<Row[]>(() => positions.map((p) => toRow(p, offer.guests)))
  const [guests, setGuests] = useState(offer.guests ? String(offer.guests) : '')
  const [email, setEmail] = useState(offer.email ?? '')
  const [moreCustomer, setMoreCustomer] = useState(Boolean(offer.address))
  const lastAdded = useRef<HTMLInputElement>(null)

  const list = rows.map(toPosition)
  const total = offerTotal(list.filter((p) => p.text))
  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const add = (s?: Suggestion) => {
    setRows((rs) => [...rs, toRow(s ?? { text: '' }, Number(guests) || null)])
    setTimeout(() => lastAdded.current?.focus(), 30)
  }
  const move = (i: number, dir: number) =>
    setRows((rs) => {
      const j = i + dir
      if (j < 0 || j >= rs.length) return rs
      const copy = [...rs]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  // Personenzahl ändern: Positionen «pro Person» mit der bisherigen Zahl gleich mitändern
  const changeGuests = (v: string) => {
    const old = guests
    setGuests(v)
    if (v && old) setRows((rs) => rs.map((r) => (r.unit === 'person' && r.qty === old ? { ...r, qty: v } : r)))
  }

  const used = new Set(rows.map((r) => r.text.trim().toLowerCase()))
  const quick = suggestions.filter((s) => !used.has(s.text.toLowerCase()))

  return (
    <ActionForm action={saveOffer} className="space-y-6">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="positions" value={JSON.stringify(list)} />

      <Section n={1} title="Für wen?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={offer.name} required autoComplete="off" />
          <Field label="Firma" name="company" defaultValue={offer.company} placeholder="optional" />
          <Field label="E-Mail" name="email" type="email" value={email} onChange={setEmail} inputMode="email" />
          <Field label="Telefon" name="phone" defaultValue={offer.phone} type="tel" />
          {moreCustomer ? (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">Adresse (für die Rechnung)</label>
              <textarea id="address" name="address" rows={2} defaultValue={offer.address ?? ''} className="field resize-y" placeholder="Strasse, PLZ Ort" />
            </div>
          ) : (
            <button type="button" onClick={() => setMoreCustomer(true)} className="text-olive hover:text-orange justify-self-start text-sm">+ Adresse erfassen</button>
          )}
        </div>
      </Section>

      <Section n={2} title="Anlass">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <Field label="Anlass" name="eventType" defaultValue={offer.eventType} placeholder="z.B. Firmenapéro" />
          </div>
          <Field label="Datum" name="eventDate" type="date" defaultValue={offer.eventDate} />
          <Field label="Zeit" name="eventTime" defaultValue={offer.eventTime} placeholder="z.B. 18:00" />
          <div>
            <label className="label" htmlFor="guests">Personen</label>
            <input id="guests" name="guests" inputMode="numeric" value={guests} onChange={(e) => changeGuests(e.target.value.replace(/\D/g, ''))} className="field" />
          </div>
          <div className="col-span-2 sm:col-span-2">
            <Field label="Ort" name="location" defaultValue={offer.location} />
          </div>
        </div>
      </Section>

      <Section n={3} title="Was wird offeriert?">
        {rows.length === 0 && <p className="text-muted mb-4">Noch keine Positionen – unten antippen oder «Eigene Position» wählen.</p>}
        <ul className="space-y-3">
          {rows.map((r, i) => {
            const p = toPosition(r)
            return (
              <li key={r.key} className="border-line bg-cream/60 rounded-2xl border p-3.5 sm:p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      ref={i === rows.length - 1 ? lastAdded : undefined}
                      value={r.text}
                      onChange={(e) => update(r.key, { text: e.target.value })}
                      placeholder="Bezeichnung, z.B. Apéro-Buffet"
                      aria-label="Bezeichnung"
                      className="field !py-2.5 font-medium"
                    />
                    <input
                      value={r.detail}
                      onChange={(e) => update(r.key, { detail: e.target.value })}
                      placeholder="Beschreibung (optional), z.B. 6 Sorten, davon 3 vegetarisch"
                      aria-label="Beschreibung"
                      className="field !py-2 text-sm"
                    />
                  </div>
                  <div className="flex shrink-0 flex-col">
                    <IconButton label="Entfernen" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} className="hover:bg-red-50 hover:text-red-700">✕</IconButton>
                    {i > 0 && <IconButton label="Nach oben" onClick={() => move(i, -1)}>↑</IconButton>}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  {r.unit !== 'pauschal' && (
                    <label className="w-20">
                      <span className="text-muted text-xs">Menge</span>
                      <input value={r.qty} onChange={(e) => update(r.key, { qty: e.target.value })} inputMode="decimal" className="field !px-3 !py-2.5 text-center" />
                    </label>
                  )}
                  <label className="w-32">
                    <span className="text-muted text-xs">Einheit</span>
                    <select value={r.unit} onChange={(e) => update(r.key, { unit: e.target.value as OfferUnit })} className="field !px-3 !py-2.5">
                      {Object.entries(offerUnits).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className="w-28">
                    <span className="text-muted text-xs">Preis CHF</span>
                    <input value={r.price} onChange={(e) => update(r.key, { price: e.target.value })} inputMode="decimal" placeholder="0.00" className={cn('field !px-3 !py-2.5 text-right', !p.price && 'border-orange/60')} />
                  </label>
                  <p className="text-olive-deep ml-auto pb-2.5 text-right font-medium whitespace-nowrap">{formatAmount(lineTotal(p))}</p>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-5">
          <p className="text-muted mb-2 text-sm">Antippen zum Hinzufügen{quick.some((s) => s.price) ? ' (mit dem zuletzt verwendeten Preis)' : ''}:</p>
          <div className="flex flex-wrap gap-2">
            {quick.map((s) => (
              <button key={s.text} type="button" onClick={() => add(s)} className="border-line hover:border-orange hover:text-orange rounded-full border bg-white px-3.5 py-2 text-[0.95rem]">
                + {s.text}
                {s.price ? <span className="text-muted ml-1.5 text-sm">{formatAmount(s.price)}</span> : null}
              </button>
            ))}
            <button type="button" onClick={() => add()} className="border-olive text-olive hover:bg-olive rounded-full border px-3.5 py-2 text-[0.95rem] hover:text-white">
              + Eigene Position
            </button>
          </div>
        </div>
      </Section>

      <Section n={4} title="Text & Bedingungen">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="intro">Einleitung</label>
            <textarea id="intro" name="intro" rows={4} defaultValue={offer.intro ?? ''} className="field resize-y leading-relaxed" />
          </div>
          <div>
            <label className="label" htmlFor="notes">Bedingungen & Hinweise</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={offer.notes ?? ''} className="field resize-y leading-relaxed" />
            <p className="text-muted mt-1.5 text-xs">Wird bei der nächsten neuen Offerte automatisch übernommen.</p>
          </div>
          <div className="sm:w-60">
            <Field label="Gültig bis" name="validUntil" type="date" defaultValue={offer.validUntil} />
          </div>
        </div>
      </Section>

      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 flex items-center gap-2 rounded-[1.6rem] bg-white/95 p-2 pl-4 sm:p-2.5 sm:pl-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] backdrop-blur md:bottom-4">
        <p className="mr-auto min-w-0 shrink-0 leading-tight whitespace-nowrap">
          <span className="text-muted block text-xs tracking-wider uppercase">Total CHF</span>
          <span className="text-olive-deep font-serif text-xl sm:text-2xl">{formatAmount(total)}</span>
        </p>
        <SubmitButton name="intent" value="save" className="btn-secondary !bg-transparent whitespace-nowrap !px-3.5 sm:!px-6 !text-olive !shadow-none hover:!bg-olive hover:!text-white">Speichern</SubmitButton>
        <SendButton email={email} again={sent} />
      </div>
    </ActionForm>
  )
}

function SendButton({ email, again }: { email: string; again: boolean }) {
  return (
    <SubmitButton pendingText="Wird gesendet …" className="!px-4 whitespace-nowrap sm:!px-6" name="intent" value="send" confirm={email ? `Offerte ${again ? 'nochmals ' : ''}an ${email} senden?` : undefined}>
      Senden
    </SubmitButton>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-line/80 rounded-[1.6rem] border bg-white p-5 sm:p-7">
      <h2 className="text-olive-deep mb-5 flex items-center gap-3 font-serif text-[1.6rem] leading-tight">
        <span className="bg-orange-soft text-orange-deep grid size-8 shrink-0 place-items-center rounded-full font-sans text-base font-semibold">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  name,
  defaultValue,
  value,
  onChange,
  ...rest
}: { label: string; name: string; defaultValue?: string | null; value?: string; onChange?: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'value' | 'onChange'>) {
  const controlled = onChange ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : { defaultValue: defaultValue ?? '' }
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" {...controlled} {...rest} />
    </div>
  )
}

function IconButton({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn('text-muted grid size-10 place-items-center rounded-full text-lg hover:bg-sand', className)}>
      {children}
    </button>
  )
}
