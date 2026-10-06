import type { Metadata } from 'next'
import { PageHero } from '@/components/site/sections'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Impressum', robots: { index: false } }
export const revalidate = 300

export default async function ImpressumPage() {
  const s = await getSettings()
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" />
      <section className="container-x text-muted max-w-3xl space-y-8 pb-28 leading-relaxed [&_h2]:text-olive-deep [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl">
        <div>
          <h2>Kontaktadresse</h2>
          <p>
            AVA Catering
            <br />
            Inhaberin: Dilsah Sever
            <br />
            {s.street}
            <br />
            {s.zip} {s.city}
            <br />
            Schweiz
          </p>
          <p className="mt-3">
            Telefon: {s.phone}
            <br />
            E-Mail: {s.email}
          </p>
        </div>
        <div>
          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird
            jedoch keine Gewähr übernommen. Angebote und Preise sind unverbindlich; massgebend ist das individuelle Angebot.
          </p>
        </div>
        <div>
          <h2>Urheberrechte</h2>
          <p>Texte, Bilder und Logo dieser Website gehören AVA Catering. Eine Verwendung ohne schriftliche Zustimmung ist nicht gestattet.</p>
        </div>
      </section>
    </>
  )
}
