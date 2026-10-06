import type { InquiryStatus } from '@/db/schema'
import { cn } from '@/lib/utils'

export const statusMeta: Record<InquiryStatus, { label: string; cls: string }> = {
  neu: { label: 'Neu', cls: 'bg-orange text-white' },
  in_bearbeitung: { label: 'In Bearbeitung', cls: 'bg-orange-soft text-orange-deep' },
  offeriert: { label: 'Offeriert', cls: 'bg-sky-100 text-sky-800' },
  bestaetigt: { label: 'Bestätigt', cls: 'bg-olive text-white' },
  erledigt: { label: 'Erledigt', cls: 'bg-olive-soft text-olive' },
  abgesagt: { label: 'Abgesagt', cls: 'bg-stone-200 text-stone-600' },
}

export function StatusBadge({ status }: { status: string }) {
  const m = statusMeta[status as InquiryStatus] ?? { label: status, cls: 'bg-stone-200' }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', m.cls)}>{m.label}</span>
}

export function PageTitle({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-olive-deep font-serif text-4xl font-medium sm:text-5xl">{title}</h1>
        {text && <p className="text-muted mt-2 max-w-2xl">{text}</p>}
      </div>
      {children}
    </div>
  )
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn('border-line rounded-3xl border bg-white p-5 sm:p-7', className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="text-olive-deep font-serif text-2xl">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function DbMissing() {
  return (
    <Panel title="Datenbank noch nicht verbunden">
      <p className="text-muted leading-relaxed">
        Damit Anfragen gespeichert und Inhalte bearbeitet werden können, braucht das Admin-Panel eine Neon-Datenbank. In Vercel unter <b>Storage → Neon</b>{' '}
        eine Datenbank verbinden (setzt <code className="bg-sand rounded px-1">DATABASE_URL</code> automatisch) und danach einmal{' '}
        <code className="bg-sand rounded px-1">npm run db:push</code> ausführen. Details stehen im README.
      </p>
    </Panel>
  )
}
