export default function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-ink-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>© {new Date().getFullYear()} DN Mobility — SIRET: 12345678900011</div>
          <div className="flex gap-4">
            <a href="/mentions-legales" className="text-ink-500 hover:text-ink-700">Mentions légales</a>
            <a href="/donnees-personnelles" className="text-ink-500 hover:text-ink-700">Conditions d’utilisation des données</a>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
