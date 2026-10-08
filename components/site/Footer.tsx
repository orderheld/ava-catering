import Link from 'next/link'
import type { SiteSettings } from '@/lib/content'
import { Mail, Phone, Pin, Whatsapp } from '@/components/Icons'
import { telHref } from '@/lib/utils'

export function Footer({ s }: { s: SiteSettings }) {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-olive-deep text-olive-soft relative overflow-hidden">
      <svg className="text-orange/70 pointer-events-none absolute -top-10 right-0 h-[130%] w-[60%] opacity-40" viewBox="0 0 600 600" fill="none" aria-hidden>
        <path d="M600 40C420 60 300 160 320 300s-120 260-320 280" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <div className="container-x relative grid gap-14 py-20 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-24">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ava-logo-hell.svg" alt="AVA Catering" className="h-24 w-auto" />
          <p className="text-olive-soft/75 mt-6 max-w-xs text-[0.95rem] leading-relaxed">
            Hausgemachtes Catering von Dilsah Sever aus Pfaffnau: für Firmenanlässe, Teamlunches und private Feiern.
          </p>
        </div>
        <div>
          <h3 className="text-orange mb-5 text-xs font-medium tracking-[0.25em] uppercase">Angebot</h3>
          <ul className="space-y-3 text-[0.95rem]">
            {[
              ['Apéro-Buffet', '/angebot/apero'],
              ['Mezze-Buffet', '/angebot/mezze'],
              ['Lunch-Buffet', '/angebot/lunch'],
              ['Themen-Party-Service', '/angebot/themen-party'],
              ['Süsses & Gebäck', '/angebot/suesses'],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="link-underline hover:text-white">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-orange mb-5 text-xs font-medium tracking-[0.25em] uppercase">Kontakt</h3>
          <ul className="space-y-3.5 text-[0.95rem]">
            <li className="flex gap-3">
              <Pin className="mt-0.5 size-4 shrink-0" />
              <span>
                {s.street}
                <br />
                {s.zip} {s.city}
              </span>
            </li>
            <li>
              <a href={telHref(s.phone)} className="flex items-center gap-3 hover:text-white">
                <Phone className="size-4" /> {s.phone.replace('+41 ', '0')}
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="size-4" /> {s.email}
              </a>
            </li>
            {s.whatsapp && (
              <li>
                <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white">
                  <Whatsapp className="size-4" /> WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-orange mb-5 text-xs font-medium tracking-[0.25em] uppercase">Seiten</h3>
          <ul className="space-y-3 text-[0.95rem]">
            {[
              ['Für Firmen', '/firmen'],
              ['Für Private', '/privat'],
              ['Über uns', '/ueber-uns'],
              ['Galerie', '/galerie'],
              ['Häufige Fragen', '/faq'],
              ['Kontakt', '/kontakt'],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="link-underline hover:text-white">{l}</Link>
              </li>
            ))}
          </ul>
          <Link href="/anfrage" className="btn btn-primary mt-8 !px-5 !py-3 text-sm">Anfrage starten</Link>
        </div>
      </div>
      <div className="border-olive-soft/10 border-t">
        <div className="container-x text-olive-soft/60 flex flex-col gap-3 py-6 pb-24 text-[0.8rem] sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
          <p>© {year} AVA Catering · Dilsah Sever · {s.city}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/impressum" className="hover:text-white">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
            <Link href="/admin" className="hover:text-white">Login</Link>
          </div>
          <p>
            Webdesign by{' '}
            <a href="https://webnova.ch" target="_blank" rel="noopener" className="text-olive-soft hover:text-orange underline-offset-4 hover:underline">
              webnova.ch
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
