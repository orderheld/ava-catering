'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPushCategories, getPushPublicKey, sendTestPush, subscribePush, unsubscribePush, updatePushCategories } from '@/app/admin/push-actions'
import { pushCategories, pushCategoryLabels as labels, type PushCategory } from '@/lib/push-shared'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'install' | 'unsupported' | 'denied' | 'ask' | 'on' | 'off'

const CHANGED = 'ava-push-change'
const SW = { url: '/admin-sw.js', scope: '/admin' }

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

function keyBytes(base64: string) {
  const b = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0))
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration(SW.scope)) ?? navigator.serviceWorker.register(SW.url, { scope: SW.scope, updateViaCache: 'none' })
}

/** Meldet dieses Gerät beim Server an (oder frischt das Abo auf). Voraussetzung: Erlaubnis erteilt. */
async function ensureSubscribed(publicKey: string) {
  const reg = await registration()
  await navigator.serviceWorker.ready
  const key = keyBytes(publicKey)
  let sub = await reg.pushManager.getSubscription()
  const current = sub?.options.applicationServerKey
  if (sub && current && !new Uint8Array(current).every((b, i) => b === key[i])) {
    await sub.unsubscribe()
    sub = null
  }
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
  const res = await subscribePush(sub.toJSON())
  if (!res.ok) throw new Error(res.error)
  return sub
}

function usePush() {
  const [status, setStatus] = useState<Status>('loading')
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supported()) return setStatus(isIOS() && !isStandalone() ? 'install' : 'unsupported')
    const key = publicKey ?? (await getPushPublicKey().catch(() => null))
    if (!key) return setStatus('unsupported')
    setPublicKey(key)
    if (Notification.permission === 'denied') return setStatus('denied')
    if (Notification.permission === 'default') return setStatus('ask')
    const reg = await registration()
    const sub = await reg.pushManager.getSubscription()
    // Erlaubnis ist erteilt: Gerät still (wieder) anmelden, z.B. nach erneutem Login oder abgelaufenem Abo
    if (!sub || !(await getPushCategories(sub.endpoint))) {
      if (localStorage.getItem('ava-push-off') === '1') return setStatus('off')
      try {
        const s = await ensureSubscribed(key)
        setEndpoint(s.endpoint)
        return setStatus('on')
      } catch {
        return setStatus('off')
      }
    }
    setEndpoint(sub.endpoint)
    setStatus('on')
  }, [publicKey])

  useEffect(() => {
    refresh().catch(() => setStatus('unsupported'))
    const on = () => refresh().catch(() => {})
    window.addEventListener(CHANGED, on)
    return () => window.removeEventListener(CHANGED, on)
  }, [refresh])

  /** Muss direkt aus einem Tippen heraus aufgerufen werden (iOS verlangt das für die Abfrage). */
  const enable = useCallback(async () => {
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'ask')
        return
      }
      localStorage.removeItem('ava-push-off')
      const sub = await ensureSubscribed(publicKey ?? (await getPushPublicKey()) ?? '')
      setEndpoint(sub.endpoint)
      setStatus('on')
      window.dispatchEvent(new Event(CHANGED))
    } catch (err) {
      setError((err as Error).message || 'Aktivieren fehlgeschlagen.')
    }
  }, [publicKey])

  const disable = useCallback(async () => {
    const reg = await registration()
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await unsubscribePush(sub.endpoint)
      await sub.unsubscribe()
    }
    localStorage.setItem('ava-push-off', '1')
    setEndpoint(null)
    setStatus('off')
    window.dispatchEvent(new Event(CHANGED))
  }, [])

  return { status, endpoint, error, enable, disable }
}

type InstallEvent = Event & { prompt: () => Promise<void> }

