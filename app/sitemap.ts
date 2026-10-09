import type { MetadataRoute } from 'next'
import { getCategories } from '@/lib/data'
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
  ]
  // Fester Stand statt new Date(): ein lastmod, das sich bei jedem Abruf ändert, ignorieren Suchmaschinen.
  const lastModified = new Date(SITE_UPDATED)
  return pages.map(([p, priority]) => ({ url: `${base}${p}`, lastModified, changeFrequency: 'monthly', priority }))
}
