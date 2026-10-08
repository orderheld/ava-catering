import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { pageMeta } from '@/lib/seo'
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
  ...pageMeta({
    description:
      'Hausgemachtes Catering aus Pfaffnau: Apéro-, Mezze- und Lunch-Buffets, Themen-Party-Service und Süsses für Firmen und Privatpersonen. Jetzt unverbindlich anfragen.',
    path: '/',
  }),
  title: { default: 'AVA Catering – Catering aus Pfaffnau für Firmen & Private', template: '%s · AVA Catering' },
  applicationName: 'AVA Catering',
  authors: [{ name: 'Dilsah Sever' }],
  creator: 'webnova.ch',
  keywords: [
    'Catering Pfaffnau',
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
      <body>{children}</body>
    </html>
  )
}
