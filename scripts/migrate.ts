// Gleicht die Tabellen in der Datenbank mit db/schema.ts ab (wie `npm run db:push`).
// Läuft automatisch vor jedem Build auf Vercel, damit niemand db:push von Hand ausführen muss.
// Fügt nur hinzu; Änderungen, bei denen Daten verloren gingen, werden ausgelassen und gemeldet.
// Ein Fehler bricht den Build nicht ab – die Website läuft dann mit dem bisherigen Stand weiter.
import { pushSchema } from 'drizzle-kit/api'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

try {
  process.loadEnvFile('.env.local')
} catch {}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) return console.log('[db] DATABASE_URL fehlt – Datenbank-Abgleich übersprungen.')
  const client = postgres(url, { max: 1, prepare: false, ssl: url.includes('localhost') ? false : 'require', onnotice: () => {} })
  try {
    const db = drizzle(client)
    // pushSchema erwartet Ergebnisse im Format { rows } (wie node-postgres)
    const adapter = { execute: async (q: Parameters<typeof db.execute>[0]) => ({ rows: await db.execute(q) }) }
    const { statementsToExecute, hasDataLoss, warnings, apply } = await pushSchema(schema, adapter as never)
    if (!statementsToExecute.length) return console.log('[db] Tabellen sind aktuell.')
    if (hasDataLoss) {
      console.warn('[db] Abgleich würde Daten löschen und wurde NICHT ausgeführt:\n' + warnings.join('\n'))
      return
    }
    await apply()
    console.log(`[db] ${statementsToExecute.length} Änderung(en) übernommen:\n` + statementsToExecute.join('\n'))
  } finally {
    await client.end()
  }
}

// drizzle-kit beendet den Prozess bei Verbindungsfehlern mit exit(1) – das soll den Build nicht abbrechen
const exit = process.exit
process.exit = ((code?: number) => {
  console.error(`[db] Abgleich fehlgeschlagen (Code ${code}) – Build läuft weiter.`)
  exit(0)
}) as typeof process.exit

main()
  .catch((err) => console.error('[db] Abgleich fehlgeschlagen (Build läuft weiter):', err))
  .finally(() => (process.exit = exit))
