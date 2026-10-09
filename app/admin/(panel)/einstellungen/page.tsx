import { saveSettings } from '@/app/admin/actions'
import { ActionForm, SubmitButton } from '@/components/admin/forms'
import { PushSettings } from '@/components/admin/Push'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import { settingsGroups as groups } from '@/lib/settings-fields'
import { getSettings } from '@/lib/data'
import { getDb } from '@/lib/db'

export const metadata = { title: 'Einstellungen' }

export default async function EinstellungenPage() {
  if (!getDb()) return (<><PageTitle title="Einstellungen" /><DbMissing /></>)
  const s = await getSettings()
  return (
    <>
      <PageTitle title="Texte & Einstellungen" text="Mitteilungen, Kontaktangaben und Texte der Website. Jede Änderung lässt sich unter «Verlauf & Prüfung» rückgängig machen." />
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
        <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 flex justify-end rounded-full bg-white/90 p-2 shadow-lg backdrop-blur md:bottom-4">
          <SubmitButton className="w-full sm:w-auto">Alle Texte speichern</SubmitButton>
        </div>
      </ActionForm>
    </>
  )
}
