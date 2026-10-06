// Füllt eine leere Datenbank mit den Standardinhalten (Angebot, Themen, Galerie, Einstellungen).
// Aufruf: npm run db:seed   (liest DATABASE_URL aus .env.local)
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'
import { defaultCategories, defaultGallery, defaultSettings, defaultThemes } from '../lib/content'

try {
  process.loadEnvFile('.env.local')
} catch {}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL fehlt (.env.local).')
  process.exit(1)
}
const client = url.includes('neon.tech') ? null : postgres(url, { max: 1 })
const db = (client ? drizzlePg(client, { schema }) : drizzleNeon(neon(url), { schema })) as ReturnType<typeof drizzlePg<typeof schema>>

async function main() {
  const cats = await db.select({ id: schema.categories.id }).from(schema.categories).limit(1)
  if (cats.length === 0) {
    for (const c of defaultCategories) {
      const { items, ...cat } = c
      const [row] = await db.insert(schema.categories).values(cat).returning({ id: schema.categories.id })
      if (items.length) await db.insert(schema.menuItems).values(items.map((i) => ({ ...i, categoryId: row.id })))
    }
    console.log(`✓ ${defaultCategories.length} Buffets importiert`)
  } else console.log('• Buffets bereits vorhanden – übersprungen')

  if ((await db.select({ id: schema.themes.id }).from(schema.themes).limit(1)).length === 0) {
    await db.insert(schema.themes).values(defaultThemes)
    console.log(`✓ ${defaultThemes.length} Themen importiert`)
  } else console.log('• Themen bereits vorhanden – übersprungen')

  if ((await db.select({ id: schema.gallery.id }).from(schema.gallery).limit(1)).length === 0) {
    await db.insert(schema.gallery).values(defaultGallery)
    console.log(`✓ ${defaultGallery.length} Galeriebilder importiert`)
  } else console.log('• Galerie bereits vorhanden – übersprungen')

  await db.insert(schema.settings).values({ key: 'site', value: defaultSettings }).onConflictDoNothing()
  console.log('✓ Einstellungen angelegt')
}

main()
  .then(() => client?.end())
  .then(() => console.log('Fertig.'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
