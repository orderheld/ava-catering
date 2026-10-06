import 'server-only'
import { Resend } from 'resend'
import { escapeHtml, formatDate, siteUrl } from './utils'

const FROM = () => process.env.MAIL_FROM ?? 'AVA Catering <kontakt@avacatering.ch>'
const NOTIFY = () => process.env.MAIL_NOTIFY_TO ?? 'kontakt@avacatering.ch'

let client: Resend | null = null
function resend() {
  if (!process.env.RESEND_API_KEY) return null
  return (client ??= new Resend(process.env.RESEND_API_KEY))
}

type Send = { to: string; subject: string; html: string; text: string; replyTo?: string }

export async function sendMail({ to, subject, html, text, replyTo }: Send) {
  const r = resend()
  if (!r) {
    console.warn(`[mail] RESEND_API_KEY fehlt – E-Mail an ${to} nicht versendet: ${subject}`)
    return { ok: false as const, error: 'RESEND_API_KEY fehlt' }
  }
  const { error } = await r.emails.send({ from: FROM(), to, subject, html, text, replyTo })
  if (error) {
    console.error('[mail] Versand fehlgeschlagen:', error)
    return { ok: false as const, error: error.message }
  }
  return { ok: true as const }
}

const C = { orange: '#E8650A', olive: '#4A5822', cream: '#FBF7F0', sand: '#F3EBDD', ink: '#26251E', muted: '#6B6656' }

/** Gemeinsames Layout aller E-Mails (Tabellen + Inline-Styles für Outlook & Co.). */
export function layout(title: string, inner: string, preheader = '') {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.sand};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.cream};border-radius:18px;overflow:hidden">
<tr><td style="padding:36px 40px 8px;text-align:center"><img src="${siteUrl()}/brand/ava-logo-email.png" width="200" alt="AVA Catering" style="display:inline-block;width:200px;height:auto;border:0"></td></tr>
<tr><td style="padding:8px 40px 36px;font-size:15px;line-height:1.65">${inner}</td></tr>
<tr><td style="background:${C.olive};color:#E9EBDD;padding:22px 40px;font-size:12px;line-height:1.6;text-align:center">
AVA Catering · Dilsah Sever · Stegmatt 9a · 6264 Pfaffnau<br>
<a href="tel:+41782646962" style="color:#fff;text-decoration:none">078 264 69 62</a> · <a href="mailto:kontakt@avacatering.ch" style="color:#fff;text-decoration:none">kontakt@avacatering.ch</a> · <a href="${siteUrl()}" style="color:#fff;text-decoration:none">avacatering.ch</a>
</td></tr></table></td></tr></table></body></html>`
}

const row = (k: string, v: string | number | null | undefined) =>
  v === null || v === undefined || v === ''
    ? ''
    : `<tr><td style="padding:7px 12px 7px 0;color:${C.muted};font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:7px 0;font-size:14px">${escapeHtml(String(v)).replace(/\n/g, '<br>')}</td></tr>`

export type InquiryMailData = {
  id: number
  kind: string
  eventType?: string | null
  offerings: string[]
  themes: string[]
  dietary: string[]
  eventDate?: string | null
  eventTime?: string | null
  guests?: number | null
  location?: string | null
  service?: string | null
  budget?: string | null
  name: string
  company?: string | null
  email: string
  phone?: string | null
  message?: string | null
}

function summaryTable(d: InquiryMailData) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #E6DCCB;margin:18px 0">
${row('Anlass', d.eventType)}${row('Datum', d.eventDate ? formatDate(d.eventDate) : null)}${row('Zeit', d.eventTime)}${row('Personen', d.guests)}
${row('Ort', d.location)}${row('Service', d.service)}${row('Angebot', d.offerings.join(', '))}${row('Themen', d.themes.join(', '))}
${row('Ernährung', d.dietary.join(', '))}${row('Budget p.P.', d.budget)}${row('Name', d.name)}${row('Firma', d.company)}
${row('E-Mail', d.email)}${row('Telefon', d.phone)}${row('Nachricht', d.message)}</table>`
}

