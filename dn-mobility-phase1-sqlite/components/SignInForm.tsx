'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Corrige le callback si on est sur un autre origin (ex: Codespaces)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  let cb = callbackUrl || '/'
  if (cb.startsWith('http://localhost') && currentOrigin) cb = currentOrigin

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    const res = await signIn('credentials', {
      email,
      password: pass,
      callbackUrl: cb,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      // redirige après login
      window.location.href = cb
    } else {
      setErr('Identifiants invalides.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border rounded-xl p-4 bg-white">
      <input
        className="w-full border rounded-md px-3 py-2"
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        required
      />
      <input
        className="w-full border rounded-md px-3 py-2"
        placeholder="Mot de passe"
        type="password"
        autoComplete="current-password"
        value={pass}
        onChange={e=>setPass(e.target.value)}
        required
      />
      <button disabled={loading} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-60">
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
      {err && <p className="text-red-600">{err}</p>}
    </form>
  )
}
