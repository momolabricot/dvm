// app/admin/users/new/page.tsx
'use client'
import { useState } from 'react'

export default function NewUserPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null); setErr(null); setLoading(true)

    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries())
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Erreur')
      setMsg('Utilisateur créé 👍')
      ;(e.currentTarget as HTMLFormElement).reset()
    } catch (e: any) {
      setErr(e.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Créer un utilisateur</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email *</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Prénom</label>
            <input name="firstname" className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input name="lastname" className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Mot de passe *</label>
          <input name="password" type="password" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Rôle *</label>
          <select name="userRole" required className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="CLIENT">
            <option value="CLIENT">Client</option>
            <option value="CONVOYEUR">Convoyeur</option>
            <option value="ADMIN">Admin</option>
            <option value="ADMIN_IT">Admin IT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Multiplicateur de prix (1 par défaut)</label>
          <input name="priceMultiplier" type="number" step="0.01" min="0" defaultValue="1" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>

        <button className="btn" disabled={loading}>{loading ? 'Création…' : 'Créer'}</button>
        {msg && <p className="text-green-700">{msg}</p>}
        {err && <p className="text-red-700">{err}</p>}
      </form>
    </main>
  )
}
