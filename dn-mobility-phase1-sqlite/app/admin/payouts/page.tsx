// app/admin/payouts/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

type Row = {
  id: string
  name: string | null
  email: string | null
  ratePerKm: number
  totalKm: number
  missionsCount: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
}

function fmt(n: number, d = 2) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function AdminPayoutsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1..12
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)

  const ymParams = useMemo(() => `year=${year}&month=${month}`, [year, month])

  const load = async () => {
    setLoading(true); setErr(null)
    try {
      const r = await fetch(`/api/admin/payouts?${ymParams}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Erreur de chargement')
      setRows(j)
    } catch (e: any) {
      setErr(e?.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [ymParams])

  const onMark = async (id: string, mark: 'PAID' | 'PENDING') => {
    setLoading(true); setErr(null)
    try {
      const r = await fetch(`/api/admin/payouts/${id}?${ymParams}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Impossible de mettre à jour')
      await load()
    } catch (e: any) {
      setErr(e?.message ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const totalPending = rows.reduce((s, r) => s + r.pendingAmount, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0)
  const totalAll = rows.reduce((s, r) => s + r.totalAmount, 0)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Paiements Convoyeurs</h1>

      {/* Filtres */}
      <div className="flex gap-2 items-end mb-4">
        <div>
          <label className="block text-sm font-medium">Mois</label>
          <select
            className="border rounded px-2 py-1"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Année</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <button
          onClick={load}
          className="ml-2 rounded bg-black text-white px-3 py-1"
          disabled={loading}
        >
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {/* Totaux */}
      <div className="mb-3 text-sm text-gray-700">
        <span className="mr-4">À payer: <strong>{fmt(totalPending)} €</strong></span>
        <span className="mr-4">Payé: <strong>{fmt(totalPaid)} €</strong></span>
        <span>Total: <strong>{fmt(totalAll)} €</strong></span>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Convoyeur</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-right">Missions</th>
              <th className="p-2 text-right">Km</th>
              <th className="p-2 text-right">€/km</th>
              <th className="p-2 text-right">À payer</th>
              <th className="p-2 text-right">Payé</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name ?? '—'}</td>
                <td className="p-2">{r.email ?? '—'}</td>
                <td className="p-2 text-right">{r.missionsCount}</td>
                <td className="p-2 text-right">{fmt(r.totalKm, 1)}</td>
                <td className="p-2 text-right">{fmt(r.ratePerKm)} €</td>
                <td className="p-2 text-right">{fmt(r.pendingAmount)} €</td>
                <td className="p-2 text-right">{fmt(r.paidAmount)} €</td>
                <td className="p-2 text-right font-semibold">{fmt(r.totalAmount)} €</td>
                <td className="p-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      className="rounded border px-2 py-1"
                      onClick={() => onMark(r.id, 'PENDING')}
                      disabled={loading}
                      title="Marquer tout le mois en 'À payer'"
                    >
                      À payer
                    </button>
                    <button
                      className="rounded bg-green-600 text-white px-2 py-1"
                      onClick={() => onMark(r.id, 'PAID')}
                      disabled={loading}
                      title="Marquer tout le mois en 'Payé'"
                    >
                      Payé
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={9}>Aucune donnée</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {err && <p className="mt-3 text-red-700">{err}</p>}
    </div>
  )
}
