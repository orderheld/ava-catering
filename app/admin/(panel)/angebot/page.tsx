import { asc } from 'drizzle-orm'
import { deleteCategory, deleteItem, deleteTheme, importDefaults, saveCategory, saveItem, saveTheme } from '@/app/admin/actions'
import { ActionForm, Fold, ImageField, QuickForm, SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import { categories, menuItems, themes } from '@/db/schema'
import { getDb } from '@/lib/db'

export const metadata = { title: 'Angebot' }

function Visible({ on, label = 'Auf der Website zeigen' }: { on: boolean; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <input type="checkbox" name="visible" defaultChecked={on} className="accent-orange size-5" /> {label}
    </label>
  )
}

function CategoryFields({ c }: { c?: typeof categories.$inferSelect }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <input type="hidden" name="id" value={c?.id ?? ''} />
        <div>
          <label className="label">Titel</label>
          <input name="title" defaultValue={c?.title} className="field" required />
        </div>
        <div>
          <label className="label">Untertitel</label>
          <input name="subtitle" defaultValue={c?.subtitle ?? ''} className="field" />
        </div>
        <div>
          <label className="label">Beschreibung</label>
          <textarea name="description" rows={4} defaultValue={c?.description ?? ''} className="field resize-y leading-relaxed" />
        </div>
      </div>
      <div className="space-y-4">
        <ImageField name="image" defaultValue={c?.image ?? ''} label="Titelbild" />
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className="w-28">
            <label className="label">Reihenfolge</label>
            <input name="sort" type="number" inputMode="numeric" defaultValue={c?.sort ?? 99} className="field" />
          </div>
          <Visible on={c?.visible ?? true} />
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
        <PageTitle title="Angebot & Themen" />
        <Panel title="Die Website zeigt die Standardinhalte">
          <p className="text-muted mb-5 leading-relaxed">Buffets und Themen sind noch nicht in der Datenbank. Mit einem Tippen übernehmen Sie die Standardinhalte und können sie danach hier bearbeiten. Auf der Website ändert sich dadurch nichts.</p>
          <QuickForm action={importDefaults}>
            <input type="hidden" name="what" value="angebot" />
            <SubmitButton pendingText="Übernehme …">Inhalte zum Bearbeiten übernehmen</SubmitButton>
          </QuickForm>
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Angebot & Themen" text="Tippen Sie auf ein Buffet, um es zu bearbeiten. Änderungen sind sofort auf der Website sichtbar und lassen sich im Verlauf rückgängig machen." />

      <div className="space-y-3">
        {cats.map((c, i) => {
          const its = items.filter((it) => it.categoryId === c.id)
          return (
            <Fold
              key={c.id}
              id={`cat-${c.id}`}
              className="border-line/80 min-w-0 overflow-hidden rounded-[1.6rem] border bg-white"
              summaryClassName="p-4 sm:p-5"
              summary={
                <>
                <span className="bg-sand relative size-16 shrink-0 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.image && <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-muted block text-sm">Kapitel {String(i + 1).padStart(2, '0')}</span>
                  <span className="text-olive-deep block truncate font-serif text-2xl leading-tight">{c.title}</span>
                  <span className="text-muted block text-sm">
                    {its.length} Beispiele{!c.visible && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-stone-700">ausgeblendet</span>}
                  </span>
                </span>
                </>
              }
            >
              <div className="border-line border-t p-4 sm:p-6">
                <ActionForm action={saveCategory}>
                  <CategoryFields c={c} />
                  <div className="mt-5">
                    <SubmitButton>Buffet speichern</SubmitButton>
                  </div>
                </ActionForm>

                <div className="border-line mt-8 border-t pt-6">
                  <p className="label">Beispiele auf der Website</p>
                  <ul className="divide-line divide-y">
                    {its.map((it) => (
                      <li key={it.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                        <QuickForm action={saveItem} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                          <input type="hidden" name="id" value={it.id} />
                          <input name="name" defaultValue={it.name} className="field !py-2.5 min-w-0 flex-1" aria-label="Name" />
                          <input name="description" defaultValue={it.description ?? ''} placeholder="Zusatz (optional)" className="field !py-2.5 min-w-0 flex-1" aria-label="Zusatz" />
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-muted flex items-center gap-2 text-sm">
                              <input type="checkbox" name="visible" defaultChecked={it.visible} className="accent-orange size-5" /> sichtbar
                            </label>
                            <SubmitButton className="!px-4 !py-2 text-sm" pendingText="…">Speichern</SubmitButton>
                          </div>
                        </QuickForm>
                        <QuickForm action={deleteItem} confirm={`«${it.name}» entfernen?`} className="self-end sm:self-auto">
                          <input type="hidden" name="id" value={it.id} />
                          <button className="text-muted rounded-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700">Entfernen</button>
                        </QuickForm>
                      </li>
                    ))}
                  </ul>
                  <QuickForm action={saveItem} className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="categoryId" value={c.id} />
                    <input name="name" required placeholder="Neues Beispiel, z.B. «Linsensuppe»" className="field !py-2.5 min-w-0 flex-1" />
                    <SubmitButton className="!py-2.5">Hinzufügen</SubmitButton>
                  </QuickForm>
                </div>
                <QuickForm action={deleteCategory} confirm={`Buffet «${c.title}» mit allen Beispielen löschen? (Im Verlauf wiederherstellbar)`} className="mt-6 text-right">
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-muted rounded-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700">Buffet löschen</button>
                </QuickForm>
              </div>
            </Fold>
          )
        })}

        <Fold
          id="cat-neu"
          className="border-line min-w-0 rounded-[1.6rem] border border-dashed bg-white/60"
          summaryClassName="text-olive p-5 font-medium"
          summary={<span className="flex flex-1 items-center gap-3"><span className="bg-olive-soft grid size-10 place-items-center rounded-full text-xl">+</span> Neues Buffet anlegen</span>}
        >
          <div className="p-4 pt-0 sm:p-6 sm:pt-0">
            <ActionForm action={saveCategory} resetOnSuccess>
              <CategoryFields />
              <div className="mt-5">
                <SubmitButton>Buffet anlegen</SubmitButton>
              </div>
            </ActionForm>
          </div>
        </Fold>
      </div>

      <h2 className="text-olive-deep mt-12 mb-4 font-serif text-3xl">Themen-Party</h2>
      <div className="space-y-3">
        {[...ths, undefined].map((t) => (
          <Fold
            key={t?.id ?? 'neu'}
            id={`theme-${t?.id ?? 'neu'}`}
            className={`border-line/80 min-w-0 overflow-hidden rounded-[1.6rem] border ${t ? 'bg-white' : 'border-dashed bg-white/60'}`}
            summaryClassName="p-4 sm:p-5"
            summary={
              t ? (
                <span className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="bg-sand relative size-14 shrink-0 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {t.image && <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
                  </span>
                  <span className="min-w-0">
                    <span className="text-olive-deep block truncate font-serif text-xl">{t.title}</span>
                    {!t.visible && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-sm text-stone-700">ausgeblendet</span>}
                  </span>
                </span>
              ) : (
                <span className="text-olive flex flex-1 items-center gap-3 font-medium"><span className="bg-olive-soft grid size-10 place-items-center rounded-full text-xl">+</span> Neues Thema anlegen</span>
              )
            }
          >
            <div className="border-line border-t p-4 sm:p-6">
            <ActionForm action={saveTheme} resetOnSuccess={!t} className="space-y-4">
              <input type="hidden" name="id" value={t?.id ?? ''} />
              <div>
                <label className="label">Titel</label>
                <input name="title" defaultValue={t?.title} className="field" required />
              </div>
              <div>
                <label className="label">Beschreibung</label>
                <textarea name="description" rows={3} defaultValue={t?.description ?? ''} className="field resize-y" />
              </div>
              <ImageField name="image" defaultValue={t?.image ?? ''} />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="w-24">
                  <label className="label">Reihenfolge</label>
                  <input name="sort" type="number" inputMode="numeric" defaultValue={t?.sort ?? 99} className="field" />
                </div>
                <Visible on={t?.visible ?? true} label="sichtbar" />
                <SubmitButton className="ml-auto">{t ? 'Speichern' : 'Anlegen'}</SubmitButton>
              </div>
            </ActionForm>
            {t && (
              <QuickForm action={deleteTheme} confirm={`Thema «${t.title}» löschen? (Im Verlauf wiederherstellbar)`} className="mt-3 text-right">
                <input type="hidden" name="id" value={t.id} />
                <button className="text-muted rounded-full px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700">Löschen</button>
              </QuickForm>
            )}
            </div>
          </Fold>
        ))}
      </div>
    </>
  )
}
