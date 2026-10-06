'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Übersicht', icon: 'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z' },
  { href: '/admin/anfragen', label: 'Anfragen', icon: 'M4 5h16v11H8l-4 4zM8 9h8M8 12h5' },
  { href: '/admin/kalender', label: 'Kalender', icon: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
  { href: '/admin/angebot', label: 'Angebot', icon: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h3' },
  { href: '/admin/galerie', label: 'Galerie', icon: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4' },
  { href: '/admin/einstellungen', label: 'Einstellungen', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12l2-1-1-3-2 .3-1.5-1.5L17 5l-3-1-1 2h-2L10 4 7 5l.5 1.8L6 8.3 4 8l-1 3 2 1v0l-2 1 1 3 2-.3 1.5 1.5L7 19l3 1 1-2h2l1 2 3-1-.5-1.8 1.5-1.5 2 .3 1-3z' },
]

export function Sidebar({ newCount }: { newCount: number }) {
  const path = usePathname()
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href))
  return (
    <aside className="bg-olive-deep text-olive-soft sticky top-0 z-30 flex shrink-0 flex-col lg:h-screen lg:w-64 lg:self-start">
      <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-7 lg:py-8">
        <Link href="/admin" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo-horizontal-hell.svg" alt="AVA Catering" className="h-7 w-auto lg:h-8" />
        </Link>
        <Link href="/" target="_blank" className="text-olive-soft/60 hover:text-white text-xs lg:mt-3 lg:block">Website ansehen ↗</Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:pb-0 [scrollbar-width:none]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition lg:rounded-2xl',
              active(l.href) ? 'bg-white/12 text-white' : 'hover:bg-white/6 hover:text-white',
            )}
          >
            <svg viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
              <path d={l.icon} />
            </svg>
            {l.label}
            {l.href === '/admin/anfragen' && newCount > 0 && <span className="bg-orange ml-auto rounded-full px-2 py-0.5 text-[0.7rem] text-white">{newCount}</span>}
          </Link>
        ))}
      </nav>
      <form action={logout} className="mt-auto hidden p-6 lg:block">
        <button className="text-olive-soft/60 hover:text-white text-sm">Abmelden</button>
      </form>
    </aside>
  )
}
