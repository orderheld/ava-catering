import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Heart, Leaf, Truck } from '@/components/Icons'
import { CtaBand, ImageHero, JsonLd, SectionHead, breadcrumbJsonLd } from '@/components/site/sections'
import { getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Über uns – Dilsah Sever & AVA Catering',
  description:
    'AVA Catering ist das Catering von Dilsah Sever aus Pfaffnau: hausgemachte mediterrane und türkische Spezialitäten, mit Sorgfalt für Firmen und private Feiern zubereitet.',
  path: '/ueber-uns',
})

const values = [
  { icon: Heart, t: 'Hausgemacht', d: 'Teig, Füllungen, Dips und Gebäck entstehen von Hand in unserer Küche in Pfaffnau.' },
  { icon: Leaf, t: 'Frisch & saisonal', d: 'Für jeden Anlass frisch zubereitet, mit Zutaten, die wir selbst gerne essen.' },
  { icon: Truck, t: 'Persönlich & verlässlich', d: 'Eine Ansprechperson von der Anfrage bis zur Lieferung, ohne Umwege.' },
]

export default async function UeberUnsPage() {
  const s = await getSettings()
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Über uns', path: '/ueber-uns' }], siteUrl())} />
      <ImageHero
        crumbs={[{ href: '/ueber-uns', label: 'Über uns' }]}
        eyebrow="Über uns"
        title={s.aboutTitle}
        text="AVA Catering steht für ehrliche, hausgemachte Küche aus Pfaffnau, zubereitet von Dilsah Sever."
        image="/images/gebaeck-zopf.webp"
        imageAlt="Geflochtenes Hefegebäck aus der Küche von AVA Catering"
      />

      <section className="bg-sand/60 relative overflow-hidden py-20 lg:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto w-full max-w-[440px]">
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
          </div>
          <div>
            <SectionHead eyebrow="Die Geschichte" title="Mit Herz *und* Handwerk." />
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
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHead align="center" eyebrow="Wofür wir stehen" title="Drei Versprechen an *Ihre Gäste*." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: I, t, d }, i) => (
              <div key={t} data-reveal style={{ '--d': `${i * 100}ms` } as React.CSSProperties} className="border-line rounded-[1.75rem] border bg-white/60 p-8 text-center">
                <span className="bg-orange-soft text-orange mx-auto grid size-14 place-items-center rounded-full">
                  <I className="size-6" />
                </span>
                <h3 className="text-olive-deep mt-6 font-serif text-[1.8rem]">{t}</h3>
                <p className="text-muted mt-3 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-olive-deep grain relative overflow-hidden py-20 lg:py-28">
        <Image src="/images/tafel-gross.webp" alt="" fill sizes="100vw" className="object-cover opacity-15 mix-blend-luminosity" />
        <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-end">
          <SectionHead light eyebrow="Region" title="Zuhause in *Pfaffnau*." text={`${s.serviceArea}. Abholung in ${s.city} oder Lieferung zu Ihnen.`} />
          <div data-reveal className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/firmen" className="btn btn-primary">
              Für Firmen <ArrowRight className="size-4" />
            </Link>
            <Link href="/privat" className="btn btn-light">
              Für Private <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand s={s} />
    </>
  )
}
