'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logout } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

type Item = { href: string; label: string; icon: string }

const icons = {
  home: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  inbox: 'M4 5h16v11H8l-4 4zM8 9h8M8 12h5',
  calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  menu: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h3',
  image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12l2-1-1-3-2 .3-1.5-1.5L17 5l-3-1-1 2h-2L10 4 7 5l.5 1.8L6 8.3 4 8l-1 3 2 1-2 1 1 3 2-.3 1.5 1.5L7 19l3 1 1-2h2l1 2 3-1-.5-1.8 1.5-1.5 2 .3 1-3z',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6zM9 12l2 2 4-4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  web: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3c2.5 2.6 3.5 5.6 3.5 9s-1 6.4-3.5 9c-2.5-2.6-3.5-5.6-3.5-9s1-6.4 3.5-9Z',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
}

const groups: { title: string; items: Item[] }[] = [
  {
    title: 'Tagesgeschäft',
    items: [
      { href: '/admin', label: 'Übersicht', icon: icons.home },
      { href: '/admin/anfragen', label: 'Anfragen', icon: icons.inbox },
      { href: '/admin/kalender', label: 'Kalender', icon: icons.calendar },
    ],
  },
  {
    title: 'Website',
    items: [
      { href: '/admin/angebot', label: 'Angebot & Themen', icon: icons.menu },
      { href: '/admin/galerie', label: 'Galerie', icon: icons.image },
      { href: '/admin/einstellungen', label: 'Texte & Einstellungen', icon: icons.settings },
    ],
  },
  {
    title: 'Sicherheit',
    items: [{ href: '/admin/verlauf', label: 'Verlauf & Prüfung', icon: icons.shield }],
  },
]

const tabs: Item[] = [
  { href: '/admin', label: 'Übersicht', icon: icons.home },
  { href: '/admin/anfragen', label: 'Anfragen', icon: icons.inbox },
  { href: '/admin/kalender', label: 'Kalender', icon: icons.calendar },
  { href: '/admin/angebot', label: 'Angebot', icon: icons.menu },
]

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const Badge = ({ n }: { n: number }) =>
  n > 0 ? <span className="bg-orange ml-auto min-w-6 rounded-full px-2 py-0.5 text-center text-[0.75rem] leading-5 font-semibold text-white">{n}</span> : null

export function Sidebar({ newCount }: { newCount: number }) {
  const path = usePathname()
  const [more, setMore] = useState(false)
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href))
  const inMore = !tabs.some((t) => active(t.href))

  useEffect(() => setMore(false), [path])

  return (
    <>
      {/* Tablet & Laptop: feste Seitenleiste */}
      <aside className="bg-olive-deep text-olive-soft sticky top-0 hidden h-dvh w-60 self-start shrink-0 flex-col overflow-y-auto md:flex lg:w-72">
        <Link href="/admin" className="block px-6 pt-8 pb-6 lg:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo-horizontal-hell.svg" alt="AVA Catering – Admin" className="h-9 w-auto" />
        </Link>
        <nav className="flex-1 space-y-7 px-3 lg:px-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-olive-soft/45 mb-2 px-4 text-[0.72rem] font-medium tracking-[0.2em] uppercase">{g.title}</p>
              <ul className="space-y-1">
                {g.items.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active(l.href) ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[1.02rem] transition',
                        active(l.href) ? 'bg-white text-olive-deep font-medium shadow-sm' : 'hover:bg-white/8 hover:text-white',
                      )}
                    >
                      <Icon d={l.icon} className={active(l.href) ? 'text-orange' : ''} />
                      {l.label}
                      {l.href === '/admin/anfragen' && <Badge n={newCount} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3 lg:p-4">
          <Link href="/" target="_blank" className="hover:bg-white/8 flex items-center gap-3.5 rounded-2xl px-4 py-3 hover:text-white">
            <Icon d={icons.web} /> Website ansehen
          </Link>
          <form action={logout}>
            <button className="hover:bg-white/8 flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left hover:text-white">
              <Icon d={icons.logout} /> Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Handy: Kopfzeile + Menüleiste unten */}
      <header className="bg-olive-deep sticky top-0 z-40 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 md:hidden">
        <Link href="/admin" aria-label="Übersicht">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo-horizontal-hell.svg" alt="AVA Catering" className="h-7 w-auto" />
        </Link>
        <Link href="/admin/anfragen?status=neu" className="text-olive-soft flex items-center gap-2 text-sm">
          {newCount > 0 ? <><span className="bg-orange rounded-full px-2.5 py-0.5 font-semibold text-white">{newCount}</span> neu</> : 'Keine neuen Anfragen'}
        </Link>
      </header>

      <nav className="border-line fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Hauptmenü">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active(t.href) ? 'page' : undefined}
            className={cn('relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[0.72rem] font-medium', active(t.href) ? 'text-orange' : 'text-muted')}
          >
            <Icon d={t.icon} />
            {t.label}
            {t.href === '/admin/anfragen' && newCount > 0 && (
              <span className="bg-orange absolute top-1 left-1/2 ml-2 min-w-5 rounded-full px-1.5 text-center text-[0.68rem] leading-5 text-white">{newCount}</span>
            )}
          </Link>
        ))}
        <button
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className={cn('flex flex-col items-center gap-1 pt-2.5 pb-2 text-[0.72rem] font-medium', more || inMore ? 'text-orange' : 'text-muted')}
        >
          <Icon d={icons.more} className="stroke-[3]" />
          Mehr
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] bg-white px-4 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-line mx-auto mb-4 h-1.5 w-12 rounded-full" />
            <ul className="space-y-1">
              {[...groups[1].items.slice(1), ...groups[2].items].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={cn('flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[1.05rem]', active(l.href) ? 'bg-orange-soft text-orange-deep' : 'text-olive-deep')}>
                    <Icon d={l.icon} /> {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" target="_blank" className="text-olive-deep flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[1.05rem]">
                  <Icon d={icons.web} /> Website ansehen
                </Link>
              </li>
              <li>
                <form action={logout}>
                  <button className="text-muted flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-[1.05rem]">
                    <Icon d={icons.logout} /> Abmelden
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
