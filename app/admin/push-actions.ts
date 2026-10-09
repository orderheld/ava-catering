'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { pushCategories, type PushCategory } from '@/lib/push-shared'
import { requireAdmin } from '@/lib/auth'
import { getSubscription, getVapid, notifyAdmins, removeSubscription, saveSubscription, setCategories } from '@/lib/push'

const subSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
})

function deviceName(ua: string) {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Gerät'
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : ''
  return [os, browser].filter(Boolean).join(' · ')
}

export async function getPushPublicKey() {
  await requireAdmin()
  return (await getVapid())?.publicKey ?? null
}

/** Meldet dieses Gerät an. Gibt die eingeschalteten Kategorien zurück. */
export async function subscribePush(raw: unknown): Promise<{ ok: boolean; categories?: PushCategory[]; error?: string }> {
  await requireAdmin()
  const sub = subSchema.safeParse(raw)
  if (!sub.success) return { ok: false, error: 'Ungültiges Abo.' }
  try {
    const row = await saveSubscription(sub.data, deviceName((await headers()).get('user-agent') ?? ''))
    return { ok: true, categories: row.categories }
  } catch (err) {
    console.error('[push] Anmelden fehlgeschlagen:', err)
    return { ok: false, error: 'Speichern fehlgeschlagen. Ist die Datenbank verbunden?' }
  }
}

export async function getPushCategories(endpoint: string) {
  await requireAdmin()
  return (await getSubscription(endpoint))?.categories ?? null
}

export async function updatePushCategories(endpoint: string, categories: string[]) {
  await requireAdmin()
  await setCategories(endpoint, pushCategories.filter((c) => categories.includes(c)))
}

export async function unsubscribePush(endpoint: string) {
  await requireAdmin()
  await removeSubscription(endpoint)
}

export async function sendTestPush(endpoint: string) {
  await requireAdmin()
  const { sent } = await notifyAdmins(
    { category: 'anfragen', title: 'Benachrichtigungen funktionieren', body: 'So sieht eine Mitteilung von AVA Admin aus.', url: '/admin', tag: 'test' },
    { endpoint },
  )
  return { ok: sent > 0 }
}
