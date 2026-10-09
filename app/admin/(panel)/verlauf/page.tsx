import { asc, desc, eq } from 'drizzle-orm'
import { resetSetting, restoreDefault, undoChange } from '@/app/admin/actions'
import { QuickForm, SubmitButton } from '@/components/admin/forms'
import { DbMissing, PageTitle, Panel } from '@/components/admin/ui'
import { categories, contentHistory, gallery, menuItems, settings, themes } from '@/db/schema'
import { defaultCategories, defaultGallery, defaultSettings, defaultThemes, type SiteSettings } from '@/lib/content'
import { getDb } from '@/lib/db'
import { settingsLabel } from '@/lib/settings-fields'
import { cn, formatDate, formatDateTime } from '@/lib/utils'

export const metadata = { title: 'Verlauf & Prüfung' }

type Finding = { area: string; title: string; detail?: string; current?: string; standard?: string; fix?: { kind: string; key: string } | { setting: string } }

const short = (v: unknown, n = 120) => {
  const s = String(v ?? '').trim()
  return s ? (s.length > n ? `${s.slice(0, n)}…` : s) : '(leer)'
}

const fieldNames: Record<string, string> = {
  title: 'Titel',
  subtitle: 'Untertitel',
  description: 'Beschreibung',
  image: 'Bild',
  sort: 'Reihenfolge',
  visible: 'Sichtbar',
  name: 'Name',
  alt: 'Beschreibung',
  src: 'Bild',
}

function changedFields(before: unknown, after: unknown) {
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object') return []
  const b = before as Record<string, unknown>
  const a = after as Record<string, unknown>
  return Object.keys(a)
    .filter((k) => k !== 'id' && JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null))
    .map((k) => ({
      k,
      label: fieldNames[k] ?? settingsLabel(k as keyof SiteSettings),
      from: typeof b[k] === 'boolean' ? (b[k] ? 'ja' : 'nein') : short(b[k], 80),
      to: typeof a[k] === 'boolean' ? (a[k] ? 'ja' : 'nein') : short(a[k], 80),
    }))
}

