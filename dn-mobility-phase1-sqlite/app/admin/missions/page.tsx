// app/admin/missions/page.tsx
'use client'

import useSWR from 'swr'
import { useCallback, useMemo, useState } from 'react'

type MissionStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'CANCELED'

type PayoutStatus = 'PENDING' | 'PAID' | 'CANCELED'

type UserLite = { id: string; name: string | null; email: string }
type ClientLite = { id: string; isActive: boolean; user: UserLite }
type ConvoyeurLite = { id: string; ratePerKm: number | null; user: UserLite }

type Mission = {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  description?: string | null
  clientId: string
  quoteId?: string | null
  assignedToId?: string | null
  scheduledAt?: string | null
  pickupAddress: string
  dropoffAddress: string
  distanceKm?: number | null
  clientPriceTTC?: number | null
  payoutAmount?: number | null
  payoutStatus?: PayoutStatus | null
  status: MissionStatus
  createdById?: string | null
  client: ClientLite
  assignedTo?: ConvoyeurLite | null
  createdBy?: UserLite | null
  quote?: any | null
}

type ApiResp = { rows: Mission[] }

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error(j?.error || `HTTP ${r.status}`)
    }
    return r.json()
  })

/** Statuts autorisés dans le SELECT (pas de Brouillon, Planifiée, Annulée) */
const STATUS_OPTIONS: { value: MissionStatus; label: string }[] = [
  { value: 'ASSIGNED',    label: 'Assignée' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE',        label: 'Terminée' },
]

/** Mapping complet (inclut tous les statuts pour éviter toute erreur d’affichage) */
const STATUS_STYLE: Record<
  MissionStatus,
  { label: string; bg: string; text: string }
> = {
  DRAFT:       { label: 'Brouillon',  bg: 'bg-gray-100',    text: 'text-gray-800' },
  PLANNED:     { label: 'Planifiée',  bg: 'bg-sky-100',     text: 'text-sky-800' },
  ASSIGNED:    { label: 'Assignée',   bg: 'bg-violet-100',  text: 'text-violet-800' },
  IN_PROGRESS: { label: 'En cours',   bg: 'bg-amber-100',   text: 'text-amber-800' },
  DONE:        { label: 'Terminée',   bg: 'bg-emerald-100', text: 'text-emerald-800' },
  CANCELED:    { label: 'Annulée',    bg: 'bg-rose-100',    text: 'text-rose-800' },
}

function StatusBadge({ status }: { status: MissionStatus }) {
  const s = STATUS_STYLE[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-800' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

export default function AdminMissionsPage() {
  // Filtres simples
  const [q, setQ] = useState('')

  const listUrl = useMemo(() => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    return `/api/admin/missions${p.toString() ? `?${p}` : ''}`
  }, [q])

  const { data, error, mutate, isLoading } = useSWR<ApiResp>(listUrl, fetcher)
  const rows = data?.rows ?? []

  const loadState =
    isLoading ? 'loading' : error ? 'error' : rows.length === 0 ? 'empty' : 'ready'

  const handleStatusChange = useCallback(
    async (id: string, status: MissionStatus) => {
      // On ne propose que ASSIGNED / IN_PROGRESS / DONE, mais on accepte n’importe quel statut valide côté serveur
      try {
        const res = await fetch(`/api/admin/missions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j?.error || 'Mise à jour impossible')
        mutate()
      } catch (e: any) {
        alert(e.message || 'Erreur de mise à jour')
      }
    },
    [mutate]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Supprimer définitivement cette mission ?')) return
      try {
        const res = await fetch(`/api/admin/missions/${id}`, { method: 'DELETE' })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j?.error || 'Suppression impossible')
        mutate()
      } catch (e: any) {
        alert(e.message || 'Erreur de suppression')
      }
    },
    [mutate]
  )

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* Titre */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Missions</h1>
        <div className="flex items-center gap-2">
          <a
            href="/admin/missions/new"
            className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
          >
            Nouvelle mission
          </a>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center rounded-md border border-violet-200 bg-white px-3 py-2 text-sm hover:bg-violet-50"
          >
            Rafraîchir
          </button>
        </div>
      </header>

      {/* Filtres — DA violette */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Recherche</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              placeholder="Titre, client, convoyeur, adresse…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => mutate()}
              className="inline-flex w-full items-center justify-center rounded-md bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      </section>

      {/* Tableau */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Liste</h2>
          <div className="text-xs text-gray-600">{rows.length} mission(s)</div>
        </div>

        {loadState === 'loading' && <p className="p-4 text-sm text-gray-600">Chargement…</p>}
        {loadState === 'error' && <p className="p-4 text-sm text-rose-700">Erreur de chargement.</p>}
        {loadState === 'empty' && <p className="p-4 text-sm text-gray-600">Aucune mission.</p>}

        {loadState === 'ready' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[14%]" /> {/* Titre */}
                <col className="w-[16%]" /> {/* Client */}
                <col className="w-[16%]" /> {/* Convoyeur */}
                <col className="w-[18%]" /> {/* Adresses */}
                <col className="w-[10%]" /> {/* Distance */}
                <col className="w-[10%]" /> {/* Prix client */}
                <col className="w-[8%]" />  {/* Statut */}
                <col className="w-[8%]" />  {/* Planifiée */}
              </colgroup>

              <thead className="bg-violet-50/60">
                <tr className="text-left">
                  <th className="py-2 pl-4 pr-3 text-xs font-semibold text-gray-700">Titre</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Client</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Convoyeur</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Trajet</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Km</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Prix TTC (€)</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Statut</th>
                  <th className="py-2 pr-4 text-right text-xs font-semibold text-gray-700">Planifiée</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((m) => {
                  const clientName = m.client?.user?.name || m.client?.user?.email || '—'
                  const convName = m.assignedTo?.user?.name || m.assignedTo?.user?.email || '—'
                  const when = m.scheduledAt ? new Date(m.scheduledAt) : null
                  const whenStr = when
                    ? new Date(when).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—'
                  return (
                    <tr key={m.id} className="border-t border-gray-100 align-top">
                      <td className="py-2 pl-4 pr-3 break-words">
                        <div className="font-medium text-gray-900">{m.title}</div>
                        {m.description && (
                          <div className="text-xs text-gray-500 line-clamp-2">{m.description}</div>
                        )}
                        {/* Actions : uniquement Supprimer (pas de lien Ouvrir) */}
                        <div className="mt-1">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="rounded-md border border-rose-300 text-rose-700 px-2 py-1 text-xs hover:bg-rose-50"
                            title="Supprimer définitivement"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>

                      <td className="py-2 pr-3 break-words">
                        <div className="font-medium text-gray-900">{clientName}</div>
                        <div className="text-xs text-gray-500">{m.client?.user?.email}</div>
                      </td>

                      <td className="py-2 pr-3 break-words">
                        <div className="font-medium text-gray-900">{convName}</div>
                        <div className="text-xs text-gray-500">{m.assignedTo?.user?.email || '—'}</div>
                      </td>

                      <td className="py-2 pr-3 break-words">
                        <div className="text-xs text-gray-600">
                          <div className="truncate" title={m.pickupAddress}>
                            {m.pickupAddress}
                          </div>
                          <div className="truncate" title={m.dropoffAddress}>
                            {m.dropoffAddress}
                          </div>
                        </div>
                      </td>

                      <td className="py-2 pr-3">
                        {typeof m.distanceKm === 'number' ? m.distanceKm.toFixed(1) : '—'}
                      </td>

                      <td className="py-2 pr-3">
                        {typeof m.clientPriceTTC === 'number'
                          ? m.clientPriceTTC.toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '—'}
                      </td>

                      <td className="py-2 pr-3">
                        <div className="mb-1">
                          <StatusBadge status={m.status} />
                        </div>
                        <label className="sr-only" htmlFor={`status-${m.id}`}>
                          Changer le statut
                        </label>
                        <select
                          id={`status-${m.id}`}
                          className="mt-1 w-full rounded-md border-gray-300 text-xs focus:border-violet-500 focus:ring-violet-500"
                          value={
                            STATUS_OPTIONS.some((s) => s.value === m.status)
                              ? m.status
                              : 'ASSIGNED'
                          }
                          onChange={(e) =>
                            handleStatusChange(m.id, e.target.value as MissionStatus)
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 pr-4 text-right text-xs text-gray-500 whitespace-nowrap">
                        {whenStr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
