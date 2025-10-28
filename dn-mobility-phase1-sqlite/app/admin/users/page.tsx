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
          // ⚠️ dev uniquement. En prod, protéger via session/permissions.
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
      alert('Désactivation impossible')
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

  async function onHardDelete(id: string) {
    if (!confirm('⚠️ Supprimer définitivement cet utilisateur ? Cette action est irréversible.')) return
    const res = await fetch(`/api/admin/users/${id}?hard=1`, { method: 'DELETE' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert('Suppression impossible' + (j?.error ? `: ${j.error}` : ''))
      return
    }
    mutate()
  }

  const users = data?.users ?? []
  const loadState = isLoading ? 'loading' : error ? 'error' : users.length === 0 ? 'empty' : 'ready'

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* Titre + actions */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-white px-3 py-2 text-sm hover:bg-violet-50"
        >
          Rafraîchir
        </button>
      </header>

      {/* Filtres */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filtrer par rôle</label>
            <select
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
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

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Recherche email</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              placeholder="ex: jean@exemple.com"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              Inclure les inactifs
            </label>
          </div>
        </div>
      </section>

      {/* Création */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Créer un utilisateur</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            placeholder="Mot de passe *"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <select
            className="rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
          >
            <option value="CLIENT">CLIENT</option>
            <option value="CONVOYEUR">CONVOYEUR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ADMIN_IT">ADMIN_IT</option>
          </select>
          <input
            className="rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            placeholder="Nom affiché (optionnel)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            placeholder="Téléphone (optionnel)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              disabled={loading}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? 'Création…' : 'Créer'}
            </button>
            {ok && <span className="text-sm text-emerald-700">{ok}</span>}
            {err && <span className="text-sm text-rose-700">{err}</span>}
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Liste</h2>
          <div className="text-xs text-gray-600">
            {data?.total ?? 0} utilisateur(s)
            {roleFilter ? ` • Rôle: ${roleFilter}` : ''}
            {q ? ` • Recherche: “${q}”` : ''}
            {!includeInactive ? ' • (inactifs masqués)' : ' • (inactifs inclus)'}
          </div>
        </div>

        {loadState === 'loading' && <p className="p-4 text-sm text-gray-600">Chargement…</p>}
        {loadState === 'error' && <p className="p-4 text-sm text-rose-700">Erreur de chargement.</p>}
        {loadState === 'empty' && <p className="p-4 text-sm text-gray-600">Aucun utilisateur.</p>}

        {loadState === 'ready' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                {/* On donne plus de place aux actions, et on réduit un peu la date */}
                <col className="w-[26%]" /> {/* Email */}
                <col className="w-[14%]" /> {/* Nom */}
                <col className="w-[14%]" /> {/* Téléphone */}
                <col className="w-[12%]" /> {/* Rôle */}
                <col className="w-[12%]" /> {/* Statut */}
                <col className="w-[10%]" /> {/* Date */}
                <col className="w-[12%]" /> {/* Actions (élargi + wrap) */}
              </colgroup>
              <thead className="bg-violet-50/60">
                <tr className="text-left">
                  <th className="py-2 pr-3 pl-4 text-xs font-semibold text-gray-700">Email</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Nom</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Téléphone</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Rôle</th>
                  <th className="py-2 pr-3 text-xs font-semibold text-gray-700">Statut</th>
                  <th className="py-2 pr-3 text-right text-xs font-semibold text-gray-700">Créé le</th>
                  <th className="py-2 pl-3 pr-4 text-right text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 align-top">
                    <td className="py-2 pr-3 pl-4 break-words">{u.email}</td>
                    <td className="py-2 pr-3 break-words">{u.name || '—'}</td>
                    <td className="py-2 pr-3 break-words">{u.phone || '—'}</td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-xs text-gray-500 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-2 pl-3 pr-4">
                      {/* wrap autorisé pour éviter tout chevauchement */}
                      <div className="flex justify-end gap-2 flex-wrap">
                        {u.isActive ? (
                          <button
                            onClick={() => onSoftDelete(u.id)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                            title="Désactiver"
                          >
                            Désactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => onReactivate(u.id)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                            title="Réactiver"
                          >
                            Réactiver
                          </button>
                        )}
                        <button
                          onClick={() => onHardDelete(u.id)}
                          className="rounded-md border border-rose-300 text-rose-700 px-2 py-1 text-xs hover:bg-rose-50"
                          title="Supprimer définitivement"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
