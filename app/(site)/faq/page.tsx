import { ContactChips, CtaBand, Faq, JsonLd, PageHero, breadcrumbJsonLd, faqGroups, faqJsonLd } from '@/components/site/sections'
import { getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Häufige Fragen zum Catering',
  description:
    'Antworten zu Anfrage, Preisen, Personenzahl, Lieferung, vegetarischen und halal Optionen sowie Firmencatering bei AVA Catering aus Pfaffnau.',
  path: '/faq',
})

export default async function FaqPage() {
  const s = await getSettings()
  const all = faqGroups.flatMap((g) => g.items)
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Häufige Fragen', path: '/faq' }], siteUrl())} />
      <JsonLd data={faqJsonLd(all)} />
      <PageHero eyebrow="Häufige Fragen" title="Gut zu *wissen*." text={s.leadTime}>
        <div data-reveal style={{ '--d': '240ms' } as React.CSSProperties} className="mt-10">
          <ContactChips s={s} />
        </div>
      </PageHero>
      <div className="container-x space-y-16 pb-10 lg:space-y-20">
        {faqGroups.map((g) => (
          <section key={g.title} className="grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <h2 data-reveal className="text-olive-deep font-serif text-[2rem] leading-tight lg:pt-5">{g.title}</h2>
            <Faq items={g.items} />
          </section>
        ))}
      </div>
      <CtaBand s={s} />
    </>
  )
}
