'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserLite = { id: string; name: string | null; email: string | null }
type ClientRow = { id: string; user?: UserLite | null }
type ConvoyeurRow = { id: string; ratePerKm: number | null; user?: UserLite | null }

function labelFromUser(u?: UserLite | null, fallback?: string) {
  if (!u) return fallback || '—'
  return u.name?.trim() || u.email?.trim() || fallback || '—'
}

export default function NewMissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<ClientRow[]>([])
  const [convoyeurs, setConvoyeurs] = useState<ConvoyeurRow[]>([])

  // champs
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [assignedToId, setAssignedToId] = useState<string | ''>('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [distanceKm, setDistanceKm] = useState<string>('') // string pour l’input
  const [clientPriceTTC, setClientPriceTTC] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('') // datetime-local

  // chargement des listes
  useEffect(() => {
    async function load() {
      try {
        // On ne filtre plus sur active=1 pour éviter la liste vide
        const rc = await fetch('/api/admin/clients', { cache: 'no-store' })
        const rv = await fetch('/api/admin/convoyeurs', { cache: 'no-store' })

        const jc = rc.ok ? await rc.json() : { rows: [] }
        const jv = rv.ok ? await rv.json() : { rows: [] }

        // On normalise un minimum : rows ou data
        const cRows: ClientRow[] = (jc.rows || jc.data || []).map((r: any) => ({
          id: r.id,
          user: r.user ? { id: r.user.id, name: r.user.name ?? null, email: r.user.email ?? null } : null,
        }))
        const vRows: ConvoyeurRow[] = (jv.rows || jv.data || []).map((r: any) => ({
          id: r.id,
          ratePerKm: r.ratePerKm ?? null,
          user: r.user ? { id: r.user.id, name: r.user.name ?? null, email: r.user.email ?? null } : null,
        }))

        // Tri alpha par nom/email pour plus de confort
        cRows.sort((a, b) => labelFromUser(a.user, a.id).localeCompare(labelFromUser(b.user, b.id), 'fr'))
        vRows.sort((a, b) => labelFromUser(a.user, a.id).localeCompare(labelFromUser(b.user, b.id), 'fr'))

        setClients(cRows)
        setConvoyeurs(vRows)
      } catch (e) {
        // non bloquant — on laisse le formulaire utilisable
      }
    }
    load()
  }, [])

  const hasClients = useMemo(() => clients.length > 0, [clients])
  const hasConvoyeurs = useMemo(() => convoyeurs.length > 0, [convoyeurs])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!title || !clientId || !pickupAddress || !dropoffAddress) {
        throw new Error('Veuillez remplir les champs obligatoires.')
      }

      const payload: any = {
        title,
        description: description || null,
        clientId,
        assignedToId: assignedToId || null,
        pickupAddress,
        dropoffAddress,
        distanceKm: distanceKm ? Number(distanceKm) : null,
        clientPriceTTC: clientPriceTTC ? Number(clientPriceTTC) : null,
        scheduledAt: scheduledAt || null,
      }

      const res = await fetch('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Erreur ${res.status} – ${txt}`)
      }
      router.push('/admin/missions')
    } catch (e: any) {
      setError(e?.message || 'Création impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nouvelle mission</h1>
        <p className="text-sm text-gray-500">Renseignez les informations ci-dessous.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-md border bg-white p-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium">Titre *</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Client *</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">{hasClients ? 'Sélectionner…' : '— Aucun client —'}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {labelFromUser(c.user, c.id)}
                </option>
              ))}
            </select>
            {!hasClients && (
              <p className="mt-1 text-xs text-gray-500">
                Aucun client trouvé. Vérifie /api/admin/clients ou crée d’abord un client.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Convoyeur (optionnel)</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
            >
              <option value="">{hasConvoyeurs ? '— Non assignée —' : '— Aucun convoyeur —'}</option>
              {convoyeurs.map((v) => (
                <option key={v.id} value={v.id}>
                  {labelFromUser(v.user, v.id)}
                  {v.ratePerKm != null ? ` • ${v.ratePerKm} €/km` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Adresse départ *</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Adresse arrivée *</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="ex: 550.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Prix client TTC (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={clientPriceTTC}
              onChange={(e) => setClientPriceTTC(e.target.value)}
              placeholder="ex: 1127.17"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date / heure planifiée</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            {loading ? 'Création…' : 'Créer la mission'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/missions')}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </main>
  )
}
