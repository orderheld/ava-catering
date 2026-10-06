import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { siteUrl } from '@/lib/utils'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const jost = Jost({ subsets: ['latin', 'latin-ext'], variable: '--font-jost', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'AVA Catering – Hausgemachtes Catering aus Pfaffnau',
    template: '%s · AVA Catering',
  },
  description:
    'Apéro-, Mezze- und Lunch-Buffets, Themen-Party-Service und Süsses – hausgemacht von Dilsah Sever in Pfaffnau. Jetzt unverbindlich anfragen.',
  keywords: ['Catering Pfaffnau', 'Apéro Buffet', 'Mezze Buffet', 'Lunch Catering', 'Partyservice Luzern', 'Fingerfood', 'Themenbuffet'],
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    siteName: 'AVA Catering',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'AVA Catering – hausgemachte Buffets' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#FBF7F0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
