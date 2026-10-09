import Image from 'next/image'
import Link from 'next/link'
import { Accent } from '@/components/Accent'
import { ArrowRight, Heart, Leaf, Truck } from '@/components/Icons'
import { QuantityCalculator } from '@/components/site/QuantityCalculator'
import { AudienceSplit, CtaBand, Faq, JsonLd, SectionHead, ThemeCards, Thread, TrustBar, faqJsonLd, faqs } from '@/components/site/sections'
import { googleProfile, instagramUrl, occasions, phoneHours, serviceTowns } from '@/lib/content'
import { getCategories, getGallery, getSettings, getThemes } from '@/lib/data'
import { plain, siteUrl } from '@/lib/utils'

export const revalidate = 300

const hotspots = [
  { slug: 'apero', label: 'Apéro', x: 9 },
  { slug: 'mezze', label: 'Mezze', x: 28 },
  { slug: 'lunch', label: 'Lunch', x: 49 },
  { slug: 'themen-party', label: 'Themenbuffet', x: 69 },
  { slug: 'suesses', label: 'Süsses', x: 89 },
]

const steps = [
  { t: 'Anfrage senden', d: 'Anlass, Datum, Personenzahl und Wünsche – in rund zwei Minuten erledigt.' },
  { t: 'Persönliches Angebot', d: 'Dilsah meldet sich mit einem Vorschlag, der zu Ihrem Anlass und Budget passt.' },
  { t: 'Feinschliff', d: 'Gemeinsam stimmen wir Auswahl, Mengen, Allergien und Lieferung ab.' },
  { t: 'Geniessen', d: 'Frisch zubereitet, schön angerichtet – Sie kümmern sich nur noch um Ihre Gäste.' },
]

