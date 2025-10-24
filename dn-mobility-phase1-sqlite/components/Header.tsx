'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

type Role = 'ADMIN' | 'ADMIN_IT' | 'CLIENT'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()

  const isAuthed = status === 'authenticated'
  const role = (session?.user as any)?.role as Role | undefined
  const name = session?.user?.name || session?.user?.email || 'Mon compte'

  // Lien contextuel (admin / dashboard)
  const primaryLink =
    role === 'ADMIN' || role === 'ADMIN_IT'
      ? { href: '/admin', label: 'Admin' }
      : isAuthed
      ? { href: '/dashboard', label: 'Tableau de bord' }
      : null

  const AuthButtons = () => {
    if (status === 'loading') return <span className="text-sm text-gray-500">…</span>

    if (!isAuthed) {
      return (
        <button
          onClick={() => {
            const cb = typeof window !== 'undefined' ? window.location.pathname : '/'
            signIn(undefined, { callbackUrl: cb })
          }}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Se connecter
        </button>
      )
    }

    return (
      <div className="flex items-center gap-3">
        {primaryLink && (
          <Link href={primaryLink.href} className="text-sm hover:underline">
            {primaryLink.label}
          </Link>
        )}
        <span className="hidden sm:inline text-sm text-gray-600">
          {name}
        </span>
        <button
          onClick={() => {
            const cb = typeof window !== 'undefined' ? window.location.pathname : '/'
            signOut({ callbackUrl: cb })
          }}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  return (
    <header className="bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">DN Mobility</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/a-propos">À propos</Link>
          <Link href="/simulateur">Simulateur</Link>
          <Link href="/contact">Contact</Link>
          <div className="ml-4"><AuthButtons /></div>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm">
            <Link href="/a-propos" onClick={() => setOpen(false)}>À propos</Link>
            <Link href="/simulateur" onClick={() => setOpen(false)}>Simulateur</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            {primaryLink && (
              <Link href={primaryLink.href} onClick={() => setOpen(false)}>
                {primaryLink.label}
              </Link>
            )}
            {/* Boutons Auth en mobile */}
            <div className="pt-2">
              <AuthButtons />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
