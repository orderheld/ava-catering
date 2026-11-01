'use client'

import { useCallback, useEffect, useRef } from 'react'
import { getFormToken } from '@/lib/inquiry'

const MIN_MS = 3300 // etwas mehr als MIN_FILL_MS in lib/spam.ts
const REFRESH_MS = 6 * 3600_000

/**
 * Holt beim Öffnen einen signierten Formular-Token (Spam-Schutz) und hängt ihn beim Absenden an.
 * Ist der Token zu frisch oder fehlt er, wird kurz gewartet statt eine echte Anfrage zu verlieren.
 */
export function useFormGuard() {
  const tok = useRef<{ value: string; at: number } | null>(null)

  const load = useCallback(async () => {
    try {
      tok.current = { value: await getFormToken(), at: Date.now() }
    } catch {
      /* beim Absenden nochmals versuchen */
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return useCallback(
    async (fd: FormData) => {
      if (!tok.current || Date.now() - tok.current.at > REFRESH_MS) await load()
      if (tok.current) {
        const wait = MIN_MS - (Date.now() - tok.current.at)
        if (wait > 0) await new Promise((r) => setTimeout(r, wait))
        fd.set('ft', tok.current.value)
      }
      return fd
    },
    [load],
  )
}