export default async function HomePage() {
  const [s, cats, themes, gallery] = await Promise.all([getSettings(), getCategories(), getThemes(), getGallery()])
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'AVA Catering',
    description: plain(s.heroText),
    url: siteUrl(),
    image: `${siteUrl()}/og.jpg`,
    logo: `${siteUrl()}/brand/ava-logo.png`,
    telephone: s.phone,
    email: s.email,
    founder: { '@type': 'Person', name: 'Dilsah Sever' },
    servesCuisine: ['Europäisch', 'Mediterran', 'Fingerfood'],
    address: { '@type': 'PostalAddress', streetAddress: s.street, postalCode: s.zip, addressLocality: s.city, addressRegion: 'LU', addressCountry: 'CH' },
    areaServed: serviceTowns.map((name) => ({ '@type': 'City', name })),
    priceRange: 'CHF',
    hasMap: googleProfile.profile,
    sameAs: [googleProfile.profile, instagramUrl(s)],
    ...(phoneHours.length && {
      openingHoursSpecification: phoneHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <Thread
          className="top-[8%] left-0 hidden h-[95%] w-full lg:block"
          viewBox="0 0 1400 800"
          d="M-20 790C260 800 520 760 640 640S760 260 880 150s300-90 420 60"
        />
        <div className="container-x relative grid items-center gap-14 pt-8 pb-20 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:pt-12 lg:pb-28">
          <div>
            <p data-reveal className="eyebrow">{s.heroEyebrow}</p>
            <h1
              data-reveal
              style={{ '--d': '100ms' } as React.CSSProperties}
              className="display text-olive-deep mt-7 text-[clamp(3.4rem,8.4vw,7.4rem)]"
            >
              <Accent text={s.heroTitle} />
            </h1>
            <p data-reveal style={{ '--d': '200ms' } as React.CSSProperties} className="text-muted mt-8 max-w-xl text-lg leading-relaxed sm:text-xl">
              {s.heroText}
            </p>
            <div data-reveal style={{ '--d': '300ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/anfrage" className="btn btn-primary">
                Anfrage starten <ArrowRight className="size-4" />
              </Link>
              <Link href="/angebot" className="btn btn-secondary">
                Angebot entdecken
              </Link>
            </div>
            <ul data-reveal style={{ '--d': '400ms' } as React.CSSProperties} className="text-ink/75 mt-12 grid gap-4 text-[0.92rem] sm:grid-cols-3 sm:gap-6">
              {[
                [Heart, '100 % hausgemacht'],
                [Leaf, 'Europäisch & mediterran'],
                [Truck, 'Abholung oder Lieferung'],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Heart
                return (
                  <li key={label as string} className="flex items-center gap-3">
                    <span className="bg-orange-soft text-orange grid size-9 shrink-0 place-items-center rounded-full">
                      <I className="size-4" />
                    </span>
                    {label as string}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:mr-0">
            <div data-reveal="scale" className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] shadow-[0_40px_80px_-40px_rgba(47,57,22,0.55)]">
              <Image src="/images/mezze-buffet.webp" alt="Mezze-Buffet mit Sarma, Hummus und Kısır" fill priority sizes="(min-width:1024px) 560px, 92vw" className="object-cover" />
            </div>
            <div
              data-reveal
              style={{ '--d': '350ms' } as React.CSSProperties}
              className="border-cream absolute -bottom-8 -left-4 aspect-square w-[38%] overflow-hidden rounded-full border-[6px] shadow-xl sm:-left-10"
            >
              <Image src="/images/gebaeck-simit.webp" alt="Frische Simit" fill sizes="220px" className="object-cover" />
            </div>
            {/* Rotierendes Siegel */}
            <div data-reveal="fade" style={{ '--d': '500ms' } as React.CSSProperties} className="absolute -top-2 -right-2 size-32 sm:-right-6 sm:size-36">
              <svg viewBox="0 0 200 200" className="animate-spin-slow text-olive absolute inset-0" aria-hidden>
                <defs>
                  <path id="seal" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" />
                </defs>
                <circle cx="100" cy="100" r="98" fill="var(--color-cream)" />
                <text fontSize="15.5" letterSpacing="4.2" fill="currentColor" fontFamily="var(--font-jost)">
                  <textPath href="#seal">HAUSGEMACHT · MIT HERZ · AUS PFAFFNAU ·</textPath>
                </text>
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/ava-icon.svg" alt="" className="absolute inset-[26%] size-[48%]" />
            </div>
            <div
              data-reveal
              style={{ '--d': '600ms' } as React.CSSProperties}
              className="bg-cream/95 absolute right-2 bottom-10 max-w-[220px] rounded-2xl p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur sm:-right-8"
            >
              <p className="text-muted text-xs tracking-[0.2em] uppercase">Mit Liebe gemacht von</p>
              <p className="text-olive-deep mt-1 font-serif text-2xl italic">Dilsah Sever</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x pb-20 lg:pb-24">
        <TrustBar />
      </div>

      {/* ───────────── Firmen & Private ───────────── */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <SectionHead eyebrow="Für wen" title="Fürs *Geschäft*. Fürs *Fest*." text="Ob Firmenapéro, Geschäftseröffnung, Teamlunch oder Geburtstag: Wir sind auf Anlässe von rund 10 bis 120 Gästen spezialisiert." />
          <div className="mt-12">
            <AudienceSplit />
          </div>
        </div>
      </section>

      {/* ───────────── Die Tafel (Panorama mit Kapiteln) ───────────── */}
      <section className="relative pt-10 pb-20 lg:pb-28">
        <div className="container-x flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHead eyebrow="Die Tafel" title="Fünf Wege, Ihre Gäste *glücklich* zu machen." />
          <p data-reveal className="text-muted max-w-sm leading-relaxed lg:pb-3">
            Vom ersten Häppchen bis zum süssen Abschluss – tippen Sie auf ein Kapitel und entdecken Sie, was auf den Tisch kommt.
          </p>
        </div>
        <div data-reveal="fade" className="relative mt-12 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="relative aspect-[1921/715] min-w-[980px]">
            <Image src="/images/hero-buffet.webp" alt="Grosses Buffet mit Apéro, Mezze, Lunch, Themenbuffet und Süssem" fill sizes="(min-width:980px) 100vw, 980px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
            {hotspots.map((h, i) => (
              <Link
                key={h.slug}
                href={`/angebot/${h.slug}`}
                className="group absolute bottom-[7%] -translate-x-1/2"
                style={{ left: `${h.x}%` }}
              >
                <span className="bg-cream/90 text-olive-deep group-hover:bg-orange flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2 text-sm font-medium tracking-[0.14em] uppercase shadow-lg backdrop-blur transition group-hover:text-white">
                  <span className="bg-orange relative grid size-7 place-items-center rounded-full text-[0.7rem] tracking-normal text-white group-hover:bg-white group-hover:text-orange">
                    <span className="bg-orange absolute inset-0 animate-ping rounded-full opacity-30" style={{ animationDelay: `${i * 300}ms`, animationDuration: '2.4s' }} />
                    0{i + 1}
                  </span>
                  {h.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <p className="text-muted mt-3 text-center text-xs tracking-[0.2em] uppercase sm:hidden">← Wischen, um alles zu sehen →</p>
      </section>

      {/* ───────────── Angebot ───────────── */}
      <section className="bg-sand/60 relative py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead eyebrow="Unser Angebot" title="Jedes Buffet ein *Kapitel* für sich." text="Kombinierbar, anpassbar und immer frisch: Wählen Sie ein Buffet als Basis – den Rest stimmen wir persönlich ab." />
            <Link data-reveal href="/angebot" className="btn btn-secondary shrink-0 self-start lg:self-auto">
              Alle Details <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-6">
            {cats.map((c, i) => (
              <Link
                key={c.slug}
                href={`/angebot/${c.slug}`}
                data-reveal
                style={{ '--d': `${(i % 3) * 90}ms` } as React.CSSProperties}
                className={`group bg-olive relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[1.75rem] p-7 ${i < 2 ? 'md:col-span-3 md:min-h-[480px]' : 'md:col-span-2'}`}
              >
                {c.image && (
                  <Image src={c.image} alt={c.title} fill sizes={i < 2 ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 33vw, 100vw'} className="object-cover transition duration-[1.4s] ease-(--ease-soft) group-hover:scale-[1.06]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0" />
                <span className="text-cream/90 absolute top-6 left-7 font-serif text-lg italic">0{i + 1}</span>
                <span className="bg-cream/15 text-cream absolute top-5 right-5 grid size-11 place-items-center rounded-full backdrop-blur transition duration-500 group-hover:bg-orange group-hover:rotate-[-45deg]">
                  <ArrowRight className="size-4" />
                </span>
                <div className="relative">
                  <p className="text-orange-soft text-xs tracking-[0.25em] uppercase">{c.subtitle}</p>
                  <h3 className="text-cream mt-2 font-serif text-[2.2rem] leading-tight lg:text-[2.5rem]">{c.title}</h3>
                  <p className="text-cream/80 mt-3 line-clamp-2 max-w-md text-[0.95rem] leading-relaxed">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Themen-Party ───────────── */}
      <section className="bg-olive-deep grain relative overflow-hidden py-20 lg:py-28">
        <Thread className="top-0 right-0 h-full w-1/2 opacity-60" viewBox="0 0 600 600" d="M620 30C420 80 460 260 320 320S60 420 40 620" />
        <div className="container-x relative">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead light eyebrow="Themen-Party-Service" title="Ein Motto. Ein Buffet. *Ein Fest.*" text="Für Teamevents, Geburtstage und Familienfeiern, die ein Thema verdienen. Wählen Sie Ihr Motto – wir sorgen für den Rest." />
          </div>
          <div className="mt-14">
            <ThemeCards themes={themes} />
          </div>
        </div>
      </section>

      {/* ───────────── So funktioniert's ───────────── */}
      <section className="relative py-20 lg:py-28">
        <div className="container-x">
          <SectionHead align="center" eyebrow="So einfach geht's" title="Von der Idee bis zum *vollen Teller*." />
          <div className="relative mt-16">
            <svg className="thread absolute top-7 left-0 hidden h-12 w-full lg:block" viewBox="0 0 1200 48" preserveAspectRatio="none" fill="none" aria-hidden>
              <path d="M40 24C200 -6 300 54 450 24S700 -6 850 24s250 30 320 0" stroke="var(--color-orange)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="0" />
            </svg>
            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {steps.map((st, i) => (
                <li key={st.t} data-reveal style={{ '--d': `${i * 120}ms` } as React.CSSProperties} className="text-center">
                  <span className="bg-cream border-orange/40 text-orange mx-auto grid size-[3.75rem] place-items-center rounded-full border font-serif text-2xl italic">
                    {i + 1}
                  </span>
                  <h3 className="text-olive-deep mt-6 font-serif text-[1.75rem]">{st.t}</h3>
                  <p className="text-muted mx-auto mt-3 max-w-[260px] leading-relaxed">{st.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 text-center">
            <Link href="/anfrage" className="btn btn-primary">
              Jetzt Schritt 1 machen <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Mengenrechner ───────────── */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <SectionHead eyebrow="Mengenrechner" title="Wie viel darf es *sein*?" text="Format wählen, Gäste einstellen und sofort sehen, mit welcher Menge Sie rechnen können." />
          <div data-reveal className="mt-12">
            <QuantityCalculator />
          </div>
        </div>
      </section>

      {/* ───────────── Über uns ───────────── */}
      <section id="ueber-uns" className="bg-sand/60 relative scroll-mt-24 overflow-hidden py-20 lg:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto w-full max-w-[460px]">
            <div data-reveal="scale" className="relative aspect-[9/14] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[0_40px_80px_-40px_rgba(47,57,22,0.6)]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src="/video/mezze.mp4"
                poster="/video/mezze-poster.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Video: Mezze mit Grillgemüse und Caprese-Spiesschen"
              />
            </div>
            <div data-reveal style={{ '--d': '300ms' } as React.CSSProperties} className="border-sand absolute -right-6 -bottom-8 aspect-square w-[42%] overflow-hidden rounded-[1.5rem] border-[6px] shadow-xl sm:-right-12">
              <Image src="/images/gebaeck-zopf.webp" alt="Geflochtenes Hefegebäck" fill sizes="200px" className="object-cover" />
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Über uns" title={s.aboutTitle} />
            <div data-reveal style={{ '--d': '200ms' } as React.CSSProperties} className="text-muted mt-7 space-y-5 text-lg leading-relaxed">
              {s.aboutText.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div data-reveal style={{ '--d': '300ms' } as React.CSSProperties} className="mt-10 flex items-center gap-5">
              <span className="bg-orange h-px w-12" />
              <div>
                <p className="text-olive-deep font-serif text-3xl italic">Dilsah Sever</p>
                <p className="text-muted text-sm tracking-[0.18em] uppercase">Inhaberin & Köchin</p>
              </div>
            </div>
            <Link data-reveal style={{ '--d': '360ms' } as React.CSSProperties} href="/ueber-uns" className="btn btn-secondary mt-10">
              Mehr über uns <ArrowRight className="size-4" />
            </Link>
            <dl data-reveal style={{ '--d': '400ms' } as React.CSSProperties} className="border-line mt-12 grid grid-cols-3 gap-6 border-t pt-8">
              {[
                ['Hausgemacht', 'Teig, Füllungen, Dips'],
                ['Frisch', 'Für jeden Anlass neu'],
                ['Persönlich', 'Direkt von Dilsah'],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="text-olive-deep font-serif text-2xl">{t}</dt>
                  <dd className="text-muted mt-1 text-sm">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────────── Anlässe (Laufband) ───────────── */}
      <section aria-label="Anlässe" className="bg-orange text-cream overflow-hidden py-7">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {occasions.map((o) => (
                <span key={o} className="flex items-center font-serif text-[2.2rem] whitespace-nowrap italic lg:text-[2.8rem]">
                  <span className="px-8">{o}</span>
                  <Leaf className="text-cream/70 size-6" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Galerie ───────────── */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead eyebrow="Galerie" title="Frisch aus der *Küche*." text="Ein Blick auf Buffets, Gebäck und Süsses, die bereits Gäste glücklich gemacht haben." />
            <Link data-reveal href="/galerie" className="btn btn-secondary shrink-0 self-start lg:self-auto">
              Ganze Galerie <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
            {gallery.slice(0, 8).map((g, i) => (
              <figure key={g.src} data-reveal style={{ '--d': `${(i % 4) * 80}ms` } as React.CSSProperties} className="group relative break-inside-avoid overflow-hidden rounded-[1.25rem]">
                <Image src={g.src} alt={g.alt} width={600} height={i % 3 === 0 ? 800 : 600} sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className={`w-full object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105 ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Gut zu wissen" title="Häufige *Fragen*." text={s.leadTime} />
            <Link data-reveal href="/faq" className="btn btn-secondary mt-8">
              Alle Fragen <ArrowRight className="size-4" />
            </Link>
          </div>
          <Faq />
        </div>
        <JsonLd data={faqJsonLd(faqs)} />
      </section>

      <CtaBand s={s} />
    </>
  )
}
