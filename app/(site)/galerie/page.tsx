import type { Metadata } from 'next'
import { CtaBand, PageHero } from '@/components/site/sections'
import { Lightbox } from '@/components/site/Lightbox'
import { getGallery, getSettings } from '@/lib/data'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Galerie',
  description: 'Buffets, Gebäck und Süsses von AVA Catering – ein Blick in die Küche von Dilsah Sever.',
  alternates: { canonical: '/galerie' },
}

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
