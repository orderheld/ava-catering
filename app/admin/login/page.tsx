import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Anmelden' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="border-line rounded-[2rem] border bg-white p-8 shadow-[0_30px_60px_-30px_rgba(47,57,22,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo.svg" alt="AVA Catering" className="mx-auto h-24 w-auto" />
          <h1 className="text-olive-deep mt-8 text-center font-serif text-3xl">Willkommen zurück</h1>
          <p className="text-muted mt-1 text-center text-sm">Verwaltung für Anfragen und Inhalte</p>
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted hover:text-orange">← Zur Website</Link>
        </p>
      </div>
    </main>
  )
}
