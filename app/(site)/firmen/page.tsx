import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from '@/components/Icons'
import { ContactChips, CtaBand, Faq, ImageHero, JsonLd, SectionHead, breadcrumbJsonLd, faqGroups, faqJsonLd } from '@/components/site/sections'
import { getCategories, getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Firmencatering – Apéro, Lunch & Firmenanlässe',
  description:
    'Firmencatering aus Pfaffnau: Firmenapéro, Teamlunch, Lunch-Boxen für Meetings und Buffets für Jubiläen. Hausgemacht, pünktlich geliefert, Rechnung an Ihre Firma.',
  path: '/firmen',
  image: '/og-firmen.jpg',
  imageAlt: 'AVA Catering – Catering für Firmen & Teams',
})

const occasions = [
  { t: 'Kunden- & Firmenapéro', d: 'Fingerfood, Gebäck und Mezze für Empfänge, Eröffnungen und Kundenanlässe.', img: '/images/apero-tafel.webp', cat: 'apero' },
  { t: 'Meeting & Workshop', d: 'Lunch-Buffet oder einzeln verpackte Lunch-Boxen, bereit zur Mittagspause.', img: '/images/lunch-box.webp', cat: 'lunch' },
  { t: 'Teamlunch & Teamevent', d: 'Gemeinsam essen verbindet: Mezze-Buffet oder ein Thema wie Burger oder Pasta.', img: '/images/mezze-buffet.webp', cat: 'mezze' },
  { t: 'Jubiläum & Weihnachtsapéro', d: 'Ein festliches Buffet mit süssem Abschluss für die ganze Belegschaft.', img: '/images/suess-baklava.webp', cat: 'suesses' },
]

const benefits = [
  ['Pünktlich & zuverlässig', 'Abgestimmte Lieferzeit, damit alles bereitsteht, wenn Ihre Gäste kommen.'],
  ['Rechnung an die Firma', 'Offerte und Rechnung auf Ihr Unternehmen, transparent und ohne Überraschungen.'],
  ['Eine Ansprechperson', 'Sie planen direkt mit Dilsah: kurze Wege und schnelle Antworten.'],
  ['Für jede Ernährung', 'Vegetarisch, vegan, halal, glutenfrei oder laktosefrei: sauber beschriftet.'],
]

export default async function FirmenPage() {
  const [s, cats] = await Promise.all([getSettings(), getCategories()])
  const featured = cats.filter((c) => ['apero', 'lunch', 'mezze'].includes(c.slug))
  const faq = faqGroups.find((g) => g.title === 'Für Firmen')!.items.concat(faqGroups[0].items[2], faqGroups[1].items[1])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Für Firmen', path: '/firmen' }], siteUrl())} />
      <JsonLd data={faqJsonLd(faq)} />
      <ImageHero
        crumbs={[{ href: '/firmen', label: 'Für Firmen' }]}
        eyebrow="Firmencatering"
        title="Catering, das Ihr *Team* begeistert."
        text="Vom Kundenapéro bis zum Teamlunch: hausgemachte Buffets und Lunch-Boxen für Unternehmen in Pfaffnau, im Luzerner Hinterland und in der Region Aargau/Solothurn."
        image="/images/lunch-set.webp"
        imageAlt="Lunch-Buffet für ein Firmenmeeting"
      >
        <div data-reveal style={{ '--d': '240ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/anfrage?anlass=Firmenap%C3%A9ro%20%26%20Empfang" className="btn btn-primary">
            Firmenanfrage starten <ArrowRight className="size-4" />
          </Link>
          <Link href="/angebot/lunch" className="btn btn-secondary">
            Lunch-Angebot ansehen
          </Link>
        </div>
      </ImageHero>

      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x">
          <SectionHead eyebrow="Anlässe" title="Für jeden Termin im *Kalender*." text="Ob 10 oder 120 Gäste: Wir stellen Auswahl und Mengen passend zu Ihrem Anlass zusammen." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map((o, i) => (
              <Link key={o.t} href={`/angebot/${o.cat}`} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="group overflow-hidden rounded-[1.75rem] bg-white/80">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={o.img} alt="" fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h3 className="text-olive-deep font-serif text-[1.6rem] leading-tight">{o.t}</h3>
                  <p className="text-muted mt-2 text-[0.95rem] leading-relaxed">{o.d}</p>
                </div>
              </Link>
            ))}
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

      <section className="bg-olive-deep grain relative overflow-hidden py-20 lg:py-28">
        <div className="container-x relative">
          <SectionHead light eyebrow="Beliebt bei Firmen" title="Drei Buffets, die *immer* passen." />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {featured.map((c, i) => (
              <Link key={c.slug} href={`/angebot/${c.slug}`} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[1.75rem] p-7">
                {c.image && <Image src={c.image} alt={c.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-[1.4s] ease-(--ease-soft) group-hover:scale-[1.06]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0" />
                <div className="relative">
                  <p className="text-orange-soft text-xs tracking-[0.25em] uppercase">{c.subtitle}</p>
                  <h3 className="text-cream mt-2 font-serif text-[2.2rem] leading-tight">{c.title}</h3>
                  <span className="text-cream mt-4 inline-flex items-center gap-2 text-sm">
                    Details <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
              {['Offerte innert kurzer Zeit', 'Unverbindlich und kostenlos', 'Auch wiederkehrende Lunches'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="text-orange size-4" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Faq items={faq} />
        </div>
      </section>

      <CtaBand s={s} title="Planen Sie Ihren nächsten *Firmenanlass*." />
    </>
  )
}
