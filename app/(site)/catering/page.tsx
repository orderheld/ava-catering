import Link from 'next/link'
import { ArrowRight, Pin } from '@/components/Icons'
import { CtaBand, JsonLd, PageHero, SectionHead, breadcrumbJsonLd } from '@/components/site/sections'
import { getSettings } from '@/lib/data'
import { cantonName, distanceText, regions, type Region } from '@/lib/regions'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Liefergebiet – Catering Luzern, Aargau, Solothurn & Oberaargau',
  description:
    'Catering und Partyservice aus Pfaffnau für Reiden, Zofingen, Rothrist, Olten, Langenthal, Sursee, Willisau, Luzern und Umgebung. Lieferung oder Abholung, Offerte kostenlos.',
  path: '/catering',
  image: '/og/catering-region.jpg',
  imageAlt: 'AVA Catering – Liefergebiet rund um Pfaffnau',
})

const order: Region['canton'][] = ['LU', 'AG', 'BE', 'SO']

export default async function CateringRegionPage() {
  const s = await getSettings()
  const base = siteUrl()
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Liefergebiet', path: '/catering' }], base)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Catering-Liefergebiet von AVA Catering',
          itemListElement: regions.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `Catering ${r.name}`, url: `${base}/catering/${r.slug}` })),
        }}
      />
      <PageHero
        eyebrow="Liefergebiet"
        title="Catering in der *Region*."
        text={`Hausgemacht in Pfaffnau, geliefert ins Luzerner Hinterland, die Region Zofingen, den Oberaargau und nach Olten. ${s.serviceArea}.`}
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/anfrage" className="btn btn-primary">
            Offerte anfragen <ArrowRight className="size-4" />
          </Link>
        </div>
      </PageHero>

      <section className="pb-20 lg:pb-28">
        <div className="container-x space-y-14">
          {order.map((canton) => {
            const list = regions.filter((r) => r.canton === canton).sort((a, b) => a.km - b.km)
            if (!list.length) return null
            return (
              <div key={canton}>
                <SectionHead eyebrow={cantonName[canton]} title={canton === 'LU' ? 'Luzern & *Hinterland*' : canton === 'AG' ? 'Region *Zofingen*' : canton === 'BE' ? '*Oberaargau*' : 'Region *Olten*'} />
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/catering/${r.slug}`} className="border-line group flex h-full flex-col rounded-[1.5rem] border bg-white/70 p-6 transition hover:-translate-y-0.5 hover:border-orange">
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-olive-deep font-serif text-[1.7rem] leading-tight">Catering {r.name}</span>
                          <ArrowRight className="text-orange size-5 shrink-0 transition group-hover:translate-x-1" />
                        </span>
                        <span className="text-muted mt-1 flex items-center gap-1.5 text-sm">
                          <Pin className="size-3.5" /> {r.plz} {r.name} · {distanceText(r)}
                        </span>
                        <span className="text-ink/80 mt-3 line-clamp-3 text-[0.95rem] leading-relaxed">{r.intro}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
          <p className="text-muted">Ihr Ort fehlt? Wir liefern auch in weitere Gemeinden der Region, fragen Sie einfach an.</p>
        </div>
      </section>

      <CtaBand s={s} />
    </>
  )
}