/** Hinweisleiste oben im Admin: Mitteilungen aktivieren bzw. App installieren. Setzt ausserdem die Zahl auf dem App-Icon. */
export function PushPrompt({ newCount }: { newCount: number }) {
  const { status, error, enable } = usePush()
  const [hidden, setHidden] = useState(true)
  const [install, setInstall] = useState<InstallEvent | null>(null)

  useEffect(() => {
    setHidden(sessionStorage.getItem('ava-push-later') === '1')
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> }
    ;(newCount > 0 ? nav.setAppBadge?.(newCount) : nav.clearAppBadge?.())?.catch(() => {})
  }, [newCount])

  const later = () => {
    sessionStorage.setItem('ava-push-later', '1')
    setHidden(true)
  }

  if (hidden) return null
  let content: React.ReactNode = null
  if (status === 'ask') {
    content = (
      <>
        <p className="min-w-[14rem] flex-1">
          <b className="text-olive-deep">Mitteilungen aktivieren?</b> Neue Anfragen erscheinen dann sofort auf diesem Gerät.
          {error && <span className="text-orange-deep mt-1 block">{error}</span>}
        </p>
        <button onClick={enable} className="btn btn-primary shrink-0 !px-5 !py-2.5">Aktivieren</button>
      </>
    )
  } else if (status === 'install') {
    content = (
      <p className="min-w-[14rem] flex-1">
        <b className="text-olive-deep">Als App installieren, um Mitteilungen zu erhalten:</b> In Safari unten auf <b>Teilen</b>{' '}
        <svg viewBox="0 0 24 24" className="inline size-4 align-[-2px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Teilen-Symbol"><path d="M12 15V3m0 0L8 7m4-4 4 4M6 11H5v10h14V11h-1" /></svg>{' '}
        tippen, dann <b>«Zum Home-Bildschirm»</b>. Danach «AVA Admin» vom Home-Bildschirm öffnen und Mitteilungen erlauben.
      </p>
    )
  } else if (install && !isStandalone()) {
    content = (
      <>
        <p className="min-w-[14rem] flex-1"><b className="text-olive-deep">AVA Admin als App installieren</b> – mit eigenem Icon auf dem Startbildschirm.</p>
        <button onClick={() => install.prompt().then(() => setInstall(null))} className="btn btn-primary shrink-0">Installieren</button>
      </>
    )
  }
  if (!content) return null
  return (
    <div className="border-orange/30 bg-orange-soft/60 mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[1.4rem] border p-4 text-[0.95rem] leading-snug sm:p-5">
      {content}
      <button onClick={later} className="text-muted hover:text-ink shrink-0 text-xs">Später</button>
    </div>
  )
}

/** Einstellungen für dieses Gerät: an/aus, Kategorien, Test-Mitteilung. */
export function PushSettings() {
  const { status, endpoint, error, enable, disable } = usePush()
  const [cats, setCats] = useState<PushCategory[]>([])
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (endpoint) getPushCategories(endpoint).then((c) => setCats(c ?? [...pushCategories]))
  }, [endpoint])

  const toggle = async (c: PushCategory) => {
    if (!endpoint) return
    const next = cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c]
    setCats(next)
    await updatePushCategories(endpoint, next)
  }

  const test = async () => {
    if (!endpoint) return
    setBusy(true)
    setNote(null)
    const res = await sendTestPush(endpoint).catch(() => ({ ok: false }))
    setBusy(false)
    setNote(res.ok ? 'Test gesendet – die Mitteilung sollte gleich erscheinen.' : 'Test konnte nicht gesendet werden. Bitte Mitteilungen aus- und wieder einschalten.')
  }

  const text: Record<Status, string> = {
    loading: 'Wird geprüft …',
    install: 'Auf dem iPhone funktionieren Mitteilungen nur in der installierten App: In Safari auf Teilen → «Zum Home-Bildschirm» tippen und das Admin von dort öffnen.',
    unsupported: 'Dieser Browser unterstützt keine Push-Mitteilungen.',
    denied: 'Mitteilungen sind für dieses Gerät blockiert. Bitte in den Einstellungen des Geräts (iPhone: Einstellungen → Mitteilungen → AVA Admin) erlauben.',
    ask: 'Mitteilungen sind auf diesem Gerät noch nicht aktiviert.',
    off: 'Mitteilungen sind auf diesem Gerät ausgeschaltet.',
    on: 'Dieses Gerät erhält Mitteilungen.',
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5">
          <span className={cn('size-2.5 shrink-0 rounded-full', status === 'on' ? 'bg-olive' : status === 'loading' ? 'bg-line' : 'bg-orange')} />
          {text[status]}
        </p>
        {(status === 'ask' || status === 'off') && <button onClick={enable} className="btn btn-primary shrink-0">Aktivieren</button>}
        {status === 'on' && (
          <div className="flex shrink-0 gap-2">
            <button onClick={test} disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? 'Senden …' : 'Test senden'}</button>
            <button onClick={disable} className="btn btn-secondary">Ausschalten</button>
          </div>
        )}
      </div>
      {error && <p className="bg-orange-soft text-orange-deep rounded-xl px-3 py-2 text-sm">{error}</p>}
      {note && <p className="bg-olive-soft text-olive rounded-xl px-3 py-2 text-sm">{note}</p>}
      {status === 'on' && (
        <ul className="divide-line border-line divide-y rounded-2xl border">
          {pushCategories.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3">
                <span>
                  <span className="text-olive-deep block">{labels[c].label}</span>
                  <span className="text-muted text-xs">{labels[c].hint}</span>
                </span>
                <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(c)} className="accent-orange size-5 shrink-0" />
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className="text-muted text-xs">Die Einstellungen gelten pro Gerät. Auf jedem Handy oder Computer, auf dem Sie das Admin nutzen, können Mitteilungen separat aktiviert werden.</p>
    </div>
  )
}
