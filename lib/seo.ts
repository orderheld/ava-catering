import type { Metadata } from 'next'

const SITE = 'AVA Catering'

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
  const fullTitle = title ? `${title} · ${SITE}` : `${SITE} – Catering aus Pfaffnau für Firmen & Private`
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
