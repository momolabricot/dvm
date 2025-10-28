// app/admin/clients/page.tsx
'use client'

import useSWR from 'swr'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

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
  companyName: string | null
  priceFactor: number
  user: {
    id: string
    name: string | null
    email: string | null
    isActive: boolean
    role: 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'
  }
}

// util: parse un nombre FR/EN ("1,25" -> 1.25)
function parseNumberLocale(n: unknown): number | null {
  if (n === null || n === undefined) return null
  const s = String(n).trim().replace(',', '.')
  if (!s) return null
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}

export default function AdminClientsPage() {
  const sp = useSearchParams()
  const active = sp.get('active') ?? '1'
  const { data, error, isLoading, mutate } = useSWR<{ rows: Row[] }>(
    `/api/admin/clients?active=${active}`,
    fetcher
  )

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formFactor, setFormFactor] = useState<string>('1')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ligne en cours d’édition (utile pour détecter si des changements ont été faits)
  const currentRow = useMemo(
    () => (editingId ? (data?.rows || []).find(r => r.id === editingId) : null),
    [editingId, data]
  )

  // valeur numérique parsée + validation locale (bornes 0.1..10 comme côté API)
  const parsedFactor = useMemo(() => parseNumberLocale(formFactor), [formFactor])
  const factorInvalid =
    parsedFactor == null || !Number.isFinite(parsedFactor) || parsedFactor < 0.1 || parsedFactor > 10

  // détecte si des changements existent vs la ligne originale
  const isDirty = useMemo(() => {
    if (!currentRow) return false
    const initialName = currentRow.companyName || 'Particulier'
    const initialFactor = currentRow.priceFactor ?? 1
    // normalise comparaison nombre
    const f = parsedFactor ?? NaN
    const sameName = (formName || 'Particulier').trim() === initialName
    const sameFactor = Number.isFinite(f) && Math.abs(f - initialFactor) < 1e-9
    return !(sameName && sameFactor)
  }, [currentRow, formName, parsedFactor])

  const startEdit = (row: Row) => {
    setEditingId(row.id)
    setFormName(row.companyName || 'Particulier')
    setFormFactor(String(row.priceFactor ?? 1))
    setErr(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setErr(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    if (factorInvalid) {
      setErr('Facteur invalide (0.1 à 10)')
      return
    }
    if (!isDirty) {
      setEditingId(null)
      return
    }
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`/api/admin/clients/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formName,                 // l’API convertit "Particulier" -> null
          priceFactor: parsedFactor as number,   // nombre validé + parsé (virgule/point)
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Échec de la mise à jour')
      await mutate()
      setEditingId(null)
    } catch (e: any) {
      setErr(e?.message || 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-violet-700">
          Clients
        </h1>
        <div className="flex items-center gap-2">
          <a
            href={`?active=${active}`}
            className="inline-flex items-center rounded-md border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700 hover:bg-violet-50"
          >
            Actualiser
          </a>
        </div>
      </header>

      {/* Filtres (actifs / tous) */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-1">Filtre :</span>
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
      {error && <p className="text-sm text-rose-700">Erreur de chargement.</p>}
      {isLoading && <p className="text-sm text-gray-600">Chargement…</p>}

      {/* Tableau */}
      {!isLoading && !error && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-violet-50/60">
              <tr className="text-left text-gray-700 text-xs font-semibold">
                <th className="py-2 pl-4 pr-3">Nom</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Entreprise</th>
                <th className="py-2 pr-3">Facteur prix</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows?.map((row) => {
                const isEditing = editingId === row.id
                return (
                  <tr
                    key={row.id}
                    className="border-t border-gray-100 align-middle hover:bg-violet-50/30"
                  >
                    <td className="py-2 pl-4 pr-3">{row.user?.name || '—'}</td>
                    <td className="py-2 pr-3">{row.user?.email || '—'}</td>

                    {/* Entreprise */}
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <input
                          className="w-full rounded-md border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:ring-violet-500"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Particulier"
                        />
                      ) : (
                        <span>{row.companyName || 'Particulier'}</span>
                      )}
                    </td>

                    {/* Facteur prix */}
                    <td className="py-2 pr-3">
                      {isEditing ? (
                        <input
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          className="w-24 rounded-md border-gray-300 px-2 py-1 text-right text-sm focus:border-violet-500 focus:ring-violet-500"
                          value={formFactor}
                          onChange={(e) => setFormFactor(e.target.value)}
                          title="Nombre entre 0,1 et 10"
                        />
                      ) : (
                        <span>
                          {(row.priceFactor ?? 1).toLocaleString('fr-FR', {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      {isEditing && factorInvalid && (
                        <div className="mt-1 text-[11px] text-rose-700">
                          Saisir un nombre entre 0,1 et 10
                        </div>
                      )}
                    </td>

                    {/* Statut */}
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

                    {/* Actions */}
                    <td className="py-2 pr-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-700 disabled:opacity-50"
                            onClick={saveEdit}
                            disabled={saving || factorInvalid || !isDirty}
                          >
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button
                            className="rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-50"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          className="rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-50"
                          onClick={() => startEdit(row)}
                        >
                          Modifier
                        </button>
                      )}
                      {isEditing && err && (
                        <div className="text-rose-700 text-xs mt-1">{err}</div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {(!data?.rows || data.rows.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Aucun client.
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
