import Link from 'next/link'
import { ArrowRight, Check } from '@/components/Icons'
import { QuantityCalculator } from '@/components/site/QuantityCalculator'
import { ContactChips, CtaBand, Faq, ImageHero, JsonLd, PackageCards, RegionBlock, SectionHead, TrustBar, breadcrumbJsonLd, faqGroups, faqJsonLd } from '@/components/site/sections'
import { getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Firmencatering – Apéro, Lunch & Geschäftsanlässe',
  description:
    'Firmencatering aus Pfaffnau: Apéro riche, Business-Lunch, Lunch-Boxen und Buffets für Meetings, Eröffnungen und Kundenevents. Mit Rechnung an Ihre Firma.',
  path: '/firmen',
  image: '/og-firmen.jpg',
  imageAlt: 'AVA Catering – Catering für Firmen & Geschäfte',
})

const audiences = [
  {
    e: 'Büro & Team',
    t: 'Für Ihr Unternehmen',
    d: 'Damit Meetings produktiv bleiben und Feiern in Erinnerung.',
    items: ['Meeting & Workshop', 'Teamlunch', 'Weiterbildung', 'Firmenjubiläum', 'Weihnachtsessen', 'Pensionierung'],
  },
  {
    e: 'Geschäft & Kunden',
    t: 'Für Ihr Geschäft',
    d: 'Ein Buffet, über das Ihre Kundschaft noch lange spricht.',
    items: ['Geschäftseröffnung', 'Kundenapéro', 'Tag der offenen Tür', 'Vernissage & Ausstellung', 'Produktpräsentation', 'Weihnachtsapéro'],
  },
]

const process = [
  ['Anfrage', 'Datum, Ort, Anzahl Gäste und Format angeben. Online in zwei Minuten oder per Telefon.'],
  ['Offerte', 'Sie erhalten eine persönliche Offerte mit Auswahl, Menge und Preis, kostenlos und unverbindlich.'],
  ['Bestätigung', 'Nach Ihrem Okay planen wir Lieferzeit, Allergene und Details. Änderungen nach Absprache.'],
  ['Genuss & Rechnung', 'Frisch geliefert und angerichtet. Die Rechnung geht direkt an Ihre Firma.'],
]

const benefits = [
  ['Pünktlich & zuverlässig', 'Abgestimmte Lieferzeit, damit alles bereitsteht, wenn Ihre Gäste kommen.'],
  ['Rechnung an die Firma', 'Offerte und Rechnung auf Ihr Unternehmen, transparent und ohne Überraschungen.'],
  ['Eine Ansprechperson', 'Sie planen direkt mit Dilsah: kurze Wege und schnelle Antworten.'],
  ['Für jede Ernährung', 'Vegetarisch, vegan, halal, glutenfrei oder laktosefrei: sauber beschriftet.'],
]

export default async function FirmenPage() {
  const s = await getSettings()
  const faq = faqGroups.find((g) => g.title === 'Für Firmen')!.items.concat(faqGroups[0].items[2], faqGroups[1].items[1])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Firmen & Geschäfte', path: '/firmen' }], siteUrl())} />
      <JsonLd data={faqJsonLd(faq)} />
      <ImageHero
        crumbs={[{ href: '/firmen', label: 'Firmen & Geschäfte' }]}
        eyebrow="Firmen & Geschäfte"
        title="Catering, das Ihr *Geschäft* stärkt."
        text="Vom Teamlunch über die Geschäftseröffnung bis zum Kundenapéro: hausgemachte Buffets und Lunch-Boxen für Unternehmen und Geschäfte in Pfaffnau, im Luzerner Hinterland und in der Region Aargau/Solothurn."
        image="/images/lunch-set.webp"
        imageAlt="Lunch-Buffet für ein Firmenmeeting"
      >
        <div data-reveal style={{ '--d': '240ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/anfrage?anlass=Firmenap%C3%A9ro%20%26%20Empfang" className="btn btn-primary">
            Offerte anfragen <ArrowRight className="size-4" />
          </Link>
          <Link href="#mengenrechner" className="btn btn-secondary">
            Menge berechnen
          </Link>
        </div>
      </ImageHero>

      <div className="container-x -mt-4 pb-16 lg:pb-20">
        <TrustBar />
      </div>

      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <SectionHead eyebrow="Für wen" title="Für das *Team*. Für Ihre *Kunden*." />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {audiences.map((a, i) => (
              <div key={a.t} data-reveal style={{ '--d': `${i * 120}ms` } as React.CSSProperties} className={i ? 'bg-olive-deep text-cream rounded-[2rem] p-8 sm:p-10' : 'bg-orange rounded-[2rem] p-8 text-white sm:p-10'}>
                <p className="text-xs tracking-[0.25em] uppercase opacity-80">{a.e}</p>
                <h3 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.8rem)] leading-tight">{a.t}</h3>
                <p className="mt-3 leading-relaxed opacity-85">{a.d}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {a.items.map((it) => (
                    <li key={it} className="rounded-full border border-white/30 px-3.5 py-1.5 text-sm">{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead eyebrow="Pakete für Firmen" title="Das passende Format für *jeden Termin*." text="Vier bewährte Formate als Ausgangspunkt. Auswahl, Menge und Ablauf stimmen wir auf Ihren Anlass ab." />
            <Link data-reveal href="/angebot" className="btn btn-secondary shrink-0 self-start lg:self-auto">
              Alle Buffets <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14">
            <PackageCards />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHead eyebrow="Warum AVA" title="Unkompliziert für Sie, *besonders* für Ihre Gäste." />
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {benefits.map(([t, d], i) => (
              <div key={t} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="border-orange/50 border-l-2 pl-6">
                <dt className="text-olive-deep font-serif text-2xl">{t}</dt>
                <dd className="text-muted mt-2 leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="mengenrechner" className="bg-olive-deep grain relative scroll-mt-24 overflow-hidden py-20 lg:py-28">
        <div className="container-x relative">
          <SectionHead light eyebrow="Mengenrechner" title="Wie viel braucht *Ihr Team*?" text="Wählen Sie das Format und die Anzahl Gäste. Sie sehen sofort unsere Richtmenge und können direkt eine Offerte anfragen." />
          <div data-reveal className="mt-12">
            <QuantityCalculator light />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHead eyebrow="Ablauf" title="In vier Schritten zum *Firmenanlass*." />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(([t, d], i) => (
              <li key={t} data-reveal style={{ '--d': `${i * 100}ms` } as React.CSSProperties} className="border-line relative rounded-[1.75rem] border bg-white/60 p-7">
                <span className="text-orange font-serif text-5xl leading-none italic">0{i + 1}</span>
                <h3 className="text-olive-deep mt-5 font-serif text-[1.6rem] leading-tight">{t}</h3>
                <p className="text-muted mt-2 text-[0.95rem] leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x">
          <RegionBlock s={s} />
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Fragen von Firmen" title="Kurz *beantwortet*." text="Noch etwas offen? Rufen Sie an oder schreiben Sie uns, wir melden uns rasch." />
            <div data-reveal className="mt-8">
              <ContactChips s={s} />
            </div>
            <ul data-reveal className="mt-10 space-y-3">
              {['Persönliche Offerte', 'Unverbindlich und kostenlos', 'Auch wiederkehrende Lunches'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="text-orange size-4" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Faq items={faq} />
        </div>
      </section>

      <CtaBand s={s} title="Planen Sie Ihren nächsten *Geschäftsanlass*." />
    </>
  )
}
