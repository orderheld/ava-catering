import Image from 'next/image'
import Link from 'next/link'
import { Accent } from '@/components/Accent'
import { ArrowRight, Calendar, Check, Heart, Leaf, Mail, Phone, Pin, Plus, Truck, Users, Whatsapp } from '@/components/Icons'
import { businessPackages, serviceTowns, type SiteSettings, type Theme } from '@/lib/content'
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

export type FaqItem = { q: string; a: string }

export const faqGroups: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Anfrage & Planung',
    items: [
      {
        q: 'Wie früh sollte ich anfragen?',
        a: 'Am besten mindestens 7 Tage vor Ihrem Anlass, für Wochenenden und Firmenanlässe gerne früher. Kurzfristige Anfragen prüfen wir trotzdem, fragen Sie einfach an.',
      },
      {
        q: 'Für wie viele Personen kocht AVA Catering?',
        a: 'Wir sind auf Anlässe von rund 10 bis 120 Personen spezialisiert: Firmenapéros, Teamlunches, Geschäftsanlässe, Geburtstage und Feste. Sehr grosse Veranstaltungen mit mehreren hundert Gästen gehören nicht zu unserem Schwerpunkt.',
      },
      {
        q: 'Was kostet ein Buffet?',
        a: 'Der Preis hängt von Auswahl, Personenzahl und Service ab. Nach Ihrer Anfrage erhalten Sie ein transparentes, unverbindliches Angebot. Ihr Budget pro Person können Sie in der Anfrage direkt angeben.',
      },
      {
        q: 'Kann ich verschiedene Buffets kombinieren?',
        a: 'Sehr gerne. Ein Apéro mit anschliessendem Mezze-Buffet oder ein Lunch mit süssem Abschluss: Jedes Angebot wird individuell für Sie zusammengestellt.',
      },
    ],
  },
  {
    title: 'Lieferung & Service',
    items: [
      {
        q: 'Liefern Sie das Essen auch?',
        a: 'Sie können Ihr Buffet in Pfaffnau abholen oder liefern lassen. Auf Wunsch richten wir vor Ort auch an. Die Details klären wir gemeinsam im Angebot.',
      },
      {
        q: 'In welcher Region sind Sie unterwegs?',
        a: 'In Pfaffnau und Umgebung, im Luzerner Hinterland sowie auf Anfrage in den angrenzenden Regionen Aargau und Solothurn, zum Beispiel Zofingen, Willisau, Sursee oder Reiden.',
      },
      {
        q: 'Bringen Sie Geschirr und Besteck mit?',
        a: 'Die Speisen kommen schön angerichtet auf Platten und in Schalen. Ob zusätzlich Geschirr, Besteck oder Servietten nötig sind, besprechen wir gerne im Angebot.',
      },
    ],
  },
  {
    title: 'Speisen & Ernährung',
    items: [
      {
        q: 'Gibt es vegetarische, vegane oder halal Optionen?',
        a: 'Ja. Viele unserer Mezze und Gebäcke sind von Natur aus vegetarisch. Geben Sie Ernährungswünsche und Allergien in der Anfrage an, wir berücksichtigen sie von Anfang an.',
      },
      {
        q: 'Ist wirklich alles hausgemacht?',
        a: 'Ja. Teig, Füllungen, Dips und Gebäck entstehen in Dilsahs Küche in Pfaffnau, frisch für jeden Anlass.',
      },
    ],
  },
  {
    title: 'Für Firmen',
    items: [
      {
        q: 'Stellen Sie Rechnungen an Firmen aus?',
        a: 'Ja, selbstverständlich. Geben Sie in der Anfrage einfach Ihren Firmennamen an. Sie erhalten Angebot und Rechnung auf Ihr Unternehmen.',
      },
      {
        q: 'Gibt es einzeln verpackte Lunch-Boxen?',
        a: 'Ja. Für Meetings, Workshops und Schulungen bereiten wir den Lunch auf Wunsch in einzelnen Boxen zu, praktisch und hygienisch.',
      },
      {
        q: 'Ist ein regelmässiger Lunch für unser Team möglich?',
        a: 'Gerne. Für wiederkehrende Lunches oder Apéros finden wir gemeinsam einen Rhythmus und eine Auswahl, die Abwechslung bringt.',
      },
    ],
  },
]

/** Kurzauswahl für die Startseite. */
export const faqs: FaqItem[] = [faqGroups[0].items[0], faqGroups[0].items[1], faqGroups[1].items[0], faqGroups[2].items[0], faqGroups[0].items[3]]