export default async function VerlaufPage() {
  const db = getDb()
  if (!db) return (<><PageTitle title="Verlauf & Prüfung" /><DbMissing /></>)

  const [site, cats, items, ths, gal, history] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, 'site') }),
    db.select().from(categories).orderBy(asc(categories.sort)),
    db.select().from(menuItems),
    db.select().from(themes),
    db.select().from(gallery),
    db.select().from(contentHistory).orderBy(desc(contentHistory.createdAt)).limit(150).catch(() => []),
  ])

  const findings: Finding[] = []
  const untouched: string[] = []

  // Texte & Einstellungen
  if (!site) untouched.push('Texte & Einstellungen')
  else {
    const cur = { ...defaultSettings, ...(site.value as Partial<SiteSettings>) }
    for (const k of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
      if ((cur[k] ?? '').trim() !== defaultSettings[k].trim()) {
        findings.push({ area: 'Texte', title: settingsLabel(k), current: short(cur[k], 240), standard: short(defaultSettings[k], 240), fix: { setting: k } })
      }
    }
  }

  // Angebot
  if (cats.length === 0) untouched.push('Angebot (Buffets)')
  else {
    for (const def of defaultCategories) {
      const c = cats.find((x) => x.slug === def.slug)
      if (!c) {
        findings.push({ area: 'Angebot', title: `Buffet «${def.title}» fehlt`, detail: 'Wurde gelöscht oder umbenannt.', fix: { kind: 'category', key: def.slug } })
        continue
      }
      const diffs = (['title', 'subtitle', 'description', 'image'] as const).filter((k) => (c[k] ?? '') !== (def[k] ?? ''))
      if (diffs.length) {
        findings.push({
          area: 'Angebot',
          title: `Buffet «${def.title}» geändert`,
          detail: `Geändert: ${diffs.map((k) => fieldNames[k]).join(', ')}`,
          current: diffs.map((k) => `${fieldNames[k]}: ${short(c[k], 100)}`).join('\n'),
          standard: diffs.map((k) => `${fieldNames[k]}: ${short(def[k], 100)}`).join('\n'),
          fix: { kind: 'category', key: def.slug },
        })
      }
      if (!c.visible) findings.push({ area: 'Angebot', title: `Buffet «${c.title}» ist ausgeblendet`, detail: 'Unter «Angebot & Themen» wieder auf sichtbar stellen.' })
      const its = items.filter((i) => i.categoryId === c.id)
      for (const it of def.items) {
        if (!its.some((i) => i.name === it.name)) findings.push({ area: 'Angebot', title: `Beispiel «${it.name}» fehlt bei ${def.title}`, fix: { kind: 'item', key: `${def.slug}::${it.name}` } })
      }
      const hidden = its.filter((i) => !i.visible)
      if (hidden.length) findings.push({ area: 'Angebot', title: `${hidden.length} Beispiel(e) bei ${c.title} ausgeblendet`, detail: hidden.map((i) => i.name).join(', ') })
    }
  }

  // Themen
  if (ths.length === 0) untouched.push('Themen-Party')
  else {
    for (const def of defaultThemes) {
      const t = ths.find((x) => x.title === def.title)
      if (!t) findings.push({ area: 'Themen', title: `Thema «${def.title}» fehlt`, detail: 'Wurde gelöscht oder umbenannt.', fix: { kind: 'theme', key: def.title } })
      else if ((t.description ?? '') !== def.description || (t.image ?? '') !== def.image || !t.visible)
        findings.push({ area: 'Themen', title: `Thema «${def.title}» geändert${t.visible ? '' : ' und ausgeblendet'}` })
    }
  }

  // Galerie
  if (gal.length === 0) untouched.push('Galerie')
  else {
    for (const def of defaultGallery) {
      const g = gal.find((x) => x.src === def.src)
      if (!g) findings.push({ area: 'Galerie', title: `Bild fehlt: ${def.alt}`, fix: { kind: 'gallery', key: def.src } })
      else if (!g.visible) findings.push({ area: 'Galerie', title: `Bild ausgeblendet: ${g.alt || def.alt}` })
    }
    const extra = gal.filter((g) => !defaultGallery.some((d) => d.src === g.src)).length
    if (extra) findings.push({ area: 'Galerie', title: `${extra} eigene(s) Bild(er) hinzugefügt` })
  }

  const days = new Map<string, typeof history>()
  for (const h of history) {
    const d = formatDate(h.createdAt, { weekday: 'long', day: 'numeric', month: 'long' })
    days.set(d, [...(days.get(d) ?? []), h])
  }

  return (
    <>
      <PageTitle title="Verlauf & Prüfung" text="Hier sehen Sie, was sich gegenüber den ursprünglichen Inhalten verändert hat, und können jede Änderung mit einem Tippen rückgängig machen." />

      <Panel title="Inhalte prüfen" className="mb-6">
        {findings.length === 0 ? (
          <p className="bg-olive-soft text-olive-deep rounded-2xl px-5 py-4 text-[1.05rem]">✓ Alles im Originalzustand. Es wurden keine Bilder oder Texte gelöscht oder verändert.</p>
        ) : (
          <>
            <p className="text-muted mb-4 leading-relaxed">
              {findings.length} Abweichung{findings.length === 1 ? '' : 'en'} gegenüber den ursprünglichen Inhalten. Gewollte Änderungen können Sie einfach so lassen.
            </p>
            <ul className="space-y-3">
              {findings.map((f, i) => (
                <li key={i} className="border-line rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className="text-orange text-xs font-medium tracking-[0.15em] uppercase">{f.area}</span>
                      <p className="text-olive-deep font-medium">{f.title}</p>
                      {f.detail && <p className="text-muted text-sm">{f.detail}</p>}
                    </div>
                    {f.fix && (
                      <QuickForm action={'setting' in f.fix ? resetSetting : restoreDefault} className="shrink-0">
                        {'setting' in f.fix ? (
                          <input type="hidden" name="key" value={f.fix.setting} />
                        ) : (
                          <>
                            <input type="hidden" name="kind" value={f.fix.kind} />
                            <input type="hidden" name="key" value={f.fix.key} />
                          </>
                        )}
                        <SubmitButton className="btn-secondary !bg-transparent !px-4 !py-2 text-sm !text-olive !shadow-none hover:!text-white hover:!bg-olive" pendingText="…">
                          {f.title.includes('fehlt') ? 'Wiederherstellen' : 'Original übernehmen'}
                        </SubmitButton>
                      </QuickForm>
                    )}
                  </div>
                  {f.current && (
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p className="bg-sand/60 rounded-xl p-3 break-words whitespace-pre-line"><span className="text-muted block text-xs">Jetzt</span>{f.current}</p>
                      <p className="bg-olive-soft/60 rounded-xl p-3 break-words whitespace-pre-line"><span className="text-muted block text-xs">Original</span>{f.standard}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        {untouched.length > 0 && <p className="text-muted mt-4 text-sm">Unverändert (zeigen die Originalinhalte): {untouched.join(', ')}.</p>}
      </Panel>

      <Panel title="Verlauf der Änderungen">
        {history.length === 0 ? (
          <p className="text-muted">Noch keine Änderungen gespeichert. Ab jetzt erscheint hier jede Änderung an Angebot, Galerie, Texten und Anfragen.</p>
        ) : (
          <div className="space-y-6">
            {[...days].map(([day, entries]) => (
              <div key={day}>
                <p className="text-muted mb-2 text-sm font-medium">{day}</p>
                <ul className="space-y-2">
                  {entries.map((h) => {
                    const diffs = h.action === 'update' ? changedFields(h.before, h.after) : []
                    return (
                      <li key={h.id} className={cn('border-line flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start', h.undoneAt && 'opacity-55')}>
                        <span
                          className={cn(
                            'grid size-9 shrink-0 place-items-center rounded-full text-sm',
                            h.action === 'delete' ? 'bg-red-50 text-red-700' : h.action === 'create' ? 'bg-olive-soft text-olive' : 'bg-orange-soft text-orange-deep',
                          )}
                          aria-hidden
                        >
                          {h.action === 'delete' ? '✕' : h.action === 'create' ? '+' : '✎'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-olive-deep">{h.label}</p>
                          <p className="text-muted text-xs">{formatDateTime(h.createdAt)}{h.undoneAt ? ' · rückgängig gemacht' : ''}</p>
                          {diffs.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm">
                              {diffs.slice(0, 6).map((d) => (
                                <li key={d.k} className="break-words">
                                  <span className="text-muted">{d.label}:</span> <s className="text-muted">{d.from}</s> → {d.to}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {!h.undoneAt && (h.before !== null || h.action === 'create') && (
                          <QuickForm action={undoChange} confirm={`«${h.label}» rückgängig machen?`} className="shrink-0">
                            <input type="hidden" name="id" value={h.id} />
                            <SubmitButton className="btn-secondary !bg-transparent !px-4 !py-2 text-sm !text-olive !shadow-none hover:!text-white hover:!bg-olive" pendingText="…">
                              Rückgängig
                            </SubmitButton>
                          </QuickForm>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  )
}
