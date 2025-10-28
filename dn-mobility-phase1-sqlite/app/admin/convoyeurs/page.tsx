'use client'

import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error(j?.error || `HTTP ${r.status}`)
    }
    return r.json()
  })

type Row = {
  id: string
  ratePerKm: number | null
  iban: string | null
  user: {
    id: string
    name: string | null
    email: string | null
    isActive: boolean
    role: 'ADMIN' | 'CLIENT' | 'CONVOYEUR'
  } | null
}

export default function AdminConvoyeursPage() {
  const sp = useSearchParams()
  const active = sp.get('active') ?? '1'
  const { data, error, isLoading, mutate } = useSWR<{ rows: Row[] }>(
    `/api/admin/convoyeurs?active=${active}`,
    fetcher
  )

  const [editing, setEditing] = useState<Record<string, string>>({})

  const onEditChange = (id: string, value: string) => {
    setEditing((prev) => ({ ...prev, [id]: value }))
  }

  const onSaveRate = async (id: string) => {
    const raw = editing[id]
    if (raw == null) return
    const num = Number(raw.replace(',', '.'))
    if (Number.isNaN(num) || num < 0) {
      alert('Veuillez saisir un nombre positif pour le €/km')
      return
    }
    try {
      const res = await fetch(`/api/admin/convoyeurs/${id}/payout-rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratePerKm: num }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Échec de la mise à jour du tarif')
      }
      await mutate()
    } catch (e: any) {
      alert(e?.message || 'Erreur réseau')
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-violet-700">
          Convoyeurs
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Actualiser
          </button>
        </div>
      </header>

      {/* Filtres */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700 mr-2">Filtre :</span>
          <a
            href="?active=1"
            className={`rounded-md border px-3 py-1 text-sm ${
              active === '1'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'text-violet-700 hover:bg-violet-50 border-violet-200'
            }`}
          >
            Actifs
          </a>
          <a
            href="?active=0"
            className={`rounded-md border px-3 py-1 text-sm ${
              active !== '1'
                ? 'bg-violet-600 text-white border-violet-600'
                : 'text-violet-700 hover:bg-violet-50 border-violet-200'
            }`}
          >
            Tous
          </a>
        </div>
      </section>

      {/* États */}
      {error && (
        <p className="text-sm text-rose-700">
          Erreur de chargement : {String(error)}
        </p>
      )}
      {isLoading && <p className="text-sm text-gray-600">Chargement…</p>}

      {/* Tableau */}
      {!isLoading && !error && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-violet-50/60">
              <tr className="text-left text-gray-700 text-xs font-semibold">
                <th className="py-2 pl-4 pr-3">Nom</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">€/km</th>
                <th className="py-2 pr-3">IBAN</th>
                <th className="py-2 pr-3">Actif</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows?.map((row) => {
                const displayVal =
                  editing[row.id] ??
                  (row.ratePerKm != null ? String(row.ratePerKm) : '')
                const email = row.user?.email || '—'
                return (
                  <tr
                    key={row.id}
                    className="border-t border-gray-100 align-middle hover:bg-violet-50/30"
                  >
                    <td className="py-2 pl-4 pr-3 break-words">{row.user?.name || '—'}</td>

                    {/* Email tronqué pour éviter le débordement */}
                    <td className="py-2 pr-3">
                      <div
                        className="truncate max-w-[28ch] sm:max-w-[40ch]"
                        title={email}
                      >
                        {email}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          className="w-20 rounded-md border-gray-300 text-sm focus:border-violet-500 focus:ring-violet-500 px-2 py-1"
                          placeholder="€/km"
                          value={displayVal}
                          onChange={(e) => onEditChange(row.id, e.target.value)}
                        />
                        <span className="text-gray-500">€/km</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{row.iban || '—'}</td>
                    <td className="py-2 pr-3">
                      {row.user?.isActive ? (
                        <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 text-xs">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 text-xs">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        onClick={() => onSaveRate(row.id)}
                        className="rounded-md bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-700"
                      >
                        Enregistrer
                      </button>
                    </td>
                  </tr>
                )
              })}

              {(!data?.rows || data.rows.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-gray-500 text-sm"
                  >
                    Aucun convoyeur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}