export function faqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function Faq({ items = faqs }: { items?: FaqItem[] }) {
  return (
    <div className="divide-line border-line divide-y border-y">
      {items.map((f, i) => (
        <details key={f.q} className="group py-2" data-reveal style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
            <span className="text-olive-deep font-serif text-[1.45rem] leading-snug sm:text-[1.55rem]">{f.q}</span>
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

/** Zwei Wege: Firmen und Private. */
export function AudienceSplit() {
  const cards = [
    {
      href: '/firmen',
      eyebrow: 'Firmen & Geschäfte',
      title: 'Apéro, Lunch & *Kundenevents*',
      text: 'Teamlunch, Meeting, Geschäftseröffnung oder Kundenapéro: pünktlich, unkompliziert und mit Rechnung auf Ihre Firma.',
      image: '/images/lunch-set.webp',
      points: ['Lunch-Boxen & Buffets', 'Rechnung an die Firma', 'Lieferung ins Büro'],
    },
    {
      href: '/privat',
      eyebrow: 'Feste & Feiern',
      title: 'Geburtstag, Verein & *Familie*',
      text: 'Vom Geburtstag bis zum Vereins- oder Sommerfest: Sie feiern, wir kümmern uns ums Buffet, hausgemacht und mit Herz.',
      image: '/images/apero-tafel.webp',
      points: ['Themenbuffets für Gross & Klein', 'Vegetarisch & halal möglich', 'Abholung oder Lieferung'],
    },
  ]
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {cards.map((c, i) => (
        <Link
          key={c.href}
          href={c.href}
          data-reveal
          style={{ '--d': `${i * 120}ms` } as React.CSSProperties}
          className="group border-line relative grid overflow-hidden rounded-[2rem] border bg-white/70 transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(47,57,22,0.45)] sm:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto">
            <Image src={c.image} alt="" fill sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 100vw" className="object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
          </div>
          <div className="flex flex-col p-7 sm:p-9">
            <p className="eyebrow">{c.eyebrow}</p>
            <h3 className="display text-olive-deep mt-4 text-[clamp(2rem,3.2vw,2.7rem)]">
              <Accent text={c.title} />
            </h3>
            <p className="text-muted mt-4 leading-relaxed">{c.text}</p>
            <ul className="mt-6 space-y-2 text-[0.95rem]">
              {c.points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <Check className="text-orange size-4 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <span className="text-orange mt-8 inline-flex items-center gap-2 font-medium">
              Mehr erfahren <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

/** Kompakte Kontaktleiste: Telefon, WhatsApp, E-Mail. */
export function ContactChips({ s, light = false }: { s: SiteSettings; light?: boolean }) {
  const cls = light ? 'border-white/20 text-cream hover:bg-white/10' : 'border-line text-olive hover:border-orange hover:text-orange bg-white/60'
  return (
    <div className="flex flex-wrap gap-2.5">
      <a href={telHref(s.phone)} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition', cls)}>
        <Phone className="size-4" /> {s.phone.replace('+41 ', '0')}
      </a>
      {s.whatsapp && (
        <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition', cls)}>
          <Whatsapp className="size-4" /> WhatsApp
        </a>
      )}
      <a href={`mailto:${s.email}`} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition', cls)}>
        <Mail className="size-4" /> {s.email}
      </a>
    </div>
  )
}

export function CtaBand({ s, title = 'Erzählen Sie uns von Ihrem *Anlass.*' }: { s: SiteSettings; title?: string }) {
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
            <Accent text={title} />
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
          <p className="text-olive-soft/70 mt-8 text-sm">
            Lieber per E-Mail?{' '}
            <a href={`mailto:${s.email}`} className="text-cream underline decoration-orange underline-offset-4 hover:text-white">
              {s.email}
            </a>
          </p>
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

/** Hero mit Bild (Unterseiten) und optionaler Breadcrumb. */
export function ImageHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  crumbs,
  children,
}: {
  eyebrow: string
  title: string
  text?: string
  image: string
  imageAlt: string
  crumbs?: { href: string; label: string }[]
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
      <Thread className="top-0 left-0 hidden h-full w-full lg:block" viewBox="0 0 1400 700" d="M-20 680C300 700 520 640 640 520S780 180 900 100s320-60 520 40" />
      <div className="container-x relative">
        {crumbs && (
          <nav aria-label="Brotkrümel" className="text-muted mb-8 text-sm">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-orange">Start</Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden className="text-orange">/</span>
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-ink/80">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-orange">{c.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p data-reveal className="eyebrow">{eyebrow}</p>
            <h1 data-reveal style={{ '--d': '80ms' } as React.CSSProperties} className="display text-olive-deep mt-6 text-[clamp(2.9rem,6.4vw,5.6rem)]">
              <Accent text={title} />
            </h1>
            {text && (
              <p data-reveal style={{ '--d': '160ms' } as React.CSSProperties} className="text-muted mt-7 max-w-xl text-lg leading-relaxed">
                {text}
              </p>
            )}
            {children}
          </div>
          <div data-reveal="scale" className="relative mx-auto aspect-[5/4] w-full max-w-[600px] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] shadow-[0_40px_80px_-40px_rgba(47,57,22,0.55)] sm:aspect-[4/4] lg:mr-0">
            <Image src={image} alt={imageAlt} fill priority sizes="(min-width:1024px) 600px, 92vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], base: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Start', path: '' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  }
}

/** Vertrauensleiste: die wichtigsten Fakten auf einen Blick. */
export function TrustBar({ className }: { className?: string }) {
  const items = [
    { icon: Heart, t: '100 % hausgemacht', d: 'in Pfaffnau LU' },
    { icon: Users, t: '10 bis 120 Gäste', d: 'Firmen, Geschäfte, Feste' },
    { icon: Truck, t: 'Lieferung & Aufbau', d: 'oder Abholung' },
    { icon: Leaf, t: 'Vegi, vegan, halal', d: 'Allergene ausgewiesen' },
    { icon: Calendar, t: 'Offerte kostenlos', d: 'unverbindlich' },
  ]
  return (
    <ul data-reveal className={cn('border-line grid grid-cols-1 gap-px overflow-hidden rounded-[1.75rem] border bg-line sm:grid-cols-2 lg:grid-cols-5', className)}>
      {items.map(({ icon: I, t, d }, i) => (
        <li key={t} className={cn('bg-cream flex items-center gap-3.5 px-5 py-3.5 sm:py-5', i === 4 && 'sm:col-span-2 lg:col-span-1')}>
          <span className="bg-orange-soft text-orange grid size-10 shrink-0 place-items-center rounded-full">
            <I className="size-[1.1rem]" />
          </span>
          <span className="min-w-0">
            <span className="text-olive-deep block text-[0.95rem] leading-tight font-medium">{t}</span>
            <span className="text-muted block text-[0.8rem]">{d}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Firmen-Pakete mit Richtmengen. */
export function PackageCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {businessPackages.map((p, i) => (
        <article key={p.key} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_50px_-36px_rgba(47,57,22,0.6)]">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={p.image} alt="" fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
            <span className="bg-cream/95 text-olive-deep absolute top-4 left-4 rounded-full px-3 py-1 text-xs tracking-[0.12em] uppercase">{p.tag}</span>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="text-olive-deep font-serif text-[1.9rem] leading-tight">{p.title}</h3>
            <p className="text-muted mt-2 text-[0.95rem] leading-relaxed">{p.text}</p>
            <dl className="border-line mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Dauer</dt>
                <dd className="text-right">{p.duration}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Menge</dt>
                <dd className="text-right">{p.amount}</dd>
              </div>
            </dl>
            <Link href={`/anfrage?anlass=${encodeURIComponent(p.anlass)}&angebot=${p.angebot}`} className="text-orange mt-auto inline-flex items-center gap-2 pt-6 font-medium">
              Offerte anfragen <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}

/** Liefergebiet mit Ortsliste (lokale Suche). */
export function RegionBlock({ s }: { s: SiteSettings }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
      <SectionHead eyebrow="Liefergebiet" title="Von Pfaffnau in die *Region*." text={`${s.serviceArea}. Abholung in ${s.city} jederzeit nach Absprache.`} />
      <div data-reveal className="relative">
        <ul className="flex flex-wrap gap-2.5">
          {serviceTowns.map((t) => (
            <li key={t} className={cn('rounded-full border px-4 py-2 text-sm', t === s.city ? 'bg-orange border-orange text-white' : 'border-line text-olive bg-white/60')}>
              {t === s.city && <Pin className="mr-1.5 -mt-0.5 inline size-3.5" />}
              {t}
            </li>
          ))}
          <li className="text-muted px-2 py-2 text-sm italic">… und weitere Orte auf Anfrage</li>
        </ul>
      </div>
    </div>
  )
}
