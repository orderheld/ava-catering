import { pageMeta } from '@/lib/seo'
import { CtaBand, PageHero } from '@/components/site/sections'
import { Lightbox } from '@/components/site/Lightbox'
import { getGallery, getSettings } from '@/lib/data'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Galerie – Buffets, Gebäck & Süsses',
  description: 'Bilder von Apéro-, Mezze- und Lunch-Buffets, Gebäck und Süssem von AVA Catering aus Pfaffnau. Ein Blick in die Küche von Dilsah Sever.',
  path: '/galerie',
})

export default async function GaleriePage() {
  const [s, gallery] = await Promise.all([getSettings(), getGallery()])
  return (
    <>
      <PageHero eyebrow="Galerie" title="Mit den Augen *isst* man mit." text="Echte Buffets, echte Anlässe – alles frisch und von Hand zubereitet." />
      <section className="container-x pb-10">
        <Lightbox images={gallery.map((g) => ({ src: g.src, alt: g.alt }))} />
      </section>
      <CtaBand s={s} />
    </>
  )
}
