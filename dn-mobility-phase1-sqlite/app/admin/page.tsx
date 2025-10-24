// app/admin/page.tsx
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export default async function AdminHome() {
  await requireRole(['ADMIN', 'ADMIN_IT'])

  const [missions, users, convoyeurs, clients] = await Promise.all([
    prisma.mission.count(),
    prisma.user.count(),
    prisma.convoyeurProfile.count(),
    prisma.clientProfile.count(),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-gray-600">Vue synthétique des éléments clés.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard emoji="📦" title="Missions" value={missions} />
        <StatCard emoji="👥" title="Utilisateurs" value={users} />
        <StatCard emoji="🚚" title="Convoyeurs" value={convoyeurs} />
        <StatCard emoji="👤" title="Clients" value={clients} />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-medium mb-2">Raccourcis</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/missions" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Gérer les missions</a>
          <a href="/admin/clients" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Clients & tarifs</a>
          <a href="/admin/convoyeurs" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Convoyeurs & tarifs</a>
          <a href="/admin/users" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Utilisateurs</a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ emoji, title, value }: { emoji: string; title: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
