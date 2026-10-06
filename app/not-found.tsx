import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bg-cream flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/ava-icon.svg" alt="" className="size-24" />
      <p className="eyebrow mt-8 justify-center">Fehler 404</p>
      <h1 className="display text-olive-deep mt-5 text-6xl">
        Diese Seite ist <em>leer gegessen.</em>
      </h1>
      <p className="text-muted mt-5 max-w-md">Die gesuchte Seite gibt es nicht (mehr). Aber auf der Startseite ist noch reichlich da.</p>
      <Link href="/" className="btn btn-primary mt-10">Zur Startseite</Link>
    </main>
  )
}
