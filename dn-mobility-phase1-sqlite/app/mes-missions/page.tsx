'use client'

import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (u:string)=>fetch(u).then(r=>r.json())

type MissionStatus = 'DRAFT'|'PLANNED'|'ASSIGNED'|'IN_PROGRESS'|'DONE'|'CANCELED'
type Mission = {
  id: string; title: string; pickupAddress: string; dropoffAddress: string;
  scheduledAt?: string|null; status: MissionStatus;
}

export default function MesMissionsPage() {
  const { data, mutate } = useSWR<Mission[]>('/api/convoyeur/missions', fetcher)
  const [loadingId, setLoadingId] = useState<string|null>(null)

  async function setStatus(id:string, status: 'IN_PROGRESS'|'DONE'|'CANCELED') {
    setLoadingId(id)
    await fetch(`/api/convoyeur/missions/${id}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status }),
    })
    setLoadingId(null)
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mes missions</h1>
      {!data && <p>Chargement…</p>}
      {data && data.length === 0 && <p>Aucune mission.</p>}
      {data && data.map(m=>(
        <div key={m.id} className="rounded-xl border p-4">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{m.title}</div>
              <div className="text-xs text-gray-500">{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fr-FR') : '—'}</div>
              <div className="text-sm mt-1">{m.pickupAddress} → {m.dropoffAddress}</div>
              <div className="mt-1 text-xs">Statut: <b>{m.status}</b></div>
            </div>
            <div className="flex items-start gap-2">
              <button disabled={loadingId===m.id} onClick={()=>setStatus(m.id,'IN_PROGRESS')} className="rounded-md border px-3 py-1.5">Démarrer</button>
              <button disabled={loadingId===m.id} onClick={()=>setStatus(m.id,'DONE')} className="rounded-md border px-3 py-1.5">Terminer</button>
              <button disabled={loadingId===m.id} onClick={()=>setStatus(m.id,'CANCELED')} className="rounded-md border px-3 py-1.5">Annuler</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
