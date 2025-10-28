'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/missions', label: 'Missions' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/convoyeurs', label: 'Convoyeurs' },
  { href: '/admin/pricing', label: 'Tarifs' },
  { href: '/admin/users', label: 'Utilisateurs' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="p-4">
      <div className="px-3 pb-4">
        <Link
          href="/admin"
          className="block text-lg font-semibold text-violet-700 hover:text-violet-800"
        >
          DN Mobility Admin
        </Link>
        <p className="text-xs text-gray-500">Gestion interne</p>
      </div>

      <ul className="space-y-1">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== '/admin' && pathname?.startsWith(it.href))

          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-violet-100 text-violet-800 font-medium'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                )}
              >
                {it.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
