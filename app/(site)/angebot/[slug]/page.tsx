import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from '@/components/Icons'
import { ContactChips, CtaBand, ImageHero, JsonLd, SectionHead, ThemeCards, breadcrumbJsonLd } from '@/components/site/sections'
import { categoryDetails, categoryImages } from '@/lib/content'
import { getCategories, getSettings, getThemes } from '@/lib/data'
import { businessId, pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const cats = await getCategories()
  return cats.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = (await getCategories()).find((x) => x.slug === slug)
  if (!c) return {}
  return pageMeta({
    title: `${c.title} – ${c.subtitle}`,
    description: categoryDetails[slug]?.seo ?? c.description,
    path: `/angebot/${slug}`,
    image: '/og-angebot.jpg',
    imageAlt: `${c.title} von AVA Catering`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [s, cats, themes] = await Promise.all([getSettings(), getCategories(), getThemes()])
  const idx = cats.findIndex((c) => c.slug === slug)
  if (idx < 0) notFound()
  const c = cats[idx]
  const detail = categoryDetails[slug]
  const images = (categoryImages[slug] ?? []).filter((src) => src !== c.image)
  const others = cats.filter((x) => x.slug !== slug)
  const base = siteUrl()

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Angebot', path: '/angebot' }, { name: c.title, path: `/angebot/${slug}` }], base)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Catering',
          name: c.title,
          description: detail?.seo ?? c.description,
          image: c.image ? `${base}${c.image}` : undefined,
          url: `${base}/angebot/${slug}`,
          areaServed: s.serviceArea,
          provider: { '@type': 'FoodEstablishment', '@id': businessId(), name: 'AVA Catering', telephone: s.phone, url: base },
        }}
      />
      <ImageHero
        crumbs={[
          { href: '/angebot', label: 'Angebot' },
          { href: `/angebot/${slug}`, label: c.title },
        ]}
        eyebrow={`Kapitel 0${idx + 1} · ${c.subtitle}`}
        title={c.title}
        text={c.description}
        image={c.image || '/images/hero-buffet.webp'}
        imageAlt={c.title}
      >
        <div data-reveal style={{ '--d': '240ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={`/anfrage?angebot=${slug}`} className="btn btn-primary">
            {c.title} anfragen <ArrowRight className="size-4" />
          </Link>
          <Link href="/angebot" className="btn btn-secondary">
            <ArrowLeft className="size-4" /> Alle Angebote
          </Link>
        </div>
      </ImageHero>

      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            {detail && (
              <p data-reveal className="text-olive-deep font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-snug">
                {detail.intro}
              </p>
            )}
            {c.items.length > 0 && (
              <div data-reveal className="mt-12">
                <p className="text-muted text-xs font-medium tracking-[0.22em] uppercase">Zum Beispiel</p>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {c.items.map((it) => (
                    <li key={it.name} className="border-line flex gap-3 border-b pb-3">
                      <Check className="text-orange mt-0.5 size-4 shrink-0" />
                      <span>
                        {it.name}
                        {it.description && <span className="text-muted block text-sm">{it.description}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted mt-6 text-sm">Die Auswahl wird für jeden Anlass individuell zusammengestellt.</p>
              </div>
            )}
          </div>
          <aside data-reveal className="self-start rounded-[2rem] bg-white/80 p-8 sm:p-10">
            {detail && (
              <>
                <h2 className="text-olive-deep font-serif text-3xl">Ideal für</h2>
                <ul className="mt-5 space-y-3">
                  {detail.idealFor.map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="bg-orange size-1.5 shrink-0 rounded-full" /> {t}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="border-line mt-8 border-t pt-8">
              <h2 className="text-olive-deep font-serif text-2xl">Persönliche Beratung</h2>
              <p className="text-muted mt-2 text-[0.95rem] leading-relaxed">Preis, Mengen und Auswahl stimmen wir auf Ihren Anlass ab. Fragen Sie unverbindlich an.</p>
              <div className="mt-6">
                <ContactChips s={s} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {images.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container-x">
            <SectionHead eyebrow="Eindrücke" title="So kommt es auf den *Tisch*." />
            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {images.map((src, i) => (
                <div key={src} data-reveal style={{ '--d': `${i * 80}ms` } as React.CSSProperties} className={`relative overflow-hidden rounded-[1.25rem] ${i % 2 ? 'aspect-square' : 'aspect-[3/4]'}`}>
                  <Image src={src} alt={`${c.title}: Beispiel ${i + 1}`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {slug === 'themen-party' && themes.length > 0 && (
        <section className="bg-olive-deep grain relative overflow-hidden py-20 lg:py-28">
          <div className="container-x relative">
            <SectionHead light eyebrow="Themen" title="Wählen Sie Ihr *Motto*." />
            <div className="mt-14">
              <ThemeCards themes={themes} />
            </div>
          </div>
        </section>
      )}

      <section className="py-20 lg:py-24">
        <div className="container-x">
          <SectionHead eyebrow="Weitere Kapitel" title="Gerne *kombiniert*." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/angebot/${o.slug}`} className="group border-line flex items-center gap-4 rounded-[1.5rem] border bg-white/60 p-3 pr-5 transition hover:border-orange">
                <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
                  {o.image && <Image src={o.image} alt="" fill sizes="80px" className="object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="text-olive-deep block font-serif text-xl leading-tight">{o.title}</span>
                  <span className="text-muted block truncate text-sm">{o.subtitle}</span>
                </span>
                <ArrowRight className="text-orange ml-auto size-4 shrink-0 transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand s={s} />
    </>
  )
}
