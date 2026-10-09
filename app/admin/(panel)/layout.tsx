import { eq, sql } from 'drizzle-orm'
import { PushPrompt } from '@/components/admin/Push'
import { Sidebar } from '@/components/admin/Sidebar'
import { inquiries } from '@/db/schema'
import { requireAdmin } from '@/lib/auth'
import { getDb } from '@/lib/db'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const db = getDb()
  let newCount = 0
  if (db) {
    try {
      const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(inquiries).where(eq(inquiries.status, 'neu'))
      newCount = r.n
    } catch {}
  }
  return (
    <div className="lg:flex">
      <Sidebar newCount={newCount} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <PushPrompt newCount={newCount} />
          {children}
        </div>
      </main>
    </div>
  )
}
