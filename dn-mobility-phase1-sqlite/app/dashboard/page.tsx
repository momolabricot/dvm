// app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

type MissionStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'CANCELED'

type Mission = {
  id: string
  title: string
  description?: string | null
  scheduledAt?: string | null
  pickupAddress: string
  dropoffAddress: string
  distanceKm?: number | null
  status: MissionStatus
  quote?: { number: string | null } | null
}

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  })

// Libellés FR + couleurs DA pour les statuts
const STATUS_FR: Record<MissionStatus, { label: string; bg: string; text: string }> = {
  DRAFT:       { label: 'Brouillon',  bg: 'bg-gray-100',    text: 'text-gray-800' },
  PLANNED:     { label: 'Planifiée',  bg: 'bg-sky-100',     text: 'text-sky-800' },
  ASSIGNED:    { label: 'Assignée',   bg: 'bg-violet-100',  text: 'text-violet-800' },
  IN_PROGRESS: { label: 'En cours',   bg: 'bg-amber-100',   text: 'text-amber-800' },
  DONE:        { label: 'Terminée',   bg: 'bg-emerald-100', text: 'text-emerald-800' },
  CANCELED:    { label: 'Annulée',    bg: 'bg-rose-100',    text: 'text-rose-800' },
}

function StatusBadge({ status }: { status: MissionStatus }) {
  const s = STATUS_FR[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const role = (session?.user as any)?.role as Role | undefined

  // Filtres simples
  const [statusFilter, setStatusFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const endpoint = useMemo(() => {
    if (role === 'CONVOYEUR') return '/api/convoyeur/missions'
    if (role === 'CLIENT') return '/api/client/missions'
    return null
  }, [role])

  const { data, error, isLoading, mutate } = useSWR<any>(endpoint ?? null, fetcher)

  // compatibilité: certaines routes renvoient {missions: [...]}, d'autres {rows: [...]}
  const allMissions: Mission[] = useMemo(() => {
    if (!data) return []
    return (data.missions ?? data.rows ?? []) as Mission[]
  }, [data])

  const missions = useMemo(() => {
    return allMissions.filter((m) => {
      if (statusFilter && m.status !== (statusFilter as MissionStatus)) return false
      if (from && m.scheduledAt && new Date(m.scheduledAt) < new Date(from + 'T00:00:00')) return false
      if (to && m.scheduledAt && new Date(m.scheduledAt) > new Date(to + 'T23:59:59')) return false
      return true
    })
  }, [allMissions, statusFilter, from, to])

  if (status === 'loading') {
    return <main className="mx-auto max-w-6xl p-4 sm:p-6">Chargement…</main>
  }
  if (!session) {
    return <main className="mx-auto max-w-6xl p-4 sm:p-6">Non authentifié.</main>
  }

  // Admin → page d’aiguillage propre (DA violette)
  if (role === 'ADMIN' || role === 'ADMIN_IT') {
    return (
      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-violet-700">Tableau de bord</h1>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-gray-700 mb-4">Vous êtes administrateur.</p>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
          >
            Aller à l’administration
          </Link>
        </section>
      </main>
    )
  }

  async function changeStatus(id: string, next: MissionStatus) {
    // uniquement convoyeur
    if (role !== 'CONVOYEUR') return
    const res = await fetch(`/api/convoyeur/missions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || 'Échec mise à jour du statut')
      return
    }
    mutate()
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-violet-700">
          {role === 'CONVOYEUR' ? 'Mes missions assignées' : 'Mes missions'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Rafraîchir
          </button>
        </div>
      </header>

      {/* Filtres — DA violette */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="PLANNED">Planifiée</option>
              <option value="ASSIGNED">Assignée</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminée</option>
              <option value="CANCELED">Annulée</option>
              <option value="DRAFT">Brouillon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Du</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Au</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="sm:ml-auto">
            <button
              className="inline-flex w-full items-center justify-center rounded-md bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
              onClick={() => mutate()}
            >
              Appliquer
            </button>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Liste des missions</h2>
          <div className="text-xs text-gray-600">{missions.length} mission(s)</div>
        </div>

        {isLoading && <p className="p-4 text-sm text-gray-600">Chargement…</p>}
        {error && <p className="p-4 text-sm text-rose-700">Erreur de chargement.</p>}
        {!isLoading && !error && missions.length === 0 && (
          <p className="p-4 text-sm text-gray-600">Aucune mission.</p>
        )}

        {missions.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[20%]" /> {/* Titre */}
                <col className="w-[16%]" /> {/* Date */}
                <col className="w-[22%]" /> {/* Départ */}
                <col className="w-[22%]" /> {/* Arrivée */}
                <col className="w-[8%]" />  {/* Distance */}
                <col className="w-[12%]" /> {/* Statut */}
                {/* Actions seulement pour CONVOYEUR */}
              </colgroup>
              <thead className="bg-violet-50/60">
                <tr className="text-left">
                  <th className="py-2 pl-4 pr-3 text-xs font-semibold text-gray-700">Titre</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Date</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Départ</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Arrivée</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Km</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Statut</th>
                  {role === 'CONVOYEUR' && (
                    <th className="py-2 pr-4 text-right text-xs font-semibold text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100 align-top hover:bg-violet-50/30">
                    <td className="py-2 pl-4 pr-3 break-words">
                      <div className="font-medium text-gray-900">{m.title}</div>
                      {m.description && (
                        <div className="text-xs text-gray-500 line-clamp-2">{m.description}</div>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-gray-600 whitespace-nowrap">
                      {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="truncate" title={m.pickupAddress}>{m.pickupAddress}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="truncate" title={m.dropoffAddress}>{m.dropoffAddress}</div>
                    </td>
                    <td className="py-2 pr-3">
                      {typeof m.distanceKm === 'number' ? `${m.distanceKm.toFixed(1)} km` : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={m.status} />
                    </td>
                    {role === 'CONVOYEUR' && (
                      <td className="py-2 pr-4 text-right">
                        {/* Actions simples en FR */}
                        {(m.status === 'PLANNED' || m.status === 'ASSIGNED') && (
                          <button
                            className="rounded-md border border-violet-200 px-2 py-1 text-xs hover:bg-violet-50"
                            onClick={() => changeStatus(m.id, 'IN_PROGRESS')}
                          >
                            Démarrer
                          </button>
                        )}
                        {m.status === 'IN_PROGRESS' && (
                          <button
                            className="rounded-md border border-emerald-200 px-2 py-1 text-xs hover:bg-emerald-50 ml-2"
                            onClick={() => changeStatus(m.id, 'DONE')}
                          >
                            Terminer
                          </button>
                        )}
                        {m.status !== 'DONE' && m.status !== 'CANCELED' && (
                          <button
                            className="rounded-md border border-rose-200 px-2 py-1 text-xs hover:bg-rose-50 ml-2"
                            onClick={() => changeStatus(m.id, 'CANCELED')}
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
