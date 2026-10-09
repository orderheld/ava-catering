'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { uploadImage, type ActionState } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

/* ───────── Rückmeldungen («Gespeichert ✓») ───────── */

type Toast = { id: number; text: string; kind: 'ok' | 'error' }
const TOAST = 'ava-toast'

export function toast(text: string, kind: Toast['kind'] = 'ok') {
  window.dispatchEvent(new CustomEvent(TOAST, { detail: { text, kind } }))
}

/** Zeigt Rückmeldungen unten in der Mitte (auf dem Handy über der Menüleiste). */
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([])
  useEffect(() => {
    let n = 0
    const on = (e: Event) => {
      const { text, kind } = (e as CustomEvent<Omit<Toast, 'id'>>).detail
      const id = ++n
      setItems((l) => [...l.slice(-2), { id, text, kind }])
      setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === 'error' ? 6000 : 3200)
    }
    window.addEventListener(TOAST, on)
    return () => window.removeEventListener(TOAST, on)
  }, [])
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
      {items.map((t) => (
        <p
          key={t.id}
          className={cn(
            'animate-[toast-in_.35s_var(--ease-soft)] max-w-md rounded-2xl px-5 py-3.5 text-[0.95rem] font-medium shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]',
            t.kind === 'ok' ? 'bg-olive-deep text-white' : 'bg-orange-deep text-white',
          )}
        >
          {t.kind === 'ok' ? '✓ ' : '⚠ '}
          {t.text}
        </p>
      ))}
    </div>
  )
}

export function SubmitButton({ children, className, pendingText = 'Speichern …' }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn('btn btn-primary !px-6 !py-3 disabled:opacity-60', className)}>
      {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
      {pending ? pendingText : children}
    </button>
  )
}

function report(res: ActionState | void, fallback?: string) {
  if (res?.error) toast(res.error, 'error')
  else if (res?.message || fallback) toast(res?.message || fallback!)
}

/** Formular mit Rückmeldung für Server-Actions mit (prev, formData). Lädt die Seite danach neu. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  children: React.ReactNode
  className?: string
  resetOnSuccess?: boolean
}) {
  const ref = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [state, formAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const res: ActionState = await action(prev, fd).catch(() => ({ error: 'Speichern fehlgeschlagen. Bitte nochmals versuchen.' }))
    report(res)
    if (res?.ok) {
      if (resetOnSuccess) ref.current?.reset()
      router.refresh()
    }
    return res
  }, null)
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state?.error && <p className="bg-orange-soft text-orange-deep mt-4 rounded-xl px-4 py-3">{state.error}</p>}
    </form>
  )
}

/** Kleines Formular für Server-Actions mit nur formData (Speichern, Löschen, Verschieben …). Optional mit Rückfrage. */
export function QuickForm({
  action,
  children,
  className,
  confirm: question,
  success,
}: {
  action: (fd: FormData) => Promise<ActionState | void>
  children: React.ReactNode
  className?: string
  confirm?: string
  success?: string
}) {
  const router = useRouter()
  return (
    <form
      className={className}
      onSubmit={(e) => {
        if (question && !window.confirm(question)) e.preventDefault()
      }}
      action={async (fd) => {
        const res = await action(fd).catch((err) => {
          // redirect() aus einer Server-Action ist kein Fehler
          if (String(err?.digest ?? '').startsWith('NEXT_REDIRECT')) throw err
          return { error: 'Das hat nicht geklappt. Bitte nochmals versuchen.' }
        })
        report(res, success)
        router.refresh()
      }}
    >
      {children}
    </form>
  )
}

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}

/** Bildfeld: Upload zu Vercel Blob oder URL eintragen. Schreibt die URL in ein verstecktes Feld `name`. */
export function ImageField({ name, defaultValue = '', label = 'Bild' }: { name: string; defaultValue?: string; label?: string }) {
  const [url, setUrl] = useState(defaultValue)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <div className="bg-sand border-line relative size-24 shrink-0 overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url && <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          {pending && <div className="absolute inset-0 grid place-items-center bg-white/70 text-xs">Lädt …</div>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input type="hidden" name={name} value={url} />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/images/… oder https://…"
            className="field !py-2.5 text-sm"
            aria-label={`${label} URL`}
          />
          <label className="text-olive hover:text-orange inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setError('')
                const fd = new FormData()
                fd.append('file', file)
                start(async () => {
                  const res = await uploadImage(fd)
                  if (res.url) setUrl(res.url)
                  else setError(res.error ?? 'Upload fehlgeschlagen')
                })
              }}
            />
            ↑ Bild hochladen
          </label>
          {error && <p className="text-orange-deep text-sm">{error}</p>}
        </div>
      </div>
    </div>
  )
}

/** Aufklappbarer Bereich, der nach dem Speichern offen bleibt. */
export function Fold({ id, summary, children, className, summaryClassName }: { id: string; summary: React.ReactNode; children: React.ReactNode; className?: string; summaryClassName?: string }) {
  const key = `ava-fold-${id}`
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try {
      setOpen(sessionStorage.getItem(key) === '1')
    } catch {}
  }, [key])
  const toggle = () => {
    setOpen((o) => {
      try {
        sessionStorage.setItem(key, o ? '0' : '1')
      } catch {}
      return !o
    })
  }
  return (
    <div className={className}>
      <button type="button" onClick={toggle} aria-expanded={open} className={cn('flex w-full items-center gap-4 text-left', summaryClassName)}>
        {summary}
        <svg viewBox="0 0 24 24" className={cn('text-muted size-6 shrink-0 transition', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && children}
    </div>
  )
}
