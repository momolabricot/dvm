// app/admin/convoyeurs/page.tsx
'use client'

import useSWR from 'swr'
import { useMemo, useState, useEffect } from 'react'

type ConvoyeurItem = {
  id: string
  ratePerKm: number | null
  user: { id: string; email: string; name: string | null; isActive?: boolean }
}

type ConvoyeursResponse = { convoyeurs: ConvoyeurItem[] }

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  })

export default function AdminConvoyeursPage() {
  const [q, setQ] = useState('')
  const [onlyActive, setOnlyActive] = useState(true)

  // drafts: { convoyeurId -> string saisi (€/km) }
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const url = useMemo(() => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (onlyActive) p.set('active', '1')
    return `/api/admin/convoyeurs${p.toString() ? `?${p.toString()}` : ''}`
  }, [q, onlyActive])

  const { data, error, isLoading, mutate } = useSWR<ConvoyeursResponse>(url, fetcher)
  const convoyeurs = data?.convoyeurs ?? []

  // Hydrate drafts au chargement/rafraîchissement des données
  useEffect(() => {
    if (!convoyeurs.length) return
    setDrafts(prev => {
      const next = { ...prev }
      for (const cv of convoyeurs) {
        // si pas déjà édité, initialiser depuis la valeur DB
        if (next[cv.id] === undefined) {
          next[cv.id] = cv.ratePerKm != null ? String(cv.ratePerKm) : ''
        }
      }
      return next
    })
  }, [convoyeurs])

  async function saveRate(convoyeurId: string) {
    const raw = drafts[convoyeurId]
    const value = raw?.trim() === '' ? null : Number(raw)
    if (raw?.trim() !== '' && Number.isNaN(value)) {
      alert('Veuillez saisir un nombre valide pour €/km (ex: 0.45).')
      return
    }

    const res = await fetch(`/api/admin/convoyeurs/${convoyeurId}/pricing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratePerKm: value }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || 'Impossible de sauvegarder')
      return
    }
    await mutate()
  }

  async function toggleActive(userId: string, next: boolean) {
    // Active/désactive via l’API utilisateurs (PATCH)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: next }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j?.error || 'Échec mise à jour du statut')
      return
    }
    await mutate()
  }

  const loadState = isLoading ? 'loading' : error ? 'error' : convoyeurs.length === 0 ? 'empty' : 'ready'

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Convoyeurs & Tarifs</h1>
          <p className="text-sm text-gray-600">Définissez le tarif (€/km) individuel pour chaque convoyeur.</p>
        </div>
      </header>

      {/* Filtres */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Recherche (nom/email)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="jean@exemple.com"
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-6 sm:mt-0">
            <input
              type="checkbox"
              className="rounded border"
              checked={onlyActive}
              onChange={e => setOnlyActive(e.target.checked)}
            />
            Afficher uniquement les actifs
          </label>
          <div className="sm:ml-auto flex items-end">
            <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => mutate()}>
              Rafraîchir
            </button>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium mb-3">Tous les convoyeurs</h2>

        {loadState === 'loading' && <p className="text-sm text-gray-600">Chargement…</p>}
        {loadState === 'error' && <p className="text-sm text-red-700">Erreur de chargement.</p>}
        {loadState === 'empty' && <p className="text-sm text-gray-600">Aucun convoyeur.</p>}

        {loadState === 'ready' && (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Nom</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3 w-40">€/km</th>
                  <th className="py-2 pr-3 w-32">Actif</th>
                  <th className="py-2 pr-3 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {convoyeurs.map(cv => {
                  const displayName = cv.user.name || cv.user.email
                  const value = drafts[cv.id] ?? (cv.ratePerKm != null ? String(cv.ratePerKm) : '')
                  return (
                    <tr key={cv.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{displayName}</td>
                      <td className="py-2 pr-3">{cv.user.email}</td>
                      <td className="py-2 pr-3">
                        <input
                          className="w-28 rounded-md border px-2 py-1 text-right"
                          placeholder="ex: 0.45"
                          value={value}
                          onChange={e =>
                            setDrafts(prev => ({
                              ...prev,
                              [cv.id]: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border"
                            checked={cv.user.isActive !== false}
                            onChange={e => toggleActive(cv.user.id, e.target.checked)}
                          />
                          <span className="text-xs text-gray-600">
                            {cv.user.isActive !== false ? 'Oui' : 'Non'}
                          </span>
                        </label>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <button
                          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                          onClick={() => saveRate(cv.id)}
                        >
                          Enregistrer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
