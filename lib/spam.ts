import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Spam-Schutz für die öffentlichen Formulare (Anfrage + Kontakt), ohne Captcha.
 *
 * 1. Formular-Token: beim Öffnen holt der Browser einen vom Server signierten Zeitstempel.
 *    Wer das Formular ohne Seite direkt abschickt oder schneller als ein Mensch ist, fliegt still raus.
 *    Gemessen wird mit der Server-Uhr – eine falsch gehende Uhr beim Besucher spielt keine Rolle.
 * 2. Inhalt: Links, Werbe-Stichworte, fremde Schriften usw. ergeben Punkte. Verdächtige Anfragen
 *    werden NICHT gelöscht, sondern im Admin unter «Spam» abgelegt (ohne E-Mail und Push).
 */

export const MIN_FILL_MS = 3000
const MAX_AGE_MS = 24 * 3600_000

const secret = () => process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'ava-formular'
const sign = (ts: string) => createHmac('sha256', secret()).update(`formular:${ts}`).digest('base64url').slice(0, 24)

export function createFormToken(now = Date.now()) {
  const ts = String(now)
  return `${ts}.${sign(ts)}`
}

export type TokenCheck = 'ok' | 'missing' | 'invalid' | 'fast' | 'expired'

export function checkFormToken(token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== 'string' || !token) return 'missing'
  const [ts, sig] = token.split('.')
  if (!ts || !sig || !/^\d{13}$/.test(ts)) return 'invalid'
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(ts))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalid'
  const age = now - Number(ts)
  if (age < MIN_FILL_MS) return 'fast'
  if (age > MAX_AGE_MS) return 'expired'
  return 'ok'
}

const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|info|biz|xyz|top|site|online|ru|cn|io|co|shop|store)\b/gi
const MARKUP_RE = /<\s*a\s|<\/a>|\[url|\[link|href\s*=/i
const FOREIGN_SCRIPT_RE = /[Ѐ-ӿ฀-๿぀-ヿ一-鿿가-힯]/g
const KEYWORDS = [
  /\bseo\b/i, /backlinks?/i, /link ?building/i, /guest ?posts?/i, /\bcrypto/i, /bitcoin/i, /\bforex\b/i, /casino/i, /viagra|cialis/i,
  /\bporn/i, /\bloans?\b/i, /first page of google/i, /google rank/i, /(website|web) traffic/i, /lead generation/i, /outsourc/i,
  /virtual assistant/i, /app development/i, /web ?design services/i, /marketing (services|agency)/i, /\bunsubscribe\b/i,
  /increase (your )?(sales|traffic|revenue)/i, /\bdomain\b.*\bexpir/i, /dear (sir|madam|business owner)/i, /\binvestment opportunit/i,
]
const ENGLISH_RE = /\b(the|your|you|our|we|and|business|website|with|for|this)\b/gi
const GERMAN_RE = /\b(und|der|die|das|ich|wir|für|mit|bitte|personen|gäste|danke|grüsse|grüße)\b/gi

/** Punkte für verdächtigen Inhalt. Ab 3 Punkten gilt die Anfrage als Spam. */
export function spamCheck(f: { name?: string | null; company?: string | null; message?: string | null; location?: string | null; email?: string | null }) {
  const reasons: string[] = []
  let score = 0
  const add = (n: number, why: string) => {
    score += n
    reasons.push(why)
  }
  const message = f.message ?? ''
  const short = [f.name, f.company, f.location].filter(Boolean).join(' ')
  const all = `${short} ${message}`

  if (/https?:\/\/|www\.|\.(com|ru|xyz|top)\b/i.test(short)) add(3, 'Link im Namen/Firma/Ort')
  const links = message.match(URL_RE)?.length ?? 0
  if (links >= 2) add(3, `${links} Links`)
  else if (links === 1) add(1, '1 Link')
  if (MARKUP_RE.test(all)) add(3, 'HTML/BBCode')
  const letters = all.replace(/[^\p{L}]/gu, '').length
  const foreign = all.match(FOREIGN_SCRIPT_RE)?.length ?? 0
  if (foreign >= 5 && foreign / Math.max(letters, 1) > 0.2) add(3, 'Fremde Schrift')
  for (const k of KEYWORDS) if (k.test(all)) add(2, `Stichwort «${all.match(k)?.[0]}»`)
  const en = message.match(ENGLISH_RE)?.length ?? 0
  const de = message.match(GERMAN_RE)?.length ?? 0
  if (en >= 4 && de === 0) add(1, 'Englischer Text')
  if (f.name && f.email && f.name.replace(/\s/g, '').toLowerCase() === f.email.toLowerCase()) add(2, 'Name = E-Mail')

  return { spam: score >= 3, score, reasons }
}
