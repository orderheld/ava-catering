'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { uploadImage, type ActionState } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

export function SubmitButton({ children, className, pendingText = 'Speichern …' }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn('btn btn-primary !px-5 !py-2.5 text-sm disabled:opacity-60', className)}>
      {pending ? pendingText : children}
    </button>
  )
}

/** Formular mit Rückmeldung (Erfolg/Fehler) für Server-Actions mit ActionState. */
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
  const [state, formAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const res = await action(prev, fd)
    if (res?.ok && resetOnSuccess) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state?.error && <p className="bg-orange-soft text-orange-deep mt-4 rounded-xl px-3 py-2 text-sm">{state.error}</p>}
      {state?.ok && state.message && <p className="bg-olive-soft text-olive mt-4 rounded-xl px-3 py-2 text-sm">✓ {state.message}</p>}
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
