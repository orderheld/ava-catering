export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/** Wandelt *Text* in <em> um (für Akzent-Wörter in Überschriften). */
export function accentParts(text: string): { text: string; accent: boolean }[] {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((p) =>
    p.startsWith('*') && p.endsWith('*') ? { text: p.slice(1, -1), accent: true } : { text: p, accent: false },
  )
}

export const plain = (text: string) => text.replaceAll('*', '')

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export function formatDate(d: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }) {
  if (!d) return '–'
  const date = typeof d === 'string' ? new Date(d.length === 10 ? `${d}T12:00:00` : d) : d
  return new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', ...opts }).format(date)
}

export function formatDateTime(d: Date | string) {
  return formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Öffentliche Adresse: NEXT_PUBLIC_SITE_URL, sonst die Produktionsadresse von Vercel (z.B. *.vercel.app), sonst avacatering.ch. */
export const siteUrl = () =>
  (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://avacatering.ch')
  ).replace(/\/$/, '')

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
