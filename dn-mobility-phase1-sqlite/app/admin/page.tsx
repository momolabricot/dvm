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
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-violet-700">
          Tableau de bord
        </h1>
        <p className="text-sm text-gray-600">
          Vue synthétique des éléments clés.
        </p>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard emoji="📦" title="Missions" value={missions} />
        <StatCard emoji="👥" title="Utilisateurs" value={users} />
        <StatCard emoji="🚚" title="Convoyeurs" value={convoyeurs} />
        <StatCard emoji="👤" title="Clients" value={clients} />
      </section>

      {/* Raccourcis */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Raccourcis</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/missions"
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Gérer les missions
          </a>
          <a
            href="/admin/clients"
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Clients & tarifs
          </a>
          <a
            href="/admin/convoyeurs"
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Convoyeurs & tarifs
          </a>
          <a
            href="/admin/users"
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Utilisateurs
          </a>
        </div>
      </section>
    </main>
  )
}

function StatCard({ emoji, title, value }: { emoji: string; title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold text-violet-700">{value}</div>
    </div>
  )
}
