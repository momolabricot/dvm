// app/admin/missions/page.tsx
'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'

type ClientItem = {
  id: string // ClientProfile.id
  companyName: string | null
  priceFactor?: number | null
  user: { id: string; email: string; name: string | null; isActive: boolean }
}

type ConvoyeurItem = {
  id: string // ConvoyeurProfile.id
  user: { id: string; email: string; name: string | null; isActive: boolean }
}

type MissionsResponse = {
  missions: Array<{
    id: string
    title: string
    description: string | null
    scheduledAt: string | null
    pickupAddress: string
    dropoffAddress: string
    distanceKm: number | null
    clientPriceTTC?: number | null
    status: string
    client: { id: string; companyName: string | null; user: { id: string; name: string | null; email: string } }
    assignedTo: { id: string; user: { id: string; name: string | null; email: string } } | null
    quote?: { number: string } | null
    createdAt: string
  }>
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
})

export default function AdminMissionsPage() {
  // listes
  const { data: missionsData, mutate } = useSWR<MissionsResponse>('/api/admin/missions', fetcher)
  const { data: clientsData } = useSWR<{ clients: ClientItem[] }>('/api/admin/clients?active=1', fetcher)
  const { data: convData } = useSWR<{ convoyeurs: ConvoyeurItem[] }>('/api/admin/convoyeurs?active=1', fetcher)

  const clients = clientsData?.clients ?? []
  const convoyeurs = convData?.convoyeurs ?? []
  const missions = missionsData?.missions ?? []

  // form création mission
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    pickupAddress: '',
    dropoffAddress: '',
    distanceKm: '',
    clientPriceTTC: '',
    clientId: '',        
    assignedToId: '',    
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true); setErr(null); setOk(null)

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        scheduledAt: form.scheduledAt || null,
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
        clientPriceTTC: form.clientPriceTTC ? Number(form.clientPriceTTC) : null,
        clientId: form.clientId || null,             
        assignedToId: form.assignedToId || null,    
      }
      const res = await fetch('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Échec de création')
      setOk('Mission créée.')
      setForm({
        title: '',
        description: '',
        scheduledAt: '',
        pickupAddress: '',
        dropoffAddress: '',
        distanceKm: '',
        clientPriceTTC: '',
        clientId: '',
        assignedToId: '',
      })
      mutate()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Missions</h1>

      {/* Création */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Créer une mission</h2>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Titre *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            type="datetime-local"
            className="rounded-md border px-3 py-2"
            value={form.scheduledAt}
            onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2 md:col-span-2"
            placeholder="Adresse de retrait *"
            value={form.pickupAddress}
            onChange={e => setForm(f => ({ ...f, pickupAddress: e.target.value }))}
            required
          />
          <input
            className="rounded-md border px-3 py-2 md:col-span-2"
            placeholder="Adresse de restitution *"
            value={form.dropoffAddress}
            onChange={e => setForm(f => ({ ...f, dropoffAddress: e.target.value }))}
            required
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Distance (km)"
            value={form.distanceKm}
            onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Prix client TTC (€)"
            value={form.clientPriceTTC}
            onChange={e => setForm(f => ({ ...f, clientPriceTTC: e.target.value }))}
          />

          {/* Sélecteur CLIENT (ClientProfile.id) */}
          <select
            className="rounded-md border px-3 py-2"
            value={form.clientId}
            onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
            required
          >
            <option value="">
              {clients.length ? 'Choisir un client *' : 'Aucun client actif'}
            </option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {(c.companyName || c.user.name || c.user.email) + ' — ' + c.user.email}
              </option>
            ))}
          </select>

          {/* Sélecteur CONVOYEUR (ConvoyeurProfile.id) */}
          <select
            className="rounded-md border px-3 py-2"
            value={form.assignedToId}
            onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
          >
            <option value="">
              {convoyeurs.length ? 'Assigner un convoyeur (optionnel)' : 'Aucun convoyeur actif'}
            </option>
            {convoyeurs.map(cv => (
              <option key={cv.id} value={cv.id}>
                {(cv.user.name || cv.user.email) + ' — ' + cv.user.email}
              </option>
            ))}
          </select>

          <textarea
            className="rounded-md border px-3 py-2 md:col-span-2"
            rows={4}
            placeholder="Notes / description…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />

          <div className="md:col-span-2">
            <button disabled={saving} className="rounded-md bg-indigo-600 text-white px-4 py-2">
              {saving ? 'Création…' : 'Créer'}
            </button>
            {ok && <span className="ml-3 text-green-700">{ok}</span>}
            {err && <span className="ml-3 text-red-700">{err}</span>}
          </div>
        </form>
      </section>

      {/* Liste des missions (lecture rapide) */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium mb-3">Liste</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Titre</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Convoyeur</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Retrait</th>
                <th className="py-2 pr-3">Restitution</th>
                <th className="py-2 pr-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {missions.map(m => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{m.title}</td>
                  <td className="py-2 pr-3">
                    {(m.client.companyName || m.client.user.name || m.client.user.email)}
                  </td>
                  <td className="py-2 pr-3">
                    {m.assignedTo ? (m.assignedTo.user.name || m.assignedTo.user.email) : '—'}
                  </td>
                  <td className="py-2 pr-3">
                    {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fr-FR') : '—'}
                  </td>
                  <td className="py-2 pr-3">{m.pickupAddress}</td>
                  <td className="py-2 pr-3">{m.dropoffAddress}</td>
                  <td className="py-2 pr-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{m.status}</span>
                  </td>
                </tr>
              ))}
              {missions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-600">Aucune mission.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