function summaryText(d: InquiryMailData) {
  const l = (k: string, v: unknown) => (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length) ? '' : `${k}: ${Array.isArray(v) ? v.join(', ') : v}\n`)
  return (
    l('Anlass', d.eventType) + l('Datum', d.eventDate ? formatDate(d.eventDate) : null) + l('Zeit', d.eventTime) + l('Personen', d.guests) +
    l('Ort', d.location) + l('Service', d.service) + l('Angebot', d.offerings) + l('Themen', d.themes) + l('Ernährung', d.dietary) +
    l('Budget p.P.', d.budget) + l('Name', d.name) + l('Firma', d.company) + l('E-Mail', d.email) + l('Telefon', d.phone) + l('Nachricht', d.message)
  )
}

export async function sendInquiryMails(d: InquiryMailData) {
  const isKontakt = d.kind === 'kontakt'
  const label = isKontakt ? 'Kontaktnachricht' : 'Anfrage'
  const headline = isKontakt
    ? `Neue Nachricht von ${d.name}`
    : `Neue Anfrage: ${d.eventType ?? 'Anlass'}${d.guests ? `, ${d.guests} Personen` : ''}${d.eventDate ? `, ${formatDate(d.eventDate)}` : ''}`

  const owner = sendMail({
    to: NOTIFY(),
    replyTo: d.email,
    subject: `${headline} (#${d.id})`,
    html: layout(
      headline,
      `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;margin:16px 0 4px;color:${C.olive}">${escapeHtml(headline)}</h1>
<p style="margin:0;color:${C.muted}">${label} #${d.id} über avacatering.ch</p>${summaryTable(d)}
<p style="margin:24px 0 0"><a href="${siteUrl()}/admin/anfragen/${d.id}" style="display:inline-block;background:${C.orange};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Im Admin öffnen</a></p>
<p style="font-size:13px;color:${C.muted}">Tipp: Direkt auf diese E-Mail antworten – die Antwort geht an ${escapeHtml(d.email)}.</p>`,
      headline,
    ),
    text: `${headline}\n\n${summaryText(d)}\nIm Admin: ${siteUrl()}/admin/anfragen/${d.id}`,
  })

  const firstName = d.name.split(' ')[0]
  const customer = sendMail({
    to: d.email,
    replyTo: NOTIFY(),
    subject: isKontakt ? 'Danke für Ihre Nachricht – AVA Catering' : 'Ihre Anfrage bei AVA Catering',
    html: layout(
      'Danke für Ihre Anfrage',
      `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:16px 0 12px;color:${C.olive}">Herzlichen Dank, ${escapeHtml(firstName)}!</h1>
<p>${isKontakt ? 'Ihre Nachricht ist bei uns angekommen.' : 'Ihre Anfrage ist bei uns angekommen. Wir schauen uns alles in Ruhe an und melden uns mit einem persönlichen Angebot bei Ihnen – in der Regel innerhalb von zwei Arbeitstagen.'}</p>
<p>Hier nochmals Ihre Angaben im Überblick:</p>${summaryTable(d)}
<p>Fragen oder Ergänzungen? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an: <a href="tel:+41782646962" style="color:${C.orange}">078 264 69 62</a>.</p>
<p style="margin-top:24px">Herzliche Grüsse<br><span style="font-family:Georgia,serif;font-size:18px;color:${C.olive}">Dilsah Sever</span><br><span style="color:${C.muted};font-size:13px">AVA Catering</span></p>`,
      'Wir haben Ihre Anfrage erhalten und melden uns bald.',
    ),
    text: `Herzlichen Dank, ${firstName}!\n\nIhre ${label} ist bei uns angekommen. Wir melden uns in der Regel innerhalb von zwei Arbeitstagen.\n\n${summaryText(d)}\nHerzliche Grüsse\nDilsah Sever, AVA Catering\n078 264 69 62 · kontakt@avacatering.ch`,
  })

  return Promise.all([owner, customer])
}

/** Antwort aus dem Admin-Panel an die Kundin / den Kunden. */
export async function sendReply(to: string, subject: string, body: string) {
  const html = layout(
    subject,
    `${escapeHtml(body)
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('')}`,
  )
  return sendMail({ to, subject, html, text: body, replyTo: NOTIFY() })
}
