import { isAdmin } from '@/lib/auth'
import { getSubscription, removeSubscription, saveSubscription, setCategories } from '@/lib/push'

// Wird vom Service Worker aufgerufen, wenn der Browser ein Push-Abo erneuert.
export async function POST(request: Request) {
  if (!(await isAdmin())) return new Response(null, { status: 401 })
  const { old, sub } = (await request.json().catch(() => ({}))) as {
    old?: string
    sub?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys.auth) return new Response(null, { status: 400 })
  const previous = old ? await getSubscription(old) : null
  const row = await saveSubscription({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, previous?.device ?? null)
  if (previous && old !== row.endpoint) {
    await setCategories(row.endpoint, previous.categories)
    await removeSubscription(old!)
  }
  return new Response(null, { status: 204 })
}
