export default function Footer(){
  return (<footer className="mt-12 border-t"><div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600">
    <div>© {new Date().getFullYear()} DN Mobility — SIRET: {process.env.SIRET ?? 'à compléter'}</div>
    <div>Zones: Bordeaux • Pau • Bayonne • Toulouse • Limoges • Angoulême • Niort • Nantes • Aquitaine</div>
  </div></footer>)
}
