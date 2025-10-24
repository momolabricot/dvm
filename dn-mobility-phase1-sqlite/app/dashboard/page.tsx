// app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

type Mission = {
  id: string
  title: string
  description?: string | null
  scheduledAt?: string | null
  pickupAddress: string
  dropoffAddress: string
  distanceKm?: number | null
  status: 'DRAFT' | 'PLANNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED'
  quote?: { number: string | null } | null
}

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  })

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const role = (session?.user as any)?.role as Role | undefined

  // Filtres pour convoyeur (status + dates)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const endpoint = useMemo(() => {
    if (role === 'CONVOYEUR') {
      // on réutilise /api/convoyeur/missions + filtrage côté client pour la démo
      return '/api/convoyeur/missions'
    }
    if (role === 'CLIENT') {
      return '/api/client/missions'
    }
    return null
  }, [role])

  const { data, error, isLoading, mutate } = useSWR<{ missions: Mission[] }>(endpoint ?? null, fetcher)

  const missions = useMemo(() => {
    const all = data?.missions ?? []
    // Filtrage simple côté client (si tu veux côté serveur, on fera une route dédiée)
    return all.filter(m => {
      if (statusFilter && m.status !== statusFilter) return false
      if (from && m.scheduledAt && new Date(m.scheduledAt) < new Date(from + 'T00:00:00')) return false
      if (to && m.scheduledAt && new Date(m.scheduledAt) > new Date(to + 'T23:59:59')) return false
      return true
    })
  }, [data, statusFilter, from, to])

  if (status === 'loading') return <main className="p-6">Chargement…</main>
  if (!session) return <main className="p-6">Non authentifié.</main>

  // Admin → lien vers /admin
  if (role === 'ADMIN' || role === 'ADMIN_IT') {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p>Vous êtes administrateur.</p>
        <div className="flex gap-3">
          <Link href="/admin" className="underline">Aller à l’administration</Link>
        </div>
      </main>
    )
  }

  // Action convoyeur : changer statut
  async function changeStatus(id: string, next: Mission['status']) {
    const res = await fetch(`/api/convoyeur/missions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || 'Échec mise à jour statut')
      return
    }
    mutate()
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {role === 'CONVOYEUR' ? 'Mes missions assignées' : 'Mes missions'}
      </h1>

      {/* Filtres (convoyeur & client) */}
      <section className="rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-4 items-end">
          <div>
            <label className="block text-sm">Statut</label>
            <select className="mt-1 rounded-md border px-3 py-2" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="PLANNED">PLANNED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Du</label>
            <input type="date" className="mt-1 rounded-md border px-3 py-2" value={from} onChange={e=>setFrom(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm">Au</label>
            <input type="date" className="mt-1 rounded-md border px-3 py-2" value={to} onChange={e=>setTo(e.target.value)} />
          </div>

          <div className="sm:text-right">
            <button className="rounded-md border px-3 py-2" onClick={()=>mutate()}>Rafraîchir</button>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="rounded-xl border p-4">
        {isLoading && <p>Chargement…</p>}
        {error && <p className="text-red-700">Erreur de chargement.</p>}
        {missions.length === 0 && !isLoading && !error && <p>Aucune mission.</p>}

        {missions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Titre</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Départ</th>
                  <th className="py-2 pr-3">Arrivée</th>
                  <th className="py-2 pr-3">Distance</th>
                  <th className="py-2 pr-3">Statut</th>
                  {role === 'CONVOYEUR' && <th className="py-2 pr-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {missions.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{m.title}</td>
                    <td className="py-2 pr-3">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fr-FR') : '—'}</td>
                    <td className="py-2 pr-3">{m.pickupAddress}</td>
                    <td className="py-2 pr-3">{m.dropoffAddress}</td>
                    <td className="py-2 pr-3">{m.distanceKm ? `${m.distanceKm} km` : '—'}</td>
                    <td className="py-2 pr-3"><span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{m.status}</span></td>
                    {role === 'CONVOYEUR' && (
                      <td className="py-2 pr-3">
                        {/* Boutons simples suivant le statut */}
                        {m.status === 'PLANNED' || m.status === 'ASSIGNED' ? (
                          <button className="rounded-md border px-2 py-1 mr-2" onClick={()=>changeStatus(m.id, 'IN_PROGRESS')}>
                            Démarrer
                          </button>
                        ) : null}
                        {m.status === 'IN_PROGRESS' ? (
                          <button className="rounded-md border px-2 py-1 mr-2" onClick={()=>changeStatus(m.id, 'DONE')}>
                            Terminer
                          </button>
                        ) : null}
                        {m.status !== 'DONE' && m.status !== 'CANCELED' ? (
                          <button className="rounded-md border px-2 py-1" onClick={()=>changeStatus(m.id, 'CANCELED')}>
                            Annuler
                          </button>
                        ) : null}
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
