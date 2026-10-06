import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { MobileBar } from '@/components/site/MobileBar'
import { RevealObserver } from '@/components/Reveal'
import { getSettings } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings()
  return (
    <>
      <a href="#main" className="bg-orange sr-only z-[60] rounded-full px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Zum Inhalt springen
      </a>
      <Header phone={s.phone} announcement={s.announcement} />
      <main id="main">{children}</main>
      <Footer s={s} />
      <MobileBar phone={s.phone} />
      <RevealObserver />
    </>
  )
}
