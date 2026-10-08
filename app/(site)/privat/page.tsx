import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@/components/Icons'
import { ContactChips, CtaBand, Faq, ImageHero, JsonLd, SectionHead, ThemeCards, breadcrumbJsonLd, faqGroups, faqJsonLd } from '@/components/site/sections'
import { getSettings, getThemes } from '@/lib/data'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Catering für private Feiern – Geburtstag & Familienfest',
  description:
    'Catering für Geburtstage, Familienfeste, Taufen und Feiern mit Freunden: hausgemachte Apéro-, Mezze- und Themenbuffets von AVA Catering aus Pfaffnau.',
  path: '/privat',
  image: '/og-privat.jpg',
  imageAlt: 'AVA Catering – Catering für private Feiern',
})

const occasions = [
  { t: 'Geburtstag', d: 'Vom runden Geburtstag bis zur Gartenparty: ein Buffet, das allen schmeckt.', img: '/images/suess-torte.webp', anlass: 'Geburtstag' },
  { t: 'Familienfest & Taufe', d: 'Mezze, Gebäck und Süsses für Feiern mit der ganzen Familie.', img: '/images/mezze-sarma.webp', anlass: 'Familienfest' },
  { t: 'Kindergeburtstag', d: 'Pizza, Burger oder Pasta: Themenbuffets, die Gross und Klein begeistern.', img: '/images/themen-pizza.webp', anlass: 'Geburtstag' },
  { t: 'Vereins- & Nachbarschaftsfest', d: 'Unkompliziertes Fingerfood und Buffets für gesellige Runden.', img: '/images/apero-minipizza.webp', anlass: 'Vereinsanlass' },
]

export default async function PrivatPage() {
  const [s, themes] = await Promise.all([getSettings(), getThemes()])
  const faq = [faqGroups[0].items[1], faqGroups[0].items[0], faqGroups[2].items[0], faqGroups[1].items[0], faqGroups[0].items[2]]

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Für Private', path: '/privat' }], siteUrl())} />
      <JsonLd data={faqJsonLd(faq)} />
      <ImageHero
        crumbs={[{ href: '/privat', label: 'Für Private' }]}
        eyebrow="Private Feiern"
        title="Sie feiern. Wir *kochen*."
        text="Geburtstag, Familienfest oder ein Abend mit Freunden: Dilsah bereitet Ihr Buffet frisch und hausgemacht zu, damit Sie Zeit für Ihre Gäste haben."
        image="/images/apero-tafel.webp"
        imageAlt="Gedeckte Apéro-Tafel für eine private Feier"
      >
        <div data-reveal style={{ '--d': '240ms' } as React.CSSProperties} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/anfrage?anlass=Geburtstag" className="btn btn-primary">
            Feier anfragen <ArrowRight className="size-4" />
          </Link>
          <Link href="/angebot/themen-party" className="btn btn-secondary">
            Themenbuffets ansehen
          </Link>
        </div>
      </ImageHero>

      <section className="bg-sand/60 py-20 lg:py-28">
        <div className="container-x">
          <SectionHead eyebrow="Anlässe" title="Für die Feste, die *zählen*." text="Ideal für Feiern mit rund 10 bis 120 Gästen, zu Hause, im Garten oder im gemieteten Saal." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map((o, i) => (
              <Link key={o.t} href={`/anfrage?anlass=${encodeURIComponent(o.anlass)}`} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties} className="group overflow-hidden rounded-[1.75rem] bg-white/80">
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

      <section className="bg-olive-deep grain relative overflow-hidden py-20 lg:py-28">
        <div className="container-x relative">
          <SectionHead light eyebrow="Themen-Party-Service" title="Ein Motto. Ein Buffet. *Ein Fest.*" text="Wählen Sie Ihr Thema, wir kümmern uns um den Rest." />
          <div className="mt-14">
            <ThemeCards themes={themes} />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Gut zu wissen" title="Häufige *Fragen*." text={s.leadTime} />
            <div data-reveal className="mt-8">
              <ContactChips s={s} />
            </div>
          </div>
          <Faq items={faq} />
        </div>
      </section>

      <CtaBand s={s} title="Erzählen Sie uns von Ihrer *Feier.*" />
    </>
  )
}
