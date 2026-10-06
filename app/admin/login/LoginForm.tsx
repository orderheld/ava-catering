'use client'

import { useActionState } from 'react'
import { login, type ActionState } from '../actions'

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null)
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next ?? ''} />
      <div>
        <label htmlFor="password" className="label">Passwort</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="field" />
      </div>
      {state?.error && <p className="bg-orange-soft text-orange-deep rounded-xl px-3 py-2 text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? 'Anmelden …' : 'Anmelden'}
      </button>
    </form>
  )
}
