import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from '@/components/Icons'
import { CtaBand, PageHero, ThemeCards } from '@/components/site/sections'
import { categoryImages } from '@/lib/content'
import { getCategories, getSettings, getThemes } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Angebot – Apéro, Mezze, Lunch & Themenbuffets',
  description:
    'Apéro-Buffet, Mezze-Buffet, Lunch-Buffet, Themen-Party-Service und Süsses: das hausgemachte Catering-Angebot von AVA Catering aus Pfaffnau für Firmen, Geschäfte und Feste.',
  path: '/angebot',
  image: '/og-angebot.jpg',
  imageAlt: 'AVA Catering – Apéro, Mezze, Lunch & mehr',
})

export default async function AngebotPage() {
  const [s, cats, themes] = await Promise.all([getSettings(), getCategories(), getThemes()])

  return (
    <>
      <PageHero
        eyebrow="Angebot"
        title="Hausgemacht, *kombinierbar*, ganz nach Ihrem Anlass."
        text="Fünf Kapitel, unzählige Möglichkeiten. Jedes Buffet wird für Sie zusammengestellt – die Beispiele zeigen, was Dilsah besonders gerne zubereitet."
      >
        <nav aria-label="Kapitel" className="mt-12 flex flex-wrap gap-2.5">
          {cats.map((c, i) => (
            <a key={c.slug} href={`#${c.slug}`} className="border-line text-olive hover:border-orange hover:text-orange rounded-full border bg-white/60 px-4 py-2 text-sm transition">
              <span className="text-orange mr-2 font-serif italic">0{i + 1}</span>
              {c.title}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="space-y-6 pb-10">
        {cats.map((c, i) => {
          const flip = i % 2 === 1
          const imgs = categoryImages[c.slug]?.slice(0, 2) ?? []
          return (
            <section key={c.slug} id={c.slug} className={`scroll-mt-24 py-14 lg:py-20 ${flip ? 'bg-sand/60' : ''}`}>
              <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className={`relative ${flip ? 'lg:order-2' : ''}`}>
                  <div data-reveal="scale" className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/5]">
                    {c.image && <Image src={c.image} alt={c.title} fill sizes="(min-width:1024px) 45vw, 92vw" className="object-cover" />}
                  </div>
                  {imgs.length > 0 && (
                    <div className={`absolute -bottom-8 flex gap-3 ${flip ? '-left-3 sm:-left-8' : '-right-3 sm:-right-8'}`}>
                      {imgs.map((src, k) => (
                        <div key={src} data-reveal style={{ '--d': `${200 + k * 120}ms` } as React.CSSProperties} className={`border-cream relative aspect-square w-28 overflow-hidden rounded-2xl border-[5px] shadow-lg sm:w-36 ${flip ? 'border-sand' : ''}`}>
                          <Image src={src} alt="" fill sizes="150px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={flip ? 'lg:order-1' : ''}>
                  <p data-reveal className="flex items-baseline gap-4">
                    <span className="text-orange font-serif text-6xl leading-none italic">0{i + 1}</span>
                    <span className="eyebrow">{c.subtitle}</span>
                  </p>
                  <h2 data-reveal style={{ '--d': '80ms' } as React.CSSProperties} className="display text-olive-deep mt-5 text-[clamp(2.6rem,5vw,4.2rem)]">
                    {c.title}
                  </h2>
                  <p data-reveal style={{ '--d': '140ms' } as React.CSSProperties} className="text-muted mt-6 text-lg leading-relaxed">
                    {c.description}
                  </p>
                  {c.items.length > 0 && (
                    <div data-reveal style={{ '--d': '200ms' } as React.CSSProperties} className="mt-9">
                      <p className="text-muted text-xs font-medium tracking-[0.22em] uppercase">Zum Beispiel</p>
                      <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
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
                    </div>
                  )}
                  <div data-reveal style={{ '--d': '260ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/anfrage?angebot=${c.slug}`} className="btn btn-primary">
                      {c.title} anfragen <ArrowRight className="size-4" />
                    </Link>
                    <Link href={`/angebot/${c.slug}`} className="btn btn-secondary">
                      Mehr erfahren
                    </Link>
                  </div>
                </div>
              </div>
              {c.slug === 'themen-party' && themes.length > 0 && (
                <div className="container-x mt-20">
                  <p className="eyebrow">Beliebte Themen</p>
                  <div className="mt-8">
                    <ThemeCards themes={themes} />
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <section className="container-x pt-10">
        <div className="border-line grid gap-10 rounded-[2rem] border bg-white/50 p-8 sm:p-12 lg:grid-cols-3">
          {[
            ['Ernährung & Allergien', 'Vegetarisch, vegan, halal, glutenfrei oder laktosefrei: Teilen Sie uns Ihre Wünsche und Allergien mit – wir planen sie von Anfang an ein.'],
            ['Abholung oder Lieferung', `Abholung in ${s.city} oder Lieferung zu Ihnen. Auf Wunsch richten wir das Buffet vor Ort an. ${s.serviceArea}.`],
            ['Persönliches Angebot', 'Preise hängen von Auswahl, Personenzahl und Service ab. Nach Ihrer Anfrage erhalten Sie ein transparentes, unverbindliches Angebot.'],
          ].map(([t, d], i) => (
            <div key={t} data-reveal style={{ '--d': `${i * 100}ms` } as React.CSSProperties}>
              <h3 className="text-olive-deep font-serif text-2xl">{t}</h3>
              <p className="text-muted mt-3 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand s={s} />
    </>
  )
}
