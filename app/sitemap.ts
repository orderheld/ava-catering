import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/utils'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return ['', '/angebot', '/anfrage', '/galerie', '/kontakt', '/impressum', '/datenschutz'].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : p === '/angebot' || p === '/anfrage' ? 0.8 : 0.5,
  }))
}
