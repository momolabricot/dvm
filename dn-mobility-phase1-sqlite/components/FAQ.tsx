'use client'
import { useState } from 'react'
const items = [
  { q:'Proposez-vous un aller-retour ?', a:'Oui, le simulateur calcule les deux trajets et la TVA.' },
  { q:'Convoyeur vs plateau ?', a:'Convoyeur: conduite du véhicule. Plateau: transport sur porte-voiture, adapté aux longues distances ou véhicules non roulants.' },
  { q:'Facturation ?', a:'TVA 20% appliquée, devis PDF envoyé par email.' },
]
export default function FAQ(){
  const [open,setOpen]=useState<number|null>(null)
  return (
    <section className="mt-12">
      <h2 className="h2">Questions fréquentes</h2>
      <div className="mt-3 divide-y border rounded-2xl">
        {items.map((it,i)=>(
          <div key={i}>
            <button className="w-full text-left px-4 py-3 font-medium" onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i}>
              {it.q}
            </button>
            {open===i && <div className="px-4 pb-4 text-ink-700">{it.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
