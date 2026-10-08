'use client'

import Image from 'next/image'
import Link from 'next/link'
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Calendar, Check, Phone, Users } from '@/components/Icons'
import { budgetOptions, dietaryOptions, eventTypes, serviceOptions } from '@/lib/content'
import { submitInquiry, type InquiryState } from '@/lib/inquiry'
import { cn, formatDate, telHref } from '@/lib/utils'

type Cat = { slug: string; title: string; subtitle: string; image: string }
type Props = {
  categories: Cat[]
  themes: string[]
  blocked: { day: string; note: string | null }[]
  initialOffering?: string
  initialTheme?: string
  initialEventType?: string
  initialGuests?: number
  phone: string
  leadTime: string
}

const steps = ['Anlass', 'Buffet', 'Details', 'Kontakt'] as const

function Tile({
  type,
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: {
  type: 'radio' | 'checkbox'
  name: string
  value: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-4 transition duration-300 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/20',
        checked ? 'border-orange shadow-[0_10px_30px_-18px_rgba(232,101,10,0.9)]' : 'border-line hover:border-olive/40',
        className,
      )}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center border transition',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
          checked ? 'bg-orange border-orange text-white' : 'border-line',
        )}
      >
        {checked && <Check className="size-3.5" />}
      </span>
      {children}
    </label>
  )
}

