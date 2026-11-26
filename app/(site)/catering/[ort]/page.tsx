import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Phone, Pin, Truck } from '@/components/Icons'
import { CtaBand, Faq, ImageHero, JsonLd, SectionHead, TrustBar, breadcrumbJsonLd, faqJsonLd, type FaqItem } from '@/components/site/sections'
import { getCategories, getSettings } from '@/lib/data'
import { cantonName, distanceText, inquiryHrefFor, regionBySlug, regionOgImage, regions, type Region } from '@/lib/regions'
import { businessId, pageMeta } from '@/lib/seo'
import { siteUrl, telHref } from '@/lib/utils'

export const revalidate = 300
export const dynamicParams = false

type Props = { params: Promise<{ ort: string }> }

export function generateStaticParams() {
  return regions.map((r) => ({ ort: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ort } = await params
  const r = regionBySlug(ort)
  if (!r) return {}
  return pageMeta({
    title: `Catering & Partyservice ${r.name}`,
    description: `Catering in ${r.name} (${r.canton}): hausgemachte Apéros, Firmenlunch, Lunch-Boxen und Buffets für Firmen, Geburtstage und Feste. ${r.km === 0 ? 'Abholung in Pfaffnau.' : 'Lieferung aus Pfaffnau.'} Offerte kostenlos.`,
    path: `/catering/${r.slug}`,
    image: regionOgImage(r),
    imageAlt: `AVA Catering – Catering & Partyservice in ${r.name}`,
  })
}

function regionFaq(r: Region, leadTime: string): FaqItem[] {
  const here = r.km === 0
  return [
    {
      q: here ? `Kann ich mein Buffet in ${r.name} abholen?` : `Liefert AVA Catering nach ${r.name}?`,
      a: here
        ? 'Ja. Unsere Küche ist an der Stegmatt 9a in Pfaffnau. Sie können Ihr Buffet zur abgemachten Zeit abholen oder liefern lassen, auf Wunsch auch mit Aufbau.'
        : `Ja. ${r.name} liegt ${distanceText(r)}. Sie können Ihr Buffet in Pfaffnau abholen oder nach ${r.name} liefern lassen, auf Wunsch mit Aufbau vor Ort. Lieferzeit und Kosten stehen in Ihrer Offerte.`,
    },
    {
      q: `Was kostet Catering in ${r.name}?`,
      a: 'Der Preis hängt von Buffet, Personenzahl und Service ab. Sie erhalten nach Ihrer Anfrage eine kostenlose, unverbindliche Offerte. Ihr Budget pro Person können Sie im Formular angeben.',
    },
    {
      q: `Gibt es Firmenlunch und Lunch-Boxen in ${r.name}?`,
      a: `Ja. Für Meetings, Schulungen und Teamlunches in ${r.name} liefern wir Lunch-Buffets oder einzeln verpackte Lunch-Boxen, pünktlich zur Pause und mit Rechnung an Ihre Firma.`,
    },
    {
      q: 'Für wie viele Personen kocht AVA Catering?',
      a: 'Wir sind auf Anlässe mit rund 10 bis 120 Gästen spezialisiert: Firmenapéros, Teamlunches, Geschäftsanlässe, Geburtstage, Vereins- und Familienfeste.',
    },
    { q: 'Wie früh sollte ich anfragen?', a: leadTime },
  ]
}

export default async function RegionPage({ params }: Props) {
  const { ort } = await params
  const r = regionBySlug(ort)
  if (!r) notFound()
  const [s, cats] = await Promise.all([getSettings(), getCategories()])
  const base = siteUrl()
  const near = r.near.map(regionBySlug).filter((x): x is Region => !!x)
  const faq = regionFaq(r, s.leadTime)
  const here = r.km === 0

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Liefergebiet', path: '/catering' }, { name: `Catering ${r.name}`, path: `/catering/${r.slug}` }], base)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${base}/catering/${r.slug}#service`,
          serviceType: 'Catering',
          name: `Catering & Partyservice ${r.name}`,
          description: r.intro,
          url: `${base}/catering/${r.slug}`,
          image: `${base}${regionOgImage(r)}`,
          areaServed: {
            '@type': 'City',
            name: r.name,
            address: { '@type': 'PostalAddress', postalCode: r.plz, addressLocality: r.name, addressRegion: r.canton, addressCountry: 'CH' },
            containedInPlace: { '@type': 'AdministrativeArea', name: cantonName[r.canton] },
          },
          provider: { '@id': businessId() },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Buffets & Catering',
            itemListElement: cats.map((c) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: c.title, url: `${base}/angebot/${c.slug}` },
            })),
          },
        }}
      />
      <JsonLd data={faqJsonLd(faq)} />

      <ImageHero
        crumbs={[
          { href: '/catering', label: 'Liefergebiet' },
          { href: `/catering/${r.slug}`, label: r.name },
        ]}
        eyebrow={`Catering ${r.name} · ${r.canton}`}
        title={`Catering & Partyservice in *${r.name}.*`}
        text={r.intro}
        image={r.image}
        imageAlt={r.imageAlt}
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={inquiryHrefFor(r)} className="btn btn-primary">
            Offerte für {r.name} anfragen <ArrowRight className="size-4" />
          </Link>
          <a href={telHref(s.phone)} className="btn btn-secondary">
            <Phone className="size-4" /> {s.phone.replace('+41 ', '0')}
          </a>
        </div>
        <p className="text-muted mt-6 flex items-center gap-2 text-[0.95rem]">
          <Truck className="text-orange size-4 shrink-0" />
          {here ? 'Abholung in Pfaffnau oder Lieferung in die Region' : `${distanceText(r)}: Lieferung oder Abholung`}
        </p>
      </ImageHero>

      <div className="container-x -mt-4 pb-16 lg:pb-20">
        <TrustBar />
      </div>

      {/* ───────────── Angebot für den Ort ───────────── */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <SectionHead
            eyebrow={`Angebot in ${r.name}`}
            title={`Apéro, Firmenlunch & *Buffets* für ${r.name}.`}
            text={`Ob Firmenapéro, Teamlunch, Geschäftseröffnung, Geburtstag oder Vereinsfest in ${r.name}: Wählen Sie ein Buffet als Basis, den Rest stimmen wir persönlich mit Ihnen ab.`}
          />
          <ul data-reveal className="mt-8 flex flex-wrap gap-2.5">
            {r.focus.map((f) => (
              <li key={f} className="border-line text-olive flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm">
                <Check className="text-orange size-3.5" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {cats.map((c, i) => (
              <Link
                key={c.slug}
                href={`/angebot/${c.slug}`}
                data-reveal
                style={{ '--d': `${(i % 5) * 70}ms` } as React.CSSProperties}
                className="group bg-olive relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[1.5rem] p-5"
              >
                {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 20vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="relative">
                  <p className="text-orange-soft text-[0.7rem] tracking-[0.22em] uppercase">{c.subtitle}</p>
                  <h3 className="text-cream mt-1 font-serif text-[1.7rem] leading-tight">{c.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link href="/firmen" className="border-line group flex items-center justify-between gap-4 rounded-[1.5rem] border bg-white/70 p-6 transition hover:border-orange">
              <span>
                <span className="text-olive-deep block font-serif text-2xl">Firmencatering {r.name}</span>
                <span className="text-muted mt-1 block text-[0.95rem]">Business-Lunch, Lunch-Boxen, Apéro riche, Rechnung an die Firma</span>
              </span>
              <ArrowRight className="text-orange size-5 shrink-0 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/privat" className="border-line group flex items-center justify-between gap-4 rounded-[1.5rem] border bg-white/70 p-6 transition hover:border-orange">
              <span>
                <span className="text-olive-deep block font-serif text-2xl">Partyservice {r.name}</span>
                <span className="text-muted mt-1 block text-[0.95rem]">Geburtstag, Familien- und Vereinsfest, Themenbuffets</span>
              </span>
              <ArrowRight className="text-orange size-5 shrink-0 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Lieferung & Ablauf ───────────── */}
      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Lieferung" title={here ? 'Direkt aus *unserer Küche*.' : `Von Pfaffnau nach *${r.name}*.`} />
            <dl data-reveal className="mt-8 space-y-5">
              {[
                ['Ort', `${r.plz} ${r.name}, ${r.area} (${cantonName[r.canton]})`],
                ['Distanz', distanceText(r)],
                ['Service', 'Abholung in Pfaffnau, Lieferung oder Lieferung mit Aufbau'],
                ['Gäste', 'rund 10 bis 120 Personen'],
                ['Vorlauf', s.leadTime],
              ].map(([k, v]) => (
                <div key={k} className="border-line grid grid-cols-[6.5rem_1fr] gap-4 border-b pb-4">
                  <dt className="text-muted text-sm">{k}</dt>
                  <dd className="text-ink/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-olive-deep font-serif text-3xl">So einfach geht&apos;s</h2>
            <ol className="mt-6 space-y-4">
              {[
                ['Anfrage senden', `Anlass, Datum und Personenzahl angeben. Der Ort ${r.name} ist schon eingetragen.`],
                ['Persönliche Offerte', 'Dilsah meldet sich in der Regel innerhalb von zwei Arbeitstagen mit Auswahl, Menge und Preis.'],
                ['Geniessen', `Frisch zubereitet und ${here ? 'abholbereit oder geliefert' : `nach ${r.name} geliefert`}. Sie kümmern sich nur um Ihre Gäste.`],
              ].map(([t, d], i) => (
                <li key={t} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="flex gap-4 rounded-[1.25rem] bg-white/80 p-5">
                  <span className="bg-orange grid size-9 shrink-0 place-items-center rounded-full font-medium text-white">{i + 1}</span>
                  <span>
                    <span className="text-olive-deep block font-medium">{t}</span>
                    <span className="text-muted mt-1 block text-[0.95rem] leading-relaxed">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href={inquiryHrefFor(r)} className="btn btn-primary mt-8">
              Jetzt anfragen <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Fragen ───────────── */}
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Gut zu wissen" title={`Catering in ${r.name}: *Fragen*.`} />
            {near.length > 0 && (
              <div data-reveal className="mt-10">
                <p className="text-muted text-sm">Wir liefern auch in die Nachbarorte:</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {near.map((n) => (
                    <li key={n.slug}>
                      <Link href={`/catering/${n.slug}`} className="border-line text-olive hover:border-orange hover:text-orange inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-4 py-2 text-sm transition">
                        <Pin className="size-3.5" /> Catering {n.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/catering" className="text-muted hover:text-orange inline-flex px-2 py-2 text-sm underline underline-offset-4">
                      Alle Orte
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <Faq items={faq} />
        </div>
      </section>

      <CtaBand s={s} title={`Ihr Anlass in *${r.name}?*`} />
    </>
  )
}
