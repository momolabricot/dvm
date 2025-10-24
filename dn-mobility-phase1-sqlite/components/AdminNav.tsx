// components/AdminNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin', label: 'Tableau de bord', emoji: '🏠' },
  { href: '/admin/missions', label: 'Missions', emoji: '📦' },
  { href: '/admin/clients', label: 'Clients & Tarifs', emoji: '👤' },
  { href: '/admin/convoyeurs', label: 'Convoyeurs & Tarifs', emoji: '🚚' },
  { href: '/admin/users', label: 'Utilisateurs', emoji: '👥' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav className="rounded-2xl border bg-white p-3 shadow-sm">
        <ul className="space-y-1">
          {items.map(it => {
            const active = pathname === it.href || pathname?.startsWith(it.href + '/')
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={[
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                    active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span>{it.emoji}</span>
                  {it.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
