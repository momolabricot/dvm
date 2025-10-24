// app/admin/users/page.tsx
'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  })

type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR'

type User = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  role: Role
  createdAt?: string
  isActive: boolean
}

type ApiUsersResponse = {
  users: User[]
  total: number
  page: number
  pageSize: number
}

export default function AdminUsersPage() {
  // Filtres
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [q, setQ] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  const listUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (roleFilter) params.set('role', roleFilter)
    if (q.trim()) params.set('q', q.trim())
    if (includeInactive) params.set('include_inactive', '1')
    return `/api/admin/users${params.toString() ? `?${params}` : ''}`
  }, [roleFilter, q, includeInactive])

  const { data, error, mutate, isLoading } = useSWR<ApiUsersResponse>(listUrl, fetcher)

  // Formulaire de création
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'CLIENT' as Role,
    name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    setOk(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ en dev uniquement, en prod préférer la création par session admin
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_CREATE_SECRET || 'change_me_admin_create',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          name: form.name || undefined,
          phone: form.phone || undefined,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Échec création')
      setOk('Utilisateur créé.')
      setForm({ email: '', password: '', role: 'CLIENT', name: '', phone: '' })
      mutate()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onSoftDelete(id: string) {
    if (!confirm('Désactiver cet utilisateur ?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Suppression impossible')
      return
    }
    mutate()
  }

  async function onReactivate(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    })
    if (!res.ok) {
      alert('Réactivation impossible')
      return
    }
    mutate()
  }

  const users = data?.users ?? []
  const loadState = isLoading ? 'loading' : error ? 'error' : users.length === 0 ? 'empty' : 'ready'

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Utilisateurs</h1>

      {/* Filtres */}
      <section className="rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-4 items-end">
          <div>
            <label className="block text-sm font-medium">Filtrer par rôle</label>
            <select
              className="mt-1 rounded-md border px-3 py-2 w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | '')}
            >
              <option value="">Tous</option>
              <option value="CLIENT">CLIENT</option>
              <option value="CONVOYEUR">CONVOYEUR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ADMIN_IT">ADMIN_IT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Recherche email</label>
            <input
              className="mt-1 rounded-md border px-3 py-2 w-full"
              placeholder="ex: jean@exemple.com"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            Inclure les inactifs
          </label>

          <div className="sm:ml-auto">
            <button className="rounded-md border px-3 py-2 text-sm" onClick={() => mutate()}>
              Rafraîchir
            </button>
          </div>
        </div>
      </section>

      {/* Création */}
      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Créer un utilisateur</h2>
        <form onSubmit={onCreate} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Mot de passe *"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <select
            className="rounded-md border px-3 py-2"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          >
            <option value="CLIENT">CLIENT</option>
            <option value="CONVOYEUR">CONVOYEUR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ADMIN_IT">ADMIN_IT</option>
          </select>
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Nom affiché (optionnel)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Téléphone (optionnel)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <button disabled={loading} className="rounded-md bg-indigo-600 text-white px-4 py-2">
              {loading ? 'Création…' : 'Créer'}
            </button>
            {ok && <span className="ml-3 text-green-700">{ok}</span>}
            {err && <span className="ml-3 text-red-700">{err}</span>}
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Liste</h2>

        {loadState === 'loading' && <p className="text-sm text-gray-600">Chargement…</p>}
        {loadState === 'error' && <p className="text-sm text-red-700">Erreur de chargement.</p>}
        {loadState === 'empty' && <p className="text-sm text-gray-600">Aucun utilisateur.</p>}

        {loadState === 'ready' && (
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Nom</th>
                  <th className="py-2 pr-3">Téléphone</th>
                  <th className="py-2 pr-3">Rôle</th>
                  <th className="py-2 pr-3">Statut</th>
                  <th className="py-2 pr-3 text-right">Créé le</th>
                  <th className="py-2 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{u.name || '—'}</td>
                    <td className="py-2 pr-3">{u.phone || '—'}</td>
                    <td className="py-2 pr-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{u.role}</span>
                    </td>
                    <td className="py-2 pr-3">
                      {u.isActive ? (
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs">Actif</span>
                      ) : (
                        <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-xs">Inactif</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-xs text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-2 pl-3 text-right">
                      {u.isActive ? (
                        <button
                          onClick={() => onSoftDelete(u.id)}
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          Désactiver
                        </button>
                      ) : (
                        <button
                          onClick={() => onReactivate(u.id)}
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-gray-600">
              {data?.total ?? 0} utilisateur(s)
              {roleFilter ? ` • Rôle: ${roleFilter}` : ''}
              {q ? ` • Recherche: “${q}”` : ''}
              {!includeInactive ? ' • (inactifs masqués)' : ' • (inactifs inclus)'}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
