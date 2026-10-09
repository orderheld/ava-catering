import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { siteUrl } from '@/lib/utils'
import './globals.css'

// Nur «latin» wird vorgeladen; latin-ext (z.B. ı, ğ in Gerichtnamen) lädt der Browser bei Bedarf per unicode-range nach.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // Kein canonical/og:url auf Layout-Ebene: sonst erben Seiten ohne eigene Metadaten (z.B. 404) die Startseite als canonical.
  // Jede Seite setzt ihre Metadaten über pageMeta() (lib/seo.ts).
  description:
    'Hausgemachtes Catering aus Pfaffnau: Apéro-, Mezze- und Lunch-Buffets, Themen-Party-Service und Süsses für Firmen, Geschäfte und Feste.',
  openGraph: { type: 'website', locale: 'de_CH', siteName: 'AVA Catering', images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'AVA Catering – hausgemachte Buffets aus Pfaffnau' }] },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
  title: { default: 'AVA Catering', template: '%s · AVA Catering' },
  applicationName: 'AVA Catering',
  authors: [{ name: 'Dilsah Sever' }],
  creator: 'webnova.ch',
  keywords: [
    'Catering Pfaffnau',
    'Catering Firma',
    'Catering Geschäftseröffnung',
    'Apéro riche',
    'Catering Luzern',
    'Firmencatering',
    'Apéro Catering',
    'Fingerfood',
    'Mezze Buffet',
    'Lunch Catering Firma',
    'Partyservice',
    'Buffet bestellen',
    'Zofingen',
    'Willisau',
    'Sursee',
  ],
  formatDetection: { telephone: true, email: true, address: true },
  appleWebApp: { capable: true, title: 'AVA Catering', statusBarStyle: 'default' },
  category: 'food',
}

export const viewport: Viewport = {
  themeColor: '#FBF7F0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        {/* Ohne JavaScript alle Inhalte sofort zeigen */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
