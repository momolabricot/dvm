import React from 'react'
export const metadata = { title: 'DN Mobility — Convoyeur à Bordeaux & Aquitaine' }
const cities = ['Bordeaux','Pau','Bayonne','Toulouse','Limoges','Angoulême','Niort','Nantes']
const keywords = [
  'convoyeur Bordeaux','convoyeur plateau Bordeaux','convoyeur Aquitaine',
  'convoi véhicule plateau à Bordeaux','convoi véhicule plateau à Aquitaine',
  'Pau','Bayonne','Toulouse','Limoges','Angoulême','Niort','Nantes','Bordeaux'
]
export default function Home(){
  const jsonLd = { "@context":"https://schema.org","@type":"LocalBusiness",name:"DN Mobility",
    address:{ "@type":"PostalAddress", addressLocality:"Bordeaux", addressCountry:"FR" },
    areaServed:[...cities,'Aquitaine'], url:"https://dnmobility.fr", telephone:"+33 5 00 00 00 00",
    makesOffer:[{ "@type":"Service", name:"Convoyage de véhicule (convoyeur / plateau)"}]
  }
  return (
    <section className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="card">
        <h1 className="text-3xl font-semibold">DN Mobility — Convoyeur & Plateau à Bordeaux et en Aquitaine</h1>
        <p className="mt-3">Convoyage de véhicules (citadine, berline, utilitaire, VL plateau). Intervention: {cities.join(', ')}.</p>
        <a className="btn inline-block mt-4" href="/simulateur">Obtenir un devis</a>
        <p className="mt-2 text-xs text-gray-600">Mots-clés: {keywords.join(' • ')}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-xl font-semibold">Services</h2>
          <ul className="list-disc ml-6 mt-2"><li>Convoyeur (conduite)</li><li>Plateau (remorque)</li></ul>
        </div>
        <div className="card"><h2 className="text-xl font-semibold">Zones</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {cities.map(c=>(<a key={c} href={`#${c.toLowerCase()}`} className="input">{c}</a>))}
            <a href="#aquitaine" className="input">Aquitaine</a>
          </div>
        </div>
      </div>
      <div className="card" id="aquitaine"><h2 className="text-xl font-semibold">Convoyeur en Aquitaine</h2><p className="mt-2">Service de convoyage et plateau en Aquitaine.</p></div>
      {cities.map(c=>(
        <div className="card" id={c.toLowerCase()} key={c}><h3 className="text-lg font-semibold">Convoyeur à {c}</h3><p className="mt-2">Convoyeur et plateau à {c}. Devis rapide.</p></div>
      ))}
    </section>
  )
}