export function InquiryWizard({ categories, themes, blocked, initialOffering, initialTheme, initialEventType, initialGuests, phone, leadTime }: Props) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [t] = useState(() => Date.now())
  const formRef = useRef<HTMLFormElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const [eventType, setEventType] = useState(initialEventType && (eventTypes as readonly string[]).includes(initialEventType) ? initialEventType : '')
  const [offerings, setOfferings] = useState<string[]>(initialOffering && categories.some((c) => c.slug === initialOffering) ? [initialOffering] : [])
  const [chosenThemes, setThemes] = useState<string[]>(initialTheme && themes.includes(initialTheme) ? [initialTheme] : [])
  const [dietary, setDietary] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(initialGuests && initialGuests > 0 && initialGuests <= 5000 ? Math.round(initialGuests) : 25)
  const [location, setLocation] = useState('')
  const [service, setService] = useState('')
  const [budget, setBudget] = useState('')

  const minDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }, [])
  const blockedHit = blocked.find((b) => b.day === date)

  const toggle = (list: string[], set: (v: string[]) => void, v: string, on: boolean) => set(on ? [...list, v] : list.filter((x) => x !== v))

  useEffect(() => {
    if (state?.fieldErrors) {
      setErrors(state.fieldErrors)
      const keys = Object.keys(state.fieldErrors)
      if (keys.some((k) => ['name', 'email', 'phone', 'consent', 'message', 'company'].includes(k))) setStep(3)
      else if (keys.some((k) => ['eventDate', 'guests', 'location'].includes(k))) setStep(2)
    }
  }, [state])

  useEffect(() => {
    if (state?.ok) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [state?.ok])

  function validate(s: number) {
    const e: Record<string, string> = {}
    if (s === 0 && !eventType) e.eventType = 'Bitte wählen Sie einen Anlass.'
    if (s === 1 && offerings.length === 0) e.offerings = 'Bitte wählen Sie mindestens ein Buffet – oder «Noch unsicher».'
    if (s === 3) {
      const fd = new FormData(formRef.current!)
      if (String(fd.get('name') ?? '').trim().length < 2) e.name = 'Bitte Ihren Namen angeben'
      if (!/^\S+@\S+\.\S+$/.test(String(fd.get('email') ?? '').trim())) e.email = 'Bitte eine gültige E-Mail-Adresse angeben'
      if (String(fd.get('phone') ?? '').trim().length < 6) e.phone = 'Für Rückfragen zu Ihrem Anlass'
      if (!fd.get('consent')) e.consent = 'Bitte bestätigen Sie die Datenschutzhinweise'
    }
    if (s === 2) {
      if (!date) e.eventDate = 'Bitte geben Sie ein Datum an.'
      if (!guests || guests < 1) e.guests = 'Bitte Personenzahl angeben.'
      if (!service) e.service = 'Bitte wählen Sie Abholung oder Lieferung.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validate(step)) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function back() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (state?.ok) {
    return (
      <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-28 py-10 text-center">
        <div className="bg-olive text-cream mx-auto grid size-24 place-items-center rounded-full">
          <Check className="size-10" />
        </div>
        <h2 className="display text-olive-deep mt-10 text-[clamp(2.6rem,6vw,4.6rem)]">
          Danke{state.name ? `, ${state.name}` : ''}! <em>Wir freuen uns.</em>
        </h2>
        <p className="text-muted mt-6 text-lg leading-relaxed">
          Ihre Anfrage ist angekommen. Sie erhalten gleich eine Bestätigung per E-Mail. Dilsah meldet sich in der Regel innerhalb von zwei Arbeitstagen mit einem persönlichen Angebot.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-secondary">Zur Startseite</Link>
          <Link href="/galerie" className="btn btn-primary">Galerie ansehen <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    )
  }

  const err = (k: string) => errors[k] && <p className="text-orange-deep mt-2 text-sm">{errors[k]}</p>
  const catTitle = (slug: string) => categories.find((c) => c.slug === slug)?.title ?? (slug === 'unsicher' ? 'Noch unsicher – gerne beraten' : slug)

  return (
    <div ref={topRef} className="grid scroll-mt-28 gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
      <form
        ref={formRef}
        noValidate
        className="min-w-0"
        onSubmit={(e) => {
          // Eigenes Submit statt form action: so bleiben Eingaben bei einem Fehler erhalten
          e.preventDefault()
          if (step < steps.length - 1) return next()
          if (!validate(step)) return
          const fd = new FormData(e.currentTarget)
          startTransition(() => action(fd))
        }}
      >
        <input type="hidden" name="kind" value="anfrage" />
        <input type="hidden" name="t" value={t} />
        <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
          <label>
            Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Fortschritt */}
        <ol className="mb-12 grid grid-cols-4 gap-2">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="group w-full text-left disabled:cursor-default"
                aria-current={i === step ? 'step' : undefined}
              >
                <span className="bg-line block h-[3px] overflow-hidden rounded-full">
                  <span className={cn('bg-orange block h-full rounded-full transition-all duration-700 ease-(--ease-soft)', i <= step ? 'w-full' : 'w-0')} />
                </span>
                <span className={cn('mt-3 flex items-center gap-2 text-xs tracking-[0.18em] uppercase sm:text-[0.8rem]', i === step ? 'text-orange' : i < step ? 'text-olive' : 'text-muted/60')}>
                  <span className="hidden font-serif text-base tracking-normal italic sm:inline">0{i + 1}</span>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* Schritt 1 – Anlass */}
        <fieldset className={cn(step !== 0 && 'hidden')}>
          <legend className="display text-olive-deep text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Was dürfen wir für Sie <em>feiern?</em>
          </legend>
          <p className="text-muted mt-3">Wählen Sie den Anlass, der am besten passt.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((e) => (
              <Tile key={e} type="radio" name="eventType" value={e} checked={eventType === e} onChange={() => setEventType(e)}>
                <span className="text-[1.02rem]">{e}</span>
              </Tile>
            ))}
          </div>
          {err('eventType')}
        </fieldset>

        {/* Schritt 2 – Buffet */}
        <fieldset className={cn(step !== 1 && 'hidden')}>
          <legend className="display text-olive-deep text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Was darf auf den <em>Tisch?</em>
          </legend>
          <p className="text-muted mt-3">Mehrfachauswahl möglich – Kombinationen sind ausdrücklich erwünscht.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {categories.map((c) => {
              const on = offerings.includes(c.slug)
              return (
                <label
                  key={c.slug}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border bg-white p-2.5 pr-4 transition duration-300 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/20',
                    on ? 'border-orange shadow-[0_10px_30px_-18px_rgba(232,101,10,0.9)]' : 'border-line hover:border-olive/40',
                  )}
                >
                  <input type="checkbox" name="offerings" value={c.slug} checked={on} onChange={(e) => toggle(offerings, setOfferings, c.slug, e.target.checked)} className="sr-only" />
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                    {c.image && <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-olive-deep block font-serif text-xl leading-tight">{c.title}</span>
                    <span className="text-muted block text-sm">{c.subtitle}</span>
                  </span>
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border transition', on ? 'bg-orange border-orange text-white' : 'border-line')}>
                    {on && <Check className="size-3.5" />}
                  </span>
                </label>
              )
            })}
            <Tile type="checkbox" name="offerings" value="unsicher" checked={offerings.includes('unsicher')} onChange={(on) => toggle(offerings, setOfferings, 'unsicher', on)}>
              <span>
                <span className="block">Noch unsicher</span>
                <span className="text-muted block text-sm">Ich möchte mich beraten lassen</span>
              </span>
            </Tile>
          </div>
          {err('offerings')}

          {offerings.includes('themen-party') && themes.length > 0 && (
            <div className="mt-10">
              <p className="label">Welches Thema?</p>
              <div className="flex flex-wrap gap-2">
                {themes.map((th) => {
                  const on = chosenThemes.includes(th)
                  return (
                    <label key={th} className={cn('cursor-pointer rounded-full border px-4 py-2.5 text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/20', on ? 'bg-orange border-orange text-white' : 'border-line hover:border-olive/40 bg-white')}>
                      <input type="checkbox" name="themes" value={th} checked={on} onChange={(e) => toggle(chosenThemes, setThemes, th, e.target.checked)} className="sr-only" />
                      {th}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-10">
            <p className="label">Ernährungswünsche (optional)</p>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((d) => {
                const on = dietary.includes(d)
                return (
                  <label key={d} className={cn('cursor-pointer rounded-full border px-4 py-2.5 text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/20', on ? 'bg-olive border-olive text-white' : 'border-line hover:border-olive/40 bg-white')}>
                    <input type="checkbox" name="dietary" value={d} checked={on} onChange={(e) => toggle(dietary, setDietary, d, e.target.checked)} className="sr-only" />
                    {d}
                  </label>
                )
              })}
            </div>
          </div>
        </fieldset>

        {/* Schritt 3 – Details */}
        <fieldset className={cn(step !== 2 && 'hidden')}>
          <legend className="display text-olive-deep text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Wann, wo und für <em>wie viele?</em>
          </legend>
          <p className="text-muted mt-3">{leadTime}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="eventDate" className="label">Datum *</label>
              <input id="eventDate" name="eventDate" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="field" aria-invalid={!!errors.eventDate} />
              {err('eventDate')}
              {blockedHit && (
                <p className="bg-orange-soft text-orange-deep mt-2 rounded-xl px-3 py-2 text-sm">
                  An diesem Tag sind wir leider schon ausgebucht{blockedHit.note ? ` (${blockedHit.note})` : ''}. Fragen Sie trotzdem an – wir suchen gerne eine Lösung.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="eventTime" className="label">Uhrzeit</label>
              <input id="eventTime" name="eventTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="guests" className="label">Anzahl Personen *</label>
              <div className="border-line flex items-center rounded-2xl border bg-white">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 5))} className="text-olive hover:text-orange px-5 py-3.5 text-xl" aria-label="5 Personen weniger">−</button>
                <input id="guests" name="guests" type="number" inputMode="numeric" min={1} max={5000} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full min-w-0 [appearance:textfield] bg-transparent py-3.5 text-center text-lg outline-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button type="button" onClick={() => setGuests((g) => g + 5)} className="text-olive hover:text-orange px-5 py-3.5 text-xl" aria-label="5 Personen mehr">+</button>
              </div>
              {err('guests')}
            </div>
            <div>
              <label htmlFor="location" className="label">Ort / PLZ</label>
              <input id="location" name="location" placeholder="z.B. 6264 Pfaffnau" value={location} onChange={(e) => setLocation(e.target.value)} className="field" autoComplete="address-level2" />
            </div>
          </div>
          <div className="mt-8">
            <p className="label">Service *</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {serviceOptions.map((o) => (
                <Tile key={o.value} type="radio" name="service" value={o.value} checked={service === o.value} onChange={() => setService(o.value)}>
                  <span className="text-[0.98rem]">{o.label}</span>
                </Tile>
              ))}
            </div>
            {err('service')}
          </div>
          <div className="mt-8">
            <p className="label">Budget pro Person (optional)</p>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((b) => (
                <label key={b} className={cn('cursor-pointer rounded-full border px-4 py-2.5 text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/20', budget === b ? 'bg-olive border-olive text-white' : 'border-line hover:border-olive/40 bg-white')}>
                  <input type="radio" name="budget" value={b} checked={budget === b} onChange={() => setBudget(b)} className="sr-only" />
                  {b}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Schritt 4 – Kontakt */}
        <fieldset className={cn(step !== 3 && 'hidden')}>
          <legend className="display text-olive-deep text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Wie erreichen wir <em>Sie?</em>
          </legend>
          <p className="text-muted mt-3">Wir melden uns persönlich – keine Werbung, kein Newsletter.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Vor- und Nachname *</label>
              <input id="name" name="name" className="field" autoComplete="name" required aria-invalid={!!errors.name} />
              {err('name')}
            </div>
            <div>
              <label htmlFor="company" className="label">Firma / Verein</label>
              <input id="company" name="company" className="field" autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="email" className="label">E-Mail *</label>
              <input id="email" name="email" type="email" className="field" autoComplete="email" required aria-invalid={!!errors.email} />
              {err('email')}
            </div>
            <div>
              <label htmlFor="phone" className="label">Telefon *</label>
              <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" required aria-invalid={!!errors.phone} />
              {err('phone')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="label">Ihre Nachricht</label>
              <textarea id="message" name="message" rows={5} className="field resize-y" placeholder="Wünsche, Allergien, Ideen zum Thema, Anzahl Kinder …" />
            </div>
          </div>
          <label className="text-muted mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" name="consent" className="accent-orange mt-1 size-4 shrink-0" aria-invalid={!!errors.consent} />
            <span>
              Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden. Mehr in der{' '}
              <Link href="/datenschutz" className="text-orange underline underline-offset-2" target="_blank">Datenschutzerklärung</Link>. *
            </span>
          </label>
          {err('consent')}
        </fieldset>

        {state?.error && !state.ok && <p className="bg-orange-soft text-orange-deep mt-8 rounded-2xl px-4 py-3 text-sm">{state.error}</p>}

        <div className="border-line mt-12 flex items-center justify-between gap-4 border-t pt-8">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn text-olive hover:text-orange !px-0">
              <ArrowLeft className="size-4" /> Zurück
            </button>
          ) : (
            <span />
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="btn btn-primary">
              Weiter <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
              {pending ? 'Wird gesendet …' : 'Anfrage senden'} {!pending && <ArrowRight className="size-4" />}
            </button>
          )}
        </div>
      </form>

      {/* Zusammenfassung */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="bg-olive-deep text-olive-soft grain relative overflow-hidden rounded-[1.75rem] p-7">
          <p className="text-orange-soft text-xs tracking-[0.25em] uppercase">Ihre Anfrage</p>
          <dl className="mt-6 space-y-4 text-[0.95rem]">
            <div>
              <dt className="text-olive-soft/50 text-xs tracking-[0.15em] uppercase">Anlass</dt>
              <dd className="text-cream mt-1 font-serif text-xl">{eventType || '–'}</dd>
            </div>
            <div>
              <dt className="text-olive-soft/50 text-xs tracking-[0.15em] uppercase">Buffet</dt>
              <dd className="text-cream mt-1">{offerings.length ? offerings.map(catTitle).join(', ') : '–'}</dd>
              {chosenThemes.length > 0 && <dd className="text-olive-soft/70 mt-1 text-sm">Thema: {chosenThemes.join(', ')}</dd>}
            </div>
            <div className="flex gap-6">
              <div>
                <dt className="text-olive-soft/50 flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase"><Calendar className="size-3.5" /> Datum</dt>
                <dd className="text-cream mt-1">{date ? formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }) : '–'}</dd>
              </div>
              <div>
                <dt className="text-olive-soft/50 flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase"><Users className="size-3.5" /> Personen</dt>
                <dd className="text-cream mt-1">{step >= 2 ? guests : '–'}</dd>
              </div>
            </div>
            {dietary.length > 0 && (
              <div>
                <dt className="text-olive-soft/50 text-xs tracking-[0.15em] uppercase">Ernährung</dt>
                <dd className="text-cream mt-1">{dietary.join(', ')}</dd>
              </div>
            )}
          </dl>
          <div className="border-olive-soft/15 mt-7 border-t pt-6 text-sm">
            <p>Lieber persönlich?</p>
            <a href={telHref(phone)} className="text-cream hover:text-orange-soft mt-2 inline-flex items-center gap-2 font-serif text-2xl">
              <Phone className="size-4" /> {phone.replace('+41 ', '0')}
            </a>
          </div>
        </div>
        <p className="text-muted mt-5 px-2 text-sm leading-relaxed">Unverbindlich & kostenlos. Sie erhalten ein persönliches Angebot – erst dann entscheiden Sie.</p>
      </aside>
    </div>
  )
}
