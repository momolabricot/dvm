// app/admin/layout.tsx
import { requireRole } from '@/lib/auth-helpers'
import AdminNav from '@/components/AdminNav'

export const metadata = { title: 'Admin — DN Mobility' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
          <AdminNav />
          <section className="space-y-6">{children}</section>
        </div>
      </div>
    </div>
  )
}
