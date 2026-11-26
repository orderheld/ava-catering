import type { MetadataRoute } from 'next'
import { categoryImages } from '@/lib/content'
import { getCategories } from '@/lib/data'
import { regionOgImage, regions } from '@/lib/regions'
import { SITE_UPDATED } from '@/lib/seo'
import { siteUrl } from '@/lib/utils'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const cats = await getCategories()
  const pages: [string, number][] = [
    ['', 1],
    ['/angebot', 0.9],
    ['/firmen', 0.9],
    ['/privat', 0.9],
    ['/anfrage', 0.8],
    ...cats.map((c) => [`/angebot/${c.slug}`, 0.8] as [string, number]),
    ['/ueber-uns', 0.6],
    ['/galerie', 0.6],
    ['/faq', 0.6],
    ['/kontakt', 0.7],
    ['/catering', 0.8],
    ...regions.map((r) => [`/catering/${r.slug}`, 0.7] as [string, number]),
  ]
  // Fester Stand statt new Date(): ein lastmod, das sich bei jedem Abruf ändert, ignorieren Suchmaschinen.
  const lastModified = new Date(SITE_UPDATED)
  // Bilder pro Seite (Google-Bildersuche): Kapitelbilder und Vorschaubilder der Orte
  const images: Record<string, string[]> = {
    '': ['/og.jpg', '/images/hero-buffet.webp', '/images/mezze-buffet.webp'],
    '/firmen': ['/og-firmen.jpg', '/images/lunch-set.webp'],
    '/privat': ['/og-privat.jpg'],
    ...Object.fromEntries(cats.map((c) => [`/angebot/${c.slug}`, [c.image, ...(categoryImages[c.slug] ?? [])].filter(Boolean)])),
    ...Object.fromEntries(regions.map((r) => [`/catering/${r.slug}`, [regionOgImage(r), r.image]])),
  }
  return pages.map(([p, priority]) => ({
    url: `${base}${p}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
    ...(images[p] && { images: images[p].map((src) => (src.startsWith('http') ? src : `${base}${src}`)) }),
  }))
}
