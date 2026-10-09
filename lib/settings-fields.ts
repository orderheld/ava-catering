import type { SiteSettings } from './content'

export type F = { k: keyof SiteSettings; label: string; hint?: string; area?: number }

export const settingsGroups: { title: string; fields: F[] }[] = [
  {
    title: 'Kontakt',
    fields: [
      { k: 'phone', label: 'Telefon', hint: 'Format: +41 78 264 69 62' },
      { k: 'email', label: 'E-Mail' },
      { k: 'whatsapp', label: 'WhatsApp-Nummer', hint: 'Nur Ziffern mit Ländervorwahl, z.B. 41782646962. Leer = kein WhatsApp-Button.' },
      { k: 'instagram', label: 'Instagram-Link (optional)' },
      { k: 'street', label: 'Strasse' },
      { k: 'zip', label: 'PLZ' },
      { k: 'city', label: 'Ort' },
      { k: 'serviceArea', label: 'Liefergebiet', area: 2 },
    ],
  },
  {
    title: 'Startseite',
    fields: [
      { k: 'announcement', label: 'Hinweis-Banner oben', hint: 'z.B. «Betriebsferien vom 1.–14. August». Leer lassen = kein Banner.' },
      { k: 'heroEyebrow', label: 'Kleine Überzeile' },
      { k: 'heroTitle', label: 'Grosse Überschrift', hint: 'Wort in *Sternchen* wird orange & kursiv.' },
      { k: 'heroText', label: 'Einleitungstext', area: 3 },
      { k: 'aboutTitle', label: 'Über uns – Überschrift', hint: 'Wort in *Sternchen* wird orange & kursiv.' },
      { k: 'aboutText', label: 'Über uns – Text', hint: 'Leerzeile = neuer Absatz.', area: 8 },
      { k: 'leadTime', label: 'Hinweis zur Vorlaufzeit', area: 2 },
    ],
  },
]


export const settingsLabel = (k: keyof SiteSettings) => settingsGroups.flatMap((g) => g.fields).find((f) => f.k === k)?.label ?? k
