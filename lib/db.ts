import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

type DB = ReturnType<typeof drizzleNeon<typeof schema>>

let instance: DB | null | undefined

/** Datenbank-Verbindung. Gibt `null` zurück, solange keine DATABASE_URL gesetzt ist –
 *  die Website zeigt dann die Standardinhalte aus lib/content.ts. */
export function getDb(): DB | null {
  if (instance !== undefined) return instance
  const url = process.env.DATABASE_URL
  if (!url) return (instance = null)
  // Neon (Produktion/Vercel) über HTTP, jede andere Postgres-URL (z.B. lokal) über TCP
  instance = url.includes('neon.tech')
    ? drizzleNeon(neon(url), { schema })
    : (drizzlePg(postgres(url, { max: 5 }), { schema }) as unknown as DB)
  return instance
}

export function requireDb(): DB {
  const db = getDb()
  if (!db) throw new Error('DATABASE_URL ist nicht gesetzt.')
  return db
}
