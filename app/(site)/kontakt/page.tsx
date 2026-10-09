import Link from 'next/link'
import { ContactForm } from '@/components/site/ContactForm'
import { ArrowRight, Clock, Instagram, Mail, Phone, Pin, Star, Whatsapp } from '@/components/Icons'
import { googleProfile, instagramUrl, phoneHours } from '@/lib/content'
import { PageHero } from '@/components/site/sections'
import { pageMeta } from '@/lib/seo'
import { getSettings } from '@/lib/data'
import { telHref } from '@/lib/utils'

export const revalidate = 300

export const metadata = pageMeta({
  title: 'Kontakt',
  description: 'AVA Catering, Dilsah Sever, Stegmatt 9a, 6264 Pfaffnau. Telefon 078 264 69 62, WhatsApp oder E-Mail an kontakt@avacatering.ch. Wir freuen uns auf Ihre Nachricht.',
  path: '/kontakt',
})

export default async function KontaktPage() {
  const s = await getSettings()
  return (
    <>
      <PageHero eyebrow="Kontakt" title="Wir freuen uns, von Ihnen zu *hören*." text="Für eine Catering-Anfrage nutzen Sie am besten unseren Anfrage-Assistenten. Für alles andere sind wir hier erreichbar." />
      <section className="container-x grid gap-10 pb-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:pb-32">
        <div className="space-y-4">
          {[
            { icon: Phone, label: 'Telefon', value: s.phone.replace('+41 ', '0'), href: telHref(s.phone) },
            { icon: Mail, label: 'E-Mail', value: s.email, href: `mailto:${s.email}` },
            ...(s.whatsapp ? [{ icon: Whatsapp, label: 'WhatsApp', value: 'Nachricht schreiben', href: `https://wa.me/${s.whatsapp}` }] : []),
            { icon: Pin, label: 'Adresse', value: `${s.street}, ${s.zip} ${s.city}`, href: googleProfile.profile },
            { icon: Instagram, label: 'Instagram', value: '@avacatering.ch', href: instagramUrl(s) },
            { icon: Star, label: 'Google', value: 'Bewertung schreiben', href: googleProfile.review },
          ].map(({ icon: I, label, value, href }, i) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              data-reveal
              style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
              className="card group hover:border-orange flex items-center gap-5 p-5 transition"
            >
              <span className="bg-orange-soft text-orange group-hover:bg-orange grid size-12 shrink-0 place-items-center rounded-full transition group-hover:text-white">
                <I className="size-5" />
              </span>
              <span>
                <span className="text-muted block text-xs tracking-[0.2em] uppercase">{label}</span>
                <span className="text-olive-deep mt-0.5 block font-serif text-2xl">{value}</span>
              </span>
            </a>
          ))}
          {phoneHours.length > 0 && (
            <div data-reveal className="card flex gap-5 p-5">
              <span className="bg-orange-soft text-orange grid size-12 shrink-0 place-items-center rounded-full">
                <Clock className="size-5" />
              </span>
              <span>
                <span className="text-muted block text-xs tracking-[0.2em] uppercase">Telefonisch erreichbar</span>
                {phoneHours.map((h) => (
                  <span key={h.label} className="text-olive-deep mt-1 flex justify-between gap-6">
                    <span>{h.label}</span>
                    <span>{h.opens}–{h.closes}</span>
                  </span>
                ))}
              </span>
            </div>
          )}
          <div data-reveal className="bg-olive-deep text-olive-soft rounded-[1.75rem] p-7">
            <p className="font-serif text-2xl text-cream">Catering anfragen?</p>
            <p className="mt-2 text-sm leading-relaxed">Mit dem Anfrage-Assistenten erhalten wir alle wichtigen Angaben auf einen Blick – und Sie schneller ein Angebot.</p>
            <Link href="/anfrage" className="btn btn-primary mt-5 !py-3 text-sm">
              Zum Anfrage-Assistenten <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div data-reveal style={{ '--d': '120ms' } as React.CSSProperties}>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
