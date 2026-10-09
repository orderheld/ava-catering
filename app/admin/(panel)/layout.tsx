import { eq, sql } from 'drizzle-orm'
import { PushPrompt } from '@/components/admin/Push'
import { Toaster } from '@/components/admin/forms'
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
    <div className="md:flex">
      <Sidebar newCount={newCount} />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:pt-10 md:pb-16 xl:px-14">
        <div className="mx-auto max-w-5xl">
          <PushPrompt newCount={newCount} />
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
