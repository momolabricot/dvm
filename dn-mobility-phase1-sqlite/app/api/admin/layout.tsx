// app/admin/layout.tsx
export const metadata = { title: 'Admin — DN Mobility' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Admin • DN Mobility</div>
          <nav className="text-sm space-x-4">
            <a className="hover:underline" href="/admin">Dashboard</a>
            <a className="hover:underline" href="/admin/quotes">Devis</a>
            <a className="hover:underline" href="/admin/partners">Partenaires</a>
            <a className="hover:underline" href="/admin/testimonials">Avis</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
