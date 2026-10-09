import { saveSettings } from '@/app/admin/actions'
import { ActionForm, SubmitButton } from '@/components/admin/forms'
import { PushSettings } from '@/components/admin/Push'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import type { SiteSettings } from '@/lib/content'
import { getSettings } from '@/lib/data'
import { getDb } from '@/lib/db'

export const metadata = { title: 'Einstellungen' }

type F = { k: keyof SiteSettings; label: string; hint?: string; area?: number }

const groups: { title: string; fields: F[] }[] = [
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

export default async function EinstellungenPage() {
  if (!getDb()) return (<><PageTitle title="Einstellungen" /><DbMissing /></>)
  const s = await getSettings()
  return (
    <>
      <PageTitle title="Einstellungen" text="Mitteilungen, Kontaktangaben und Texte der Website." />
      <Panel title="Mitteilungen" className="mb-6">
        <PushSettings />
      </Panel>
      <ActionForm action={saveSettings} className="space-y-6">
        {groups.map((g) => (
          <Panel key={g.title} title={g.title}>
            <div className="grid gap-5 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.k} className={f.area ? 'sm:col-span-2' : ''}>
                  <label className="label" htmlFor={f.k}>{f.label}</label>
                  {f.area ? (
                    <textarea id={f.k} name={f.k} rows={f.area} defaultValue={s[f.k]} className="field resize-y leading-relaxed" />
                  ) : (
                    <input id={f.k} name={f.k} defaultValue={s[f.k]} className="field" />
                  )}
                  {f.hint && <p className="text-muted mt-1.5 text-xs">{f.hint}</p>}
                </div>
              ))}
            </div>
          </Panel>
        ))}
        <div className="bg-sand/90 sticky bottom-4 z-10 flex justify-end rounded-full p-2 backdrop-blur">
          <SubmitButton>Alle Einstellungen speichern</SubmitButton>
        </div>
      </ActionForm>
    </>
  )
}
