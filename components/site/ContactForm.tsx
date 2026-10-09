'use client'

import Link from 'next/link'
import { startTransition, useActionState, useState } from 'react'
import { ArrowRight, Check } from '@/components/Icons'
import { submitInquiry, type InquiryState } from '@/lib/inquiry'

export function ContactForm() {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null)
  const [t] = useState(() => Date.now())
  const fe = state?.fieldErrors ?? {}

  if (state?.ok) {
    return (
      <div className="card p-10 text-center">
        <div className="bg-olive text-cream mx-auto grid size-16 place-items-center rounded-full">
          <Check className="size-7" />
        </div>
        <p className="display text-olive-deep mt-6 text-4xl">Danke{state.name ? `, ${state.name}` : ''}!</p>
        <p className="text-muted mt-3">Ihre Nachricht ist angekommen – wir melden uns bald.</p>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="card grid gap-5 p-6 sm:p-10"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input type="hidden" name="kind" value="kontakt" />
      <input type="hidden" name="t" value={t} />
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Name *</label>
          <input id="c-name" name="name" className="field" autoComplete="name" />
          {fe.name && <p className="text-orange-deep mt-2 text-sm">{fe.name}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">Telefon</label>
          <input id="c-phone" name="phone" type="tel" className="field" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="label">E-Mail *</label>
        <input id="c-email" name="email" type="email" className="field" autoComplete="email" />
        {fe.email && <p className="text-orange-deep mt-2 text-sm">{fe.email}</p>}
      </div>
      <div>
        <label htmlFor="c-msg" className="label">Nachricht</label>
        <textarea id="c-msg" name="message" rows={5} className="field resize-y" />
      </div>
      <label className="text-muted flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" className="accent-orange mt-1 size-4 shrink-0" />
        <span>
          Ich bin mit der Verarbeitung meiner Angaben gemäss <Link href="/datenschutz" className="text-[#a84505] underline underline-offset-2">Datenschutzerklärung</Link> einverstanden. *
        </span>
      </label>
      {fe.consent && <p className="text-orange-deep -mt-3 text-sm">{fe.consent}</p>}
      {state?.error && <p className="bg-orange-soft text-orange-deep rounded-2xl px-4 py-3 text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start disabled:opacity-60">
        {pending ? 'Wird gesendet …' : 'Nachricht senden'} <ArrowRight className="size-4" />
      </button>
    </form>
  )
}
