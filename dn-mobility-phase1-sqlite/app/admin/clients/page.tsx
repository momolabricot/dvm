'use client'

import useSWR from 'swr'
import { useState } from 'react'

type ClientRow = {
  id: string
  companyName?: string | null
  priceFactor: number
  isActive: boolean
  user: { id: string; name?: string | null; email: string }
}

const fetcher = async (url: string): Promise<ClientRow[]> => {
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  const j = await r.json()

  // Normalisation pour s'assurer qu'on a bien un tableau
  if (Array.isArray(j)) return j as ClientRow[]
  if (Array.isArray(j?.clients)) return j.clients as ClientRow[]
  if (Array.isArray(j?.data)) return j.data as ClientRow[]

  throw new Error('Réponse API inattendue (pas un tableau).')
}

export default function AdminClientsPage() {
  const { data, error, mutate, isLoading } = useSWR<ClientRow[]>('/api/admin/clients', fetcher)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function updateClient(id: string, patch: Partial<{ priceFactor: number; isActive: boolean }>) {
    setSavingId(id)
    setErr(null)
    setOk(null)
    try {
      const res = await fetch(`/api/admin/clients/${id}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Update error')
      setOk('Modifié.')
      mutate()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      {isLoading && <p className="text-sm text-gray-600">Chargement…</p>}
      {error && <p className="text-sm text-red-700">Erreur de chargement.</p>}

      {Array.isArray(data) && (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Facteur prix</th>
                <th className="py-2 pr-3">Actif</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{c.companyName || c.user.name || '—'}</td>
                  <td className="py-2 pr-3">{c.user.email}</td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      defaultValue={c.priceFactor}
                      onBlur={(e) => {
                        const val = parseFloat(e.currentTarget.value)
                        if (!isFinite(val) || val <= 0) return
                        if (val === c.priceFactor) return
                        updateClient(c.id, { priceFactor: val })
                      }}
                      className="w-28 rounded-md border px-2 py-1"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={c.isActive}
                        onChange={(e) => updateClient(c.id, { isActive: e.currentTarget.checked })}
                      />
                      <span>{c.isActive ? 'Oui' : 'Non'}</span>
                    </label>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {savingId === c.id ? <span>…</span> : <span className="text-gray-500">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-gray-600">
            {ok && <span className="text-green-700 mr-3">{ok}</span>}
            {err && <span className="text-red-700">{err}</span>}
          </div>
        </div>
      )}

      {!isLoading && !error && (!data || !Array.isArray(data)) && (
        <p className="text-sm text-gray-600">Aucune donnée trouvée.</p>
      )}
    </div>
  )
}
