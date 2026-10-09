// Service Worker für AVA Admin: zeigt Push-Mitteilungen an und öffnet beim Antippen die passende Seite.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'AVA Catering'
  const tasks = [
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/admin-app/icon-192.png',
      badge: '/admin-app/badge-96.png',
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/admin' },
    }),
  ]
  // Zahl der neuen Anfragen auf dem App-Icon
  if (typeof data.badge === 'number' && 'setAppBadge' in self.navigator) {
    tasks.push(data.badge > 0 ? self.navigator.setAppBadge(data.badge) : self.navigator.clearAppBadge())
  }
  event.waitUntil(Promise.all(tasks).catch(() => {}))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/admin', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin + '/admin') && 'focus' in client) {
          return client.focus().then((c) => (c && 'navigate' in c ? c.navigate(url) : undefined))
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

// Browser hat das Abo erneuert: neues Abo beim Server hinterlegen
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const key = event.oldSubscription?.options?.applicationServerKey
      if (!key) return
      const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
      await fetch('/api/push/renew', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ old: event.oldSubscription?.endpoint, sub: sub.toJSON() }),
      })
    })().catch(() => {}),
  )
})
