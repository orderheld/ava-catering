import Link from 'next/link'
import { Phone } from '@/components/Icons'
import { telHref } from '@/lib/utils'

/** Fixe Aktionsleiste auf dem Handy: Anrufen + Anfrage. */
export function MobileBar({ phone }: { phone: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="bg-olive-deep/95 pointer-events-auto flex gap-2 rounded-full p-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur">
        <a href={telHref(phone)} className="text-olive-soft grid size-12 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Anrufen">
          <Phone className="size-5" />
        </a>
        <Link href="/anfrage" className="btn btn-primary flex-1 !py-3 text-[0.95rem]">
          Unverbindlich anfragen
        </Link>
      </div>
    </div>
  )
}
