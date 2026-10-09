import type { Metadata } from 'next'
import { siteUrl } from '@/lib/utils'

const SITE = 'AVA Catering'

/** Stand der Website-Inhalte für sitemap.xml (lastmod). Bei grösseren Text-/Angebotsänderungen anpassen. */
export const SITE_UPDATED = '2026-10-09'

/** Stabile ID des Betriebs für strukturierte Daten (verknüpft LocalBusiness, Service usw.). */
export const businessId = () => `${siteUrl()}/#business`

/** Einheitliche Metadaten pro Seite inkl. Open Graph (WhatsApp, Facebook, LinkedIn) und Twitter. */
export function pageMeta({
  title,
  description,
  path,
  image = '/og.jpg',
  imageAlt = 'AVA Catering – hausgemachte Buffets aus Pfaffnau',
  noindex = false,
}: {
  title?: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  noindex?: boolean
}): Metadata {
  const fullTitle = title ? `${title} · ${SITE}` : `${SITE} – Catering aus Pfaffnau für Firmen, Geschäfte & Feste`
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      locale: 'de_CH',
      siteName: SITE,
      title: fullTitle,
      description,
      url: path,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt, type: 'image/jpeg' }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  }
}
