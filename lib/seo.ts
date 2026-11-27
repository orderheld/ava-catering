import type { Metadata } from 'next'
import { googleProfile, instagramUrl, phoneHours, type SiteSettings } from '@/lib/content'
import { cantonName, regions } from '@/lib/regions'
import { plain, siteUrl } from '@/lib/utils'

const SITE = 'AVA Catering'

/** Stand der Website-Inhalte für sitemap.xml (lastmod). Bei grösseren Text-/Angebotsänderungen anpassen. */
export const SITE_UPDATED = '2026-11-26'

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
  const fullTitle = title ? `${title} · ${SITE}` : `${SITE} – Catering & Partyservice Pfaffnau · Firmen & Feste`
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

/**
 * Der Betrieb als LocalBusiness (schema.org FoodEstablishment) – steht auf jeder Seite,
 * damit Google Name, Adresse, Telefon und Liefergebiet überall gleich findet (NAP-Konsistenz).
 */
export function businessJsonLd(s: SiteSettings) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': businessId(),
    name: 'AVA Catering',
    alternateName: 'AVA Catering Pfaffnau',
    slogan: 'Hausgemacht. Für Ihre Momente.',
    description: plain(s.heroText),
    url: `${base}/`,
    image: [`${base}/og.jpg`, `${base}/og-firmen.jpg`, `${base}/og-privat.jpg`],
    logo: `${base}/brand/ava-logo.png`,
    telephone: s.phone,
    email: s.email,
    founder: { '@type': 'Person', name: 'Dilsah Sever' },
    servesCuisine: ['Europäisch', 'Mediterran', 'Fingerfood'],
    knowsAbout: ['Catering', 'Partyservice', 'Firmencatering', 'Firmenlunch', 'Lunch-Boxen', 'Apéro', 'Apéro riche', 'Fingerfood', 'Buffet'],
    address: { '@type': 'PostalAddress', streetAddress: s.street, postalCode: s.zip, addressLocality: s.city, addressRegion: 'LU', addressCountry: 'CH' },
    areaServed: regions.map((r) => ({
      '@type': 'City',
      name: r.name,
      url: `${base}/catering/${r.slug}`,
      containedInPlace: { '@type': 'AdministrativeArea', name: cantonName[r.canton] },
    })),
    currenciesAccepted: 'CHF',
    hasMap: googleProfile.profile,
    sameAs: [googleProfile.profile, instagramUrl(s)].filter(Boolean),
    ...(phoneHours.length && {
      openingHoursSpecification: phoneHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  }
}
