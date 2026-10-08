'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from '@/components/Icons'
import { quantityGuide } from '@/lib/content'
import { cn } from '@/lib/utils'

const fmt = (n: number) => new Intl.NumberFormat('de-CH').format(n)

/** Mengenrechner: Richtwerte für Häppchen/Portionen nach Anlass und Gästezahl. */
export function QuantityCalculator({ light = false }: { light?: boolean }) {
  const [kind, setKind] = useState<(typeof quantityGuide)[number]['key']>('apero')
  const [guests, setGuests] = useState(30)
  const g = quantityGuide.find((q) => q.key === kind)!
  const min = g.min * guests
  const max = g.max * guests
  const href = `/anfrage?anlass=${encodeURIComponent(g.anlass)}&angebot=${g.angebot}&personen=${guests}`

  return (
    <div className={cn('grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.25fr_1fr]', light ? 'bg-white/[0.06] ring-1 ring-white/15' : 'border-line border bg-white/80')}>
      <div className="p-7 sm:p-10">
        <fieldset>
          <legend className={cn('text-xs font-medium tracking-[0.22em] uppercase', light ? 'text-olive-soft/80' : 'text-muted')}>1 · Art des Anlasses</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {quantityGuide.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => setKind(q.key)}
                aria-pressed={kind === q.key}
                className={cn(
                  'rounded-full border px-4 py-2.5 text-left text-sm transition',
                  kind === q.key
                    ? 'bg-orange border-orange text-white'
                    : light
                      ? 'text-cream border-white/20 hover:border-white/50'
                      : 'border-line text-olive hover:border-orange',
                )}
              >
                {q.label}
                <span className={cn('ml-1.5 text-xs', kind === q.key ? 'text-white/80' : 'opacity-60')}>{q.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-9">
          <label htmlFor="calc-guests" className={cn('text-xs font-medium tracking-[0.22em] uppercase', light ? 'text-olive-soft/80' : 'text-muted')}>
            2 · Anzahl Gäste
          </label>
          <div className="mt-4 flex items-center gap-5">
            <input
              id="calc-guests"
              type="range"
              min={10}
              max={120}
              step={5}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="accent-orange h-2 w-full cursor-pointer"
            />
            <output htmlFor="calc-guests" className={cn('w-16 shrink-0 text-right font-serif text-4xl tabular-nums', light ? 'text-cream' : 'text-olive-deep')}>
              {guests}
            </output>
          </div>
          <div className={cn('mt-1 flex justify-between text-xs', light ? 'text-olive-soft/60' : 'text-muted')}>
            <span>10</span>
            <span>120 Gäste</span>
          </div>
        </div>
      </div>
      <div className={cn('flex flex-col justify-between p-7 sm:p-10', light ? 'bg-orange text-white' : 'bg-olive-deep text-cream')}>
        <div aria-live="polite">
          <p className="text-xs font-medium tracking-[0.22em] uppercase opacity-80">Unsere Empfehlung</p>
          <p className="mt-4 font-serif text-[clamp(3rem,6vw,4.6rem)] leading-none tabular-nums">
            {min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`}
          </p>
          <p className="mt-2 text-lg">
            {g.unit} für {guests} Gäste
          </p>
          <p className="mt-5 text-sm leading-relaxed opacity-80">
            {g.min === g.max ? '1 Portion pro Person' : `${g.min}–${g.max} ${g.unit} pro Person`}. Richtwert aus der Praxis, die genaue Menge und den Preis erhalten Sie in Ihrer persönlichen Offerte.
          </p>
        </div>
        <Link href={href} className={cn('btn mt-8 w-full', light ? 'bg-white text-olive-deep hover:bg-cream' : 'btn-primary')}>
          Offerte für {guests} Gäste <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
