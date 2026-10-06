import { asc } from 'drizzle-orm'
import { deleteCategory, deleteItem, deleteTheme, importDefaults, saveCategory, saveItem, saveTheme } from '@/app/admin/actions'
import { ActionForm, ConfirmButton, ImageField, SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import { categories, menuItems, themes } from '@/db/schema'
import { getDb } from '@/lib/db'

export const metadata = { title: 'Angebot' }

function CategoryFields({ c }: { c?: typeof categories.$inferSelect }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <input type="hidden" name="id" value={c?.id ?? ''} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Titel</label>
            <input name="title" defaultValue={c?.title} className="field" required />
          </div>
          <div>
            <label className="label">Untertitel</label>
            <input name="subtitle" defaultValue={c?.subtitle ?? ''} className="field" />
          </div>
        </div>
        <div>
          <label className="label">Beschreibung</label>
          <textarea name="description" rows={4} defaultValue={c?.description ?? ''} className="field resize-y" />
        </div>
      </div>
      <div className="space-y-4">
        <ImageField name="image" defaultValue={c?.image ?? ''} label="Titelbild" />
        <div className="flex items-end gap-4">
          <div className="w-28">
            <label className="label">Reihenfolge</label>
            <input name="sort" type="number" defaultValue={c?.sort ?? 99} className="field" />
          </div>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" defaultChecked={c?.visible ?? true} className="accent-orange size-4" /> Auf Website zeigen
          </label>
        </div>
      </div>
    </div>
  )
}

export default async function AngebotAdmin() {
  const db = getDb()
  if (!db) return (<><PageTitle title="Angebot" /><DbMissing /></>)
  const [cats, items, ths] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort), asc(categories.id)),
    db.select().from(menuItems).orderBy(asc(menuItems.sort), asc(menuItems.id)),
    db.select().from(themes).orderBy(asc(themes.sort), asc(themes.id)),
  ])

  if (cats.length === 0) {
    return (
      <>
        <PageTitle title="Angebot" />
        <Panel title="Noch keine Inhalte in der Datenbank">
          <p className="text-muted mb-5">Die Website zeigt aktuell die Standardinhalte. Importieren Sie diese, um sie hier bearbeiten zu können.</p>
          <form action={importDefaults}>
            <input type="hidden" name="what" value="angebot" />
            <SubmitButton pendingText="Importiere …">Standardinhalte importieren</SubmitButton>
          </form>
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Angebot" text="Buffets, Beispiele und Themen bearbeiten. Änderungen sind sofort auf der Website sichtbar." />
      <div className="space-y-6">
        {cats.map((c, i) => (
          <Panel key={c.id} title={`0${i + 1} · ${c.title}`} actions={!c.visible && <span className="text-muted rounded-full bg-stone-100 px-3 py-1 text-xs">Ausgeblendet</span>}>
            <ActionForm action={saveCategory}>
              <CategoryFields c={c} />
              <div className="mt-5">
                <SubmitButton>Buffet speichern</SubmitButton>
              </div>
            </ActionForm>

            <div className="border-line mt-8 border-t pt-6">
              <p className="label">Beispiele auf der Website</p>
              <ul className="space-y-2">
                {items
                  .filter((it) => it.categoryId === c.id)
                  .map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center gap-2">
                      <form action={saveItem} className="flex flex-1 flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={it.id} />
                        <input name="name" defaultValue={it.name} className="field !py-2 min-w-48 flex-1 text-sm" aria-label="Name" />
                        <input name="description" defaultValue={it.description ?? ''} placeholder="Zusatz (optional)" className="field !py-2 min-w-40 flex-1 text-sm" aria-label="Zusatz" />
                        <label className="text-muted flex items-center gap-1.5 text-xs">
                          <input type="checkbox" name="visible" defaultChecked={it.visible} className="accent-orange" /> sichtbar
                        </label>
                        <button className="text-olive hover:text-orange text-sm">Speichern</button>
                      </form>
                      <form action={deleteItem}>
                        <input type="hidden" name="id" value={it.id} />
                        <ConfirmButton message={`«${it.name}» entfernen?`} className="text-muted text-sm hover:text-red-700">✕</ConfirmButton>
                      </form>
                    </li>
                  ))}
              </ul>
              <form action={saveItem} className="mt-3 flex gap-2">
                <input type="hidden" name="categoryId" value={c.id} />
                <input name="name" placeholder="Neues Beispiel, z.B. «Linsensuppe»" className="field !py-2 flex-1 text-sm" />
                <SubmitButton className="!py-2">Hinzufügen</SubmitButton>
              </form>
            </div>
            <form action={deleteCategory} className="mt-6 text-right">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`Buffet «${c.title}» mit allen Beispielen löschen?`} className="text-muted text-xs hover:text-red-700">
                Buffet löschen
              </ConfirmButton>
            </form>
          </Panel>
        ))}

        <Panel title="Neues Buffet">
          <ActionForm action={saveCategory} resetOnSuccess>
            <CategoryFields />
            <div className="mt-5">
              <SubmitButton>Buffet anlegen</SubmitButton>
            </div>
          </ActionForm>
        </Panel>

        <h2 className="text-olive-deep pt-6 font-serif text-3xl">Themen-Party</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[...ths, undefined].map((t) => (
            <Panel key={t?.id ?? 'neu'} title={t ? t.title : 'Neues Thema'}>
              <ActionForm action={saveTheme} resetOnSuccess={!t} className="space-y-4">
                <input type="hidden" name="id" value={t?.id ?? ''} />
                <div>
                  <label className="label">Titel</label>
                  <input name="title" defaultValue={t?.title} className="field" required />
                </div>
                <div>
                  <label className="label">Beschreibung</label>
                  <textarea name="description" rows={2} defaultValue={t?.description ?? ''} className="field resize-y" />
                </div>
                <ImageField name="image" defaultValue={t?.image ?? ''} />
                <div className="flex flex-wrap items-center gap-4">
                  <input name="sort" type="number" defaultValue={t?.sort ?? 99} className="field !w-24" aria-label="Reihenfolge" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="visible" defaultChecked={t?.visible ?? true} className="accent-orange size-4" /> sichtbar
                  </label>
                  <SubmitButton className="ml-auto">{t ? 'Speichern' : 'Anlegen'}</SubmitButton>
                </div>
              </ActionForm>
              {t && (
                <form action={deleteTheme} className="mt-3 text-right">
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton message={`Thema «${t.title}» löschen?`} className="text-muted text-xs hover:text-red-700">Löschen</ConfirmButton>
                </form>
              )}
            </Panel>
          ))}
        </div>
      </div>
    </>
  )
}
