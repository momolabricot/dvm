// app/admin/convoyeurs/[id]/page.tsx
'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
})

type MissionRow = {
  id: string
  title: string
  scheduledAt: string | null
  distanceKm: number | null
  payoutAmount: number | null
  due: number
  client?: { user?: { name?: string | null; email?: string | null } }
}
type Summary = {
  convoyeur: { id: string; name?: string | null; email?: string | null; ratePerKm: number }
  month: string
  totalDue: number
  missions: MissionRow[]
}

export default function ConvoyeurDetail({ params }: { params: { id: string } }) {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  const url = useMemo(() => `/api/admin/convoyeurs/${params.id}/summary?month=${month}`, [params.id, month])
  const { data, error, isLoading, mutate } = useSWR<Summary>(url, fetcher)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Convoyeur — {data?.convoyeur?.name || '…'} <span className="text-gray-500 text-sm">({data?.convoyeur?.email})</span>
        </h1>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
                 className="rounded-md border px-3 py-2 text-sm"/>
          <button className="rounded-md border px-3 py-2 text-sm" onClick={()=>mutate()}>Rafraîchir</button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-600">Chargement…</p>}
      {error && <p className="text-sm text-red-700">Erreur de chargement.</p>}
      {data && (
        <>
          <div className="rounded-xl border p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Taux par défaut</div>
              <div className="text-xl font-semibold">{data.convoyeur.ratePerKm.toLocaleString('fr-FR',{minimumFractionDigits:2})} € / km</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total dû ({data.month})</div>
              <div className="text-xl font-semibold">{data.totalDue.toLocaleString('fr-FR',{minimumFractionDigits:2})} €</div>
            </div>
          </div>

          <section className="rounded-xl border p-4">
            <h2 className="font-medium mb-3">Missions clôturées</h2>
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Titre</th>
                    <th className="py-2 pr-3">Client</th>
                    <th className="py-2 pr-3">Km</th>
                    <th className="py-2 pr-3">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {data.missions.map(m => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 pr-3">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fr-FR') : '—'}</td>
                      <td className="py-2 pr-3">{m.title}</td>
                      <td className="py-2 pr-3">{m.client?.user?.name || m.client?.user?.email || '—'}</td>
                      <td className="py-2 pr-3">{m.distanceKm ?? '—'}</td>
                      <td className="py-2 pr-3">{m.due.toLocaleString('fr-FR',{minimumFractionDigits:2})} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
