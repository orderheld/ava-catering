import { InquiryWizard } from '@/components/site/InquiryWizard'
import { PageHero } from '@/components/site/sections'
import { pageMeta } from '@/lib/seo'
import { getBlockedDates, getCategories, getSettings, getThemes } from '@/lib/data'

export const metadata = pageMeta({
  title: 'Catering anfragen',
  description:
    'Catering unverbindlich anfragen: Anlass, Datum und Personenzahl angeben und ein persönliches Angebot von AVA Catering aus Pfaffnau erhalten. Für Firmen, Geschäfte und Feste.',
  path: '/anfrage',
})

export default async function AnfragePage({ searchParams }: { searchParams: Promise<{ angebot?: string; thema?: string; anlass?: string; personen?: string }> }) {
  const [{ angebot, thema, anlass, personen }, s, cats, themes, blocked] = await Promise.all([searchParams, getSettings(), getCategories(), getThemes(), getBlockedDates()])
  return (
    <>
      <PageHero eyebrow="Anfrage" title="In vier Schritten zu *Ihrem Buffet*." text="Unverbindlich und kostenlos. Sie erhalten ein persönliches Angebot, in der Regel innerhalb von zwei Arbeitstagen." />
      <section className="container-x pb-24 lg:pb-32">
        <InquiryWizard
          categories={cats.map(({ slug, title, subtitle, image }) => ({ slug, title, subtitle, image }))}
          themes={themes.map((t) => t.title)}
          blocked={blocked}
          initialOffering={angebot}
          initialTheme={thema}
          initialEventType={anlass}
          initialGuests={Number(personen) || undefined}
          phone={s.phone}
          leadTime={s.leadTime}
        />
      </section>
    </>
  )
}
