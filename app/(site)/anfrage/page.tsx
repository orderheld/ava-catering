import type { Metadata } from 'next'
import { InquiryWizard } from '@/components/site/InquiryWizard'
import { PageHero } from '@/components/site/sections'
import { getBlockedDates, getCategories, getSettings, getThemes } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Anfrage',
  description: 'Unverbindlich anfragen: Erzählen Sie uns von Ihrem Anlass und erhalten Sie ein persönliches Catering-Angebot von AVA Catering.',
  alternates: { canonical: '/anfrage' },
}

export default async function AnfragePage({ searchParams }: { searchParams: Promise<{ angebot?: string; thema?: string }> }) {
  const [{ angebot, thema }, s, cats, themes, blocked] = await Promise.all([searchParams, getSettings(), getCategories(), getThemes(), getBlockedDates()])
  return (
    <>
      <PageHero eyebrow="Anfrage" title="In vier Schritten zu *Ihrem Buffet*." />
      <section className="container-x pb-24 lg:pb-32">
        <InquiryWizard
          categories={cats.map(({ slug, title, subtitle, image }) => ({ slug, title, subtitle, image }))}
          themes={themes.map((t) => t.title)}
          blocked={blocked}
          initialOffering={angebot}
          initialTheme={thema}
          phone={s.phone}
          leadTime={s.leadTime}
        />
      </section>
    </>
  )
}
