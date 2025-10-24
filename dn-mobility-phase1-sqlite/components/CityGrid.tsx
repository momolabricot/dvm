import Link from 'next/link'
import { cities } from '@/lib/cities'

export default function CityGrid() {
  return (
    <section className="mt-12">
      <h2 className="h2">Interventions par ville</h2>
      <p className="text-ink-700 mt-1">Convoyeur / plateau autour des grandes villes d’Aquitaine.</p>
      <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cities.map(c=>(
          <Link key={c.slug} href={`/zones/${c.slug}`} className="card p-4 hover:shadow-lg transition">
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-ink-500 mt-1">{c.keywords.join(' • ')}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
