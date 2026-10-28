'use client'

import { useActionState, useState } from 'react'
import { acceptOffer } from '../actions'

export function AcceptOffer({ token }: { token: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(acceptOffer, null)

  if (state?.ok) {
    return (
      <div className="bg-olive rounded-[1.6rem] p-6 text-center text-white">
        <p className="font-serif text-3xl">Herzlichen Dank!</p>
        <p className="mt-2 text-white/85">Ihre Zusage ist bei uns angekommen. Sie erhalten gleich eine Bestätigung per E-Mail.</p>
      </div>
    )
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary w-full !py-4 text-lg sm:w-auto sm:!px-10">
        ✓ Offerte annehmen
      </button>
    )
  }
  return (
    <form action={action} className="border-line space-y-4 rounded-[1.6rem] border bg-white p-5 text-left sm:p-6">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="note" className="label">Bemerkung (optional)</label>
        <textarea id="note" name="note" rows={3} className="field resize-y" placeholder="z.B. definitive Personenzahl, Allergien, Ansprechperson vor Ort …" />
      </div>
      {state?.error && <p className="bg-orange-soft text-orange-deep rounded-xl px-4 py-3">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn btn-primary !py-3.5 disabled:opacity-60">{pending ? 'Wird gesendet …' : 'Verbindlich annehmen'}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-muted px-3 py-2">Abbrechen</button>
      </div>
    </form>
  )
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-secondary w-full sm:w-auto">
      Als PDF speichern / drucken
    </button>
  )
}
