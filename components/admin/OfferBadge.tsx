import { offerStatusMeta, type OfferStatus } from '@/lib/offer'
import { cn } from '@/lib/utils'

export function OfferBadge({ status }: { status: string }) {
  const m = offerStatusMeta[status as OfferStatus] ?? { label: status, cls: 'bg-stone-200' }
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-[0.8rem] font-medium whitespace-nowrap', m.cls)}>{m.label}</span>
}
