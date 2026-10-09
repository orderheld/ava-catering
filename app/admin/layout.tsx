import type { Metadata, Viewport } from 'next'

// Eigenes App-Icon und Manifest: Wer das Admin zum Home-Bildschirm hinzufügt, bekommt «AVA Admin» statt der Website.
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin · AVA Catering' },
  robots: { index: false, follow: false },
  manifest: '/admin-app/manifest.webmanifest',
  applicationName: 'AVA Admin',
  appleWebApp: { capable: true, title: 'AVA Admin', statusBarStyle: 'black' },
  icons: {
    icon: [
      { url: '/admin-app/icon.svg', type: 'image/svg+xml' },
      { url: '/admin-app/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/admin-app/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = { themeColor: '#2F3916' }

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-dvh bg-[#f7f2e9]">{children}</div>
}
