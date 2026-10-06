import Image from 'next/image'
import Link from 'next/link'
import { Accent } from '@/components/Accent'
import { ArrowRight, Phone, Plus, Whatsapp } from '@/components/Icons'
import type { SiteSettings, Theme } from '@/lib/content'
import { cn, telHref } from '@/lib/utils'

export function SectionHead({
  eyebrow,
  title,
  text,
  align = 'left',
  light = false,
  className,
}: {
  eyebrow: string
  title: string
  text?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p data-reveal className={cn('eyebrow', light && '!text-olive-soft', align === 'center' && 'justify-center')}>{eyebrow}</p>
      <h2
        data-reveal
        style={{ '--d': '80ms' } as React.CSSProperties}
        className={cn('display mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)]', light ? 'text-cream' : 'text-olive-deep')}
      >
        <Accent text={title} />
      </h2>
      {text && (
        <p
          data-reveal
          style={{ '--d': '160ms' } as React.CSSProperties}
          className={cn('mt-6 text-lg leading-relaxed', light ? 'text-olive-soft/80' : 'text-muted', align === 'center' && 'mx-auto max-w-2xl')}
        >
          {text}
        </p>
      )}
    </div>
  )
}

/** Dekorative orange Linie – der rote Faden der Website. */
export function Thread({ d, className, viewBox = '0 0 1200 400', width = 1.5 }: { d: string; className?: string; viewBox?: string; width?: number }) {
  return (
    <svg className={cn('thread pointer-events-none absolute', className)} viewBox={viewBox} fill="none" preserveAspectRatio="none" aria-hidden>
      <path d={d} stroke="var(--color-orange)" strokeWidth={width} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function ThemeCards({ themes }: { themes: Theme[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {themes.map((t, i) => (
        <Link
          key={t.title}
          href={`/anfrage?angebot=themen-party&thema=${encodeURIComponent(t.title)}`}
          data-reveal
          style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
          className="group bg-olive relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 sm:aspect-[3/4]"
        >
          {t.image ? (
            <Image src={t.image} alt={t.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
          ) : (
            <div className="from-orange to-orange-deep absolute inset-0 bg-gradient-to-br">
              <span className="text-cream/15 absolute -top-6 -right-4 font-serif text-[11rem] leading-none italic">{t.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="relative">
            <span className="text-orange-soft text-xs tracking-[0.25em]">THEMA 0{i + 1}</span>
            <h3 className="text-cream mt-2 font-serif text-[2rem] leading-tight">{t.title}</h3>
            <p className="text-cream/80 mt-2 max-h-0 overflow-hidden text-sm leading-relaxed opacity-0 transition-all duration-700 ease-(--ease-soft) group-hover:max-h-32 group-hover:opacity-100 max-lg:max-h-32 max-lg:opacity-100">
              {t.description}
            </p>
            <span className="text-cream mt-4 inline-flex items-center gap-2 text-sm">
              Anfragen <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export const faqs = [
  {
    q: 'Wie früh sollte ich anfragen?',
    a: 'Je früher, desto besser – besonders für Wochenenden und grössere Anlässe. Kurzfristige Anfragen prüfen wir gerne, fragen Sie einfach an.',
  },
  {
    q: 'Für wie viele Personen kocht AVA Catering?',
    a: 'Vom kleinen Apéro im Büro bis zum grossen Familienfest. Erzählen Sie uns, was Sie planen, und wir stellen Mengen und Auswahl passend zusammen.',
  },
  {
    q: 'Liefern Sie das Essen auch?',
    a: 'Sie können Ihr Buffet in Pfaffnau abholen oder liefern lassen. Auf Wunsch richten wir vor Ort auch an. Die Details klären wir gemeinsam im Angebot.',
  },
  {
    q: 'Gibt es vegetarische, vegane oder halal Optionen?',
    a: 'Ja. Viele unserer Mezze und Gebäcke sind von Natur aus vegetarisch. Geben Sie Ernährungswünsche und Allergien in der Anfrage an – wir berücksichtigen sie gerne.',
  },
  {
    q: 'Kann ich verschiedene Buffets kombinieren?',
    a: 'Sehr gerne. Ein Apéro mit anschliessendem Mezze-Buffet oder ein Lunch mit süssem Abschluss – jedes Angebot wird individuell für Sie zusammengestellt.',
  },
]

export function Faq() {
  return (
    <div className="divide-line border-line divide-y border-y">
      {faqs.map((f, i) => (
        <details key={f.q} className="group py-2" data-reveal style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
            <span className="text-olive-deep font-serif text-[1.55rem] leading-snug">{f.q}</span>
            <span className="border-line text-orange grid size-10 shrink-0 place-items-center rounded-full border transition duration-500 group-open:rotate-45">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="text-muted max-w-2xl pb-5 leading-relaxed">{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export function CtaBand({ s }: { s: SiteSettings }) {
  return (
    <section className="container-x py-20 lg:py-28">
      <div data-reveal="scale" className="bg-olive-deep grain relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12 lg:py-24">
        <Image src="/images/tafel-gross.webp" alt="" fill sizes="100vw" className="object-cover opacity-20 mix-blend-luminosity" />
        <svg className="thread text-orange absolute inset-0 h-full w-full" viewBox="0 0 1200 500" preserveAspectRatio="none" fill="none" aria-hidden>
          <path d="M-20 470C220 480 330 400 560 430s380 50 540-60 120-250 140-300" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative mx-auto max-w-3xl">
          <p className="eyebrow !text-orange-soft justify-center">Ihr Anlass</p>
          <h2 className="display text-cream mt-6 text-[clamp(2.6rem,6vw,5rem)]">
            Erzählen Sie uns von Ihrem <em>Fest.</em>
          </h2>
          <p className="text-olive-soft/80 mx-auto mt-6 max-w-xl text-lg leading-relaxed">
            In zwei Minuten angefragt, unverbindlich und kostenlos. Sie erhalten ein persönliches Angebot – direkt von Dilsah.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/anfrage" className="btn btn-primary w-full sm:w-auto">
              Anfrage starten <ArrowRight className="size-4" />
            </Link>
            <a href={telHref(s.phone)} className="btn btn-light w-full sm:w-auto">
              <Phone className="size-4" /> {s.phone.replace('+41 ', '0')}
            </a>
            {s.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn text-cream w-full border border-white/25 hover:bg-white/10 sm:w-auto">
                <Whatsapp className="size-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-24">
      <Thread className="-right-10 top-0 h-full w-[70%] opacity-70" viewBox="0 0 800 400" d="M820 -10C640 30 600 140 700 230S760 360 620 410" />
      <div className="container-x relative">
        <p data-reveal className="eyebrow">{eyebrow}</p>
        <h1 data-reveal style={{ '--d': '80ms' } as React.CSSProperties} className="display text-olive-deep mt-6 max-w-4xl text-[clamp(3rem,7vw,6.2rem)]">
          <Accent text={title} />
        </h1>
        {text && (
          <p data-reveal style={{ '--d': '160ms' } as React.CSSProperties} className="text-muted mt-7 max-w-2xl text-lg leading-relaxed">
            {text}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
