import AdminNav from '@/components/AdminNav'
import Link from 'next/link'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 shrink-0 border-r bg-white sticky top-0 h-screen overflow-y-auto">
          <AdminNav />
        </aside>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Topbar mobile très simple (affiche juste un lien Admin) */}
          <div className="md:hidden sticky top-0 z-10 border-b bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/admin" className="font-semibold">
                Admin
              </Link>
              {/* Si plus tard tu veux un menu mobile, on pourra ajouter un bouton ici */}
            </div>
          </div>

          <main className="max-w-6xl mx-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
