import Link from 'next/link'

export default function Hero() {
  return (
    <section className="text-center py-8 md:py-12">
      <h1 className="h1">Convoyage & transport <span className="text-brand-700">plateau</span> en Aquitaine</h1>
      <p className="lead mt-3">Convoyeur de véhicules à Bordeaux, Pau, Bayonne, Toulouse, Limoges, Angoulême, Niort, Nantes.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/simulateur" className="btn">Obtenir un devis</Link>
        <Link href="/contact" className="inline-flex items-center px-4 py-2 rounded-xl border">Contact</Link>
      </div>
    </section>
  )
}
