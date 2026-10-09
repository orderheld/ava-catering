import 'server-only'
import { eq } from 'drizzle-orm'
import { categories, contentHistory, gallery, inquiries, inquiryLog, menuItems, settings, themes } from '@/db/schema'
import { getDb, requireDb } from './db'

export type Entity = 'category' | 'item' | 'theme' | 'gallery' | 'settings' | 'inquiry'
type Action = 'create' | 'update' | 'delete'

export const entityLabels: Record<Entity, string> = {
  category: 'Buffet',
  item: 'Beispiel',
  theme: 'Thema',
  gallery: 'Galeriebild',
  settings: 'Einstellungen',
  inquiry: 'Anfrage',
}

/** Speichert den Zustand vor (und nach) einer Änderung. Ein Fehler hier blockiert nie das Speichern selbst. */
export async function record(entity: Entity, entityId: string | number, action: Action, label: string, before: unknown, after?: unknown) {
  const db = getDb()
  if (!db) return
  try {
    await db.insert(contentHistory).values({ entity, entityId: String(entityId), action, label, before: before ?? null, after: after ?? null })
  } catch (err) {
    console.error('[verlauf] Speichern fehlgeschlagen:', err)
  }
}

// In JSON werden Datumswerte zu Text – beim Wiederherstellen zurückwandeln
const revive = <T extends Record<string, unknown>>(row: T) => {
  const out: Record<string, unknown> = { ...row }
  for (const k of ['createdAt', 'updatedAt']) if (typeof out[k] === 'string') out[k] = new Date(out[k] as string)
  return out as T
}

type Row = Record<string, unknown> & { id: number }

/** Macht einen Eintrag im Verlauf rückgängig. */
export async function undo(historyId: number): Promise<{ ok: boolean; message: string }> {
  const db = requireDb()
  const h = await db.query.contentHistory.findFirst({ where: eq(contentHistory.id, historyId) })
  if (!h) return { ok: false, message: 'Eintrag nicht gefunden.' }
  if (h.undoneAt) return { ok: false, message: 'Wurde bereits rückgängig gemacht.' }
  const id = Number(h.entityId)
  const before = h.before as Record<string, unknown> | null

  const tables = { category: categories, item: menuItems, theme: themes, gallery } as const

  if (h.entity === 'settings') {
    if (before) await db.insert(settings).values({ key: 'site', value: before }).onConflictDoUpdate({ target: settings.key, set: { value: before } })
    else await db.delete(settings).where(eq(settings.key, 'site'))
  } else if (h.entity === 'inquiry') {
    const b = before as { row: Row; log: Row[] }
    if (h.action !== 'delete' || !b) return { ok: false, message: 'Nicht wiederherstellbar.' }
    await db.insert(inquiries).values(revive(b.row) as typeof inquiries.$inferInsert).onConflictDoNothing()
    if (b.log.length) await db.insert(inquiryLog).values(b.log.map((l) => revive(l) as typeof inquiryLog.$inferInsert)).onConflictDoNothing()
  } else {
    const table = tables[h.entity as keyof typeof tables]
    if (!table) return { ok: false, message: 'Unbekannter Eintrag.' }
    if (h.action === 'create') {
      await db.delete(table).where(eq(table.id, id))
    } else if (h.action === 'update' && before) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...values } = revive(before as Row)
      await db.update(table).set(values as never).where(eq(table.id, id))
    } else if (h.action === 'delete' && before) {
      if (h.entity === 'category') {
        const b = before as { row: Row; items: Row[] }
        await db.insert(categories).values(b.row as typeof categories.$inferInsert).onConflictDoNothing()
        if (b.items.length) await db.insert(menuItems).values(b.items as (typeof menuItems.$inferInsert)[]).onConflictDoNothing()
      } else {
        await db.insert(table).values(revive(before as Row) as never).onConflictDoNothing()
      }
    }
  }
  await db.update(contentHistory).set({ undoneAt: new Date() }).where(eq(contentHistory.id, historyId))
  return { ok: true, message: `Rückgängig gemacht: ${h.label}` }
}
