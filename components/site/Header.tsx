'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Close, Menu, Phone } from '@/components/Icons'
import { cn, telHref } from '@/lib/utils'

const nav = [
  { href: '/angebot', label: 'Angebot' },
  { href: '/angebot#themen-party', label: 'Themen-Party' },
  { href: '/#ueber-uns', label: 'Über uns' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Header({ phone, announcement }: { phone: string; announcement: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      {announcement && (
        <div className="bg-olive text-olive-soft px-4 py-2 text-center text-[0.82rem] tracking-wide">{announcement}</div>
      )}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled ? 'bg-cream/85 border-line/70 border-b shadow-[0_8px_30px_-20px_rgba(38,37,30,0.35)] backdrop-blur-xl' : 'bg-cream border-b border-transparent',
        )}
      >
        <div className={cn('container-x flex items-center justify-between transition-all duration-500', scrolled ? 'h-16' : 'h-20 lg:h-24')}>
          <Link href="/" className="relative z-10 shrink-0" aria-label="AVA Catering – Startseite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/ava-logo-horizontal.svg"
              alt="AVA Catering"
              className={cn('w-auto transition-all duration-500', scrolled ? 'h-8' : 'h-9 lg:h-11')}
            />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Hauptnavigation">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'link-underline text-[0.95rem] tracking-wide transition-colors hover:text-orange',
                  pathname === n.href.split('#')[0] && !n.href.includes('#') ? 'text-orange' : 'text-ink/80',
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href={telHref(phone)} className="text-olive hover:text-orange hidden items-center gap-2 text-sm tracking-wide xl:flex">
              <Phone className="size-4" />
              {phone.replace('+41 ', '0')}
            </a>
            <Link href="/anfrage" className="btn btn-primary hidden !px-5 !py-2.5 text-sm sm:inline-flex">
              Anfrage starten
              <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-olive hover:bg-olive/5 relative z-10 grid size-11 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
            >
              {open ? <Close className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        id="mobile-nav"
        className={cn(
          'bg-cream fixed inset-0 z-40 flex flex-col px-6 pt-28 pb-10 transition-all duration-500 ease-(--ease-soft) lg:hidden',
          open ? 'visible opacity-100' : 'invisible -translate-y-4 opacity-0',
        )}
      >
        <nav className="flex flex-col" aria-label="Mobile Navigation">
          {[{ href: '/', label: 'Start' }, ...nav].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="border-line text-olive-deep flex items-baseline justify-between border-b py-4 font-serif text-4xl"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {n.label}
              <span className="text-orange font-sans text-xs tracking-[0.2em]">0{i + 1}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          <Link href="/anfrage" className="btn btn-primary w-full">
            Anfrage starten <ArrowRight className="size-4" />
          </Link>
          <a href={telHref(phone)} className="btn btn-secondary w-full">
            <Phone className="size-4" /> {phone.replace('+41 ', '0')}
          </a>
        </div>
      </div>
    </>
  )
}
