import type { Metadata } from 'next'

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin · AVA Catering' }, robots: { index: false, follow: false } }

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="bg-sand/50 min-h-screen">{children}</div>
}
