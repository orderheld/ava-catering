import { asc } from 'drizzle-orm'
import { addGalleryImage, deleteGalleryImage, importDefaults, moveGalleryImage, updateGalleryImage } from '@/app/admin/actions'
import { ActionForm, ConfirmButton, ImageField, SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import { gallery } from '@/db/schema'
import { getDb } from '@/lib/db'

export const metadata = { title: 'Galerie' }

export default async function GalerieAdmin() {
  const db = getDb()
  if (!db) return (<><PageTitle title="Galerie" /><DbMissing /></>)
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sort), asc(gallery.id))

  return (
    <>
      <PageTitle title="Galerie" text="Bilder für die Galerie und die Startseite (die ersten acht erscheinen auf der Startseite)." />
      <Panel title="Bild hinzufügen" className="mb-6">
        <ActionForm action={addGalleryImage} resetOnSuccess className="grid gap-5 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end">
          <ImageField name="src" />
          <div>
            <label className="label" htmlFor="alt">Beschreibung (für Google & Barrierefreiheit)</label>
            <input id="alt" name="alt" className="field" placeholder="z.B. Mezze-Buffet mit Hummus" />
          </div>
          <SubmitButton>Hinzufügen</SubmitButton>
        </ActionForm>
      </Panel>

      {rows.length === 0 ? (
        <Panel>
          <p className="text-muted mb-5">Die Website zeigt aktuell die Standardbilder. Importieren Sie diese, um sie hier zu verwalten.</p>
          <form action={importDefaults}>
            <input type="hidden" name="what" value="galerie" />
            <SubmitButton pendingText="Importiere …">Standardbilder importieren</SubmitButton>
          </form>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((g, i) => (
            <div key={g.id} className={`border-line overflow-hidden rounded-3xl border bg-white ${g.visible ? '' : 'opacity-60'}`}>
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.alt} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">{i + 1}{i < 8 ? ' · Startseite' : ''}</span>
              </div>
              <div className="space-y-3 p-4">
                <form action={updateGalleryImage} className="space-y-2">
                  <input type="hidden" name="id" value={g.id} />
                  <input name="alt" defaultValue={g.alt} className="field !py-2 text-sm" aria-label="Beschreibung" />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="visible" defaultChecked={g.visible} className="accent-orange" /> sichtbar
                    </label>
                    <button className="text-olive hover:text-orange text-sm">Speichern</button>
                  </div>
                </form>
                <div className="border-line flex items-center justify-between border-t pt-3">
                  <div className="flex gap-1">
                    {[
                      [-1, '←'],
                      [1, '→'],
                    ].map(([dir, label]) => (
                      <form key={dir} action={moveGalleryImage}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="dir" value={dir} />
                        <button className="border-line hover:border-olive grid size-8 place-items-center rounded-full border text-sm" aria-label={dir === -1 ? 'Nach vorne' : 'Nach hinten'}>{label}</button>
                      </form>
                    ))}
                  </div>
                  <form action={deleteGalleryImage}>
                    <input type="hidden" name="id" value={g.id} />
                    <ConfirmButton message="Bild aus der Galerie entfernen?" className="text-muted text-sm hover:text-red-700">Entfernen</ConfirmButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
