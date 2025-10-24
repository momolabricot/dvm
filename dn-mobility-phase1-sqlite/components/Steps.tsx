const steps = [
  { t:'Demande', d:'Vous indiquez départ, arrivée et option (convoyeur ou plateau).' },
  { t:'Validation', d:'Nous confirmons le devis et planifions la mission.' },
  { t:'Réalisation', d:'Convoyage sécurisé, preuve de prise en charge et livraison.' },
]
export default function Steps(){
  return (
    <section className="mt-10 grid md:grid-cols-3 gap-4">
      {steps.map((s,i)=>(
        <div key={i} className="card p-5">
          <div className="text-brand-700 font-semibold">{String(i+1).padStart(2,'0')}</div>
          <div className="mt-2 font-semibold">{s.t}</div>
          <p className="text-sm text-ink-700 mt-1">{s.d}</p>
        </div>
      ))}
    </section>
  )
}
