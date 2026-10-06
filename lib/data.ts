import 'server-only'
import { asc, eq, gte } from 'drizzle-orm'
import { blockedDates, categories, gallery, menuItems, settings, themes } from '@/db/schema'
import { getDb } from './db'
import {
  type Category,
  type GalleryImage,
  type SiteSettings,
  type Theme,
  defaultCategories,
  defaultGallery,
  defaultSettings,
  defaultThemes,
} from './content'

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error('[data] Datenbank nicht erreichbar, verwende Standardinhalte:', err)
    return fallback
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const db = getDb()
  if (!db) return defaultSettings
  return safe(async () => {
    const row = await db.query.settings.findFirst({ where: eq(settings.key, 'site') })
    return { ...defaultSettings, ...((row?.value as Partial<SiteSettings>) ?? {}) }
  }, defaultSettings)
}

export async function getCategories({ includeHidden = false } = {}): Promise<Category[]> {
  const db = getDb()
  const fallback = defaultCategories
  if (!db) return fallback
  return safe(async () => {
    const cats = await db.select().from(categories).orderBy(asc(categories.sort), asc(categories.id))
    if (cats.length === 0) return fallback
    const its = await db.select().from(menuItems).orderBy(asc(menuItems.sort), asc(menuItems.id))
    return cats
      .filter((c) => includeHidden || c.visible)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle ?? '',
        description: c.description ?? '',
        image: c.image ?? '',
        sort: c.sort,
        visible: c.visible,
        items: its
          .filter((i) => i.categoryId === c.id && (includeHidden || i.visible))
          .map((i) => ({ id: i.id, name: i.name, description: i.description, tags: i.tags, sort: i.sort, visible: i.visible })),
      }))
  }, fallback)
}

export async function getThemes({ includeHidden = false } = {}): Promise<Theme[]> {
  const db = getDb()
  if (!db) return defaultThemes
  return safe(async () => {
    const rows = await db.select().from(themes).orderBy(asc(themes.sort), asc(themes.id))
    if (rows.length === 0) return defaultThemes
    return rows
      .filter((t) => includeHidden || t.visible)
      .map((t) => ({ ...t, description: t.description ?? '', image: t.image ?? '' }))
  }, defaultThemes)
}

export async function getGallery({ includeHidden = false } = {}): Promise<GalleryImage[]> {
  const db = getDb()
  if (!db) return defaultGallery
  return safe(async () => {
    const rows = await db.select().from(gallery).orderBy(asc(gallery.sort), asc(gallery.id))
    if (rows.length === 0) return defaultGallery
    return rows.filter((g) => includeHidden || g.visible)
  }, defaultGallery)
}

export async function getBlockedDates(): Promise<{ day: string; note: string | null }[]> {
  const db = getDb()
  if (!db) return []
  const today = new Date().toISOString().slice(0, 10)
  return safe(() => db.select().from(blockedDates).where(gte(blockedDates.day, today)).orderBy(asc(blockedDates.day)), [])
}
