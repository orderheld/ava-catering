import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AVA Catering – Catering aus Pfaffnau',
    short_name: 'AVA Catering',
    description: 'Hausgemachte Apéro-, Mezze- und Lunch-Buffets für Firmen und Private.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF7F0',
    theme_color: '#FBF7F0',
    lang: 'de-CH',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
