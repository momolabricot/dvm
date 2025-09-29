'use client'
import { useState } from 'react'
type QuotePreview = { distance_km:number, price_ht:number, tva:number, price_ttc:number }
export default function Simulateur(){
  const [preview, setPreview] = useState<QuotePreview | null>(null)
  const [roundTrip, setRoundTrip] = useState(false)
  const [step2, setStep2] = useState(false)

  async function onPreview(e:any){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch('/api/quote/preview', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(res.ok){ setPreview(await res.json()); setStep2(true) }
  }

  async function onConfirm(e:any){
    e.preventDefault()
    const info = Object.fromEntries(new FormData(e.currentTarget).entries())
    const payload = {...info, ...Object.fromEntries(new FormData(document.getElementById('f1') as HTMLFormElement).entries())}
    const res = await fetch('/api/quote/confirm', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(res.ok){ const json = await res.json(); window.location.href = json.pdf_url }
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold">Simulateur de devis</h1>
        <p className="text-sm text-gray-600">Pour le MVP, entrez les coordonnées GPS (lat/lon). Un géocodeur pourra être ajouté ensuite.</p>
        <form id="f1" onSubmit={onPreview} className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Adresse départ (texte)</label><input className="input" name="depart.texte"/></div>
            <div><label className="label">Adresse arrivée (texte)</label><input className="input" name="arrivee.texte"/></div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="label">Lat départ</label><input required className="input" name="depart.lat" type="number" step="any"/></div>
            <div><label className="label">Lon départ</label><input required className="input" name="depart.lon" type="number" step="any"/></div>
            <div><label className="label">Lat arrivée</label><input required className="input" name="arrivee.lat" type="number" step="any"/></div>
            <div><label className="label">Lon arrivée</label><input required className="input" name="arrivee.lon" type="number" step="any"/></div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="rt" onChange={e=>setRoundTrip(e.target.checked)} />
            <label htmlFor="rt">Aller-retour</label>
          </div>
          {roundTrip && (
            <div className="grid md:grid-cols-4 gap-4">
              <div><label className="label">Lat retour (départ)</label><input required={roundTrip} className="input" name="retour_depart.lat" type="number" step="any"/></div>
              <div><label className="label">Lon retour (départ)</label><input required={roundTrip} className="input" name="retour_depart.lon" type="number" step="any"/></div>
              <div><label className="label">Lat retour (arrivée)</label><input required={roundTrip} className="input" name="retour_arrivee.lat" type="number" step="any"/></div>
              <div><label className="label">Lon retour (arrivée)</label><input required={roundTrip} className="input" name="retour_arrivee.lon" type="number" step="any"/></div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Heure départ</label><input className="input" name="time_depart" placeholder="ex. 08:30"/></div>
            <div><label className="label">Heure arrivée</label><input className="input" name="time_arrivee" placeholder="ex. 12:30"/></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Véhicule</label><select className="input" name="vehicle_type" required>
              <option value="citadine">Citadine</option>
              <option value="berline">Berline</option>
              <option value="utilitaire">Utilitaire</option>
              <option value="vl_plateau">VL plateau</option>
            </select></div>
            <div><label className="label">Immatriculation</label><input className="input" name="plate" required/></div>
          </div>
          <fieldset className="grid grid-cols-2 gap-2">
            <label className="input flex items-center gap-2"><input type="radio" name="option" value="convoyeur" defaultChecked/> Convoyeur</label>
            <label className="input flex items-center gap-2"><input type="radio" name="option" value="plateau"/> Plateau</label>
          </fieldset>
          <button className="btn">Obtenir un devis</button>
        </form>
        {preview && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Aperçu du prix</h2>
            <p>Distance: {preview.distance_km.toFixed(2)} km</p>
            <div className="grid md:grid-cols-3 gap-3 mt-2">
              <div className="card"><div className="text-sm">HT</div><div className="text-2xl font-semibold">{preview.price_ht.toFixed(2)} €</div></div>
              <div className="card"><div className="text-sm">TVA (20%)</div><div className="text-2xl font-semibold">{preview.tva.toFixed(2)} €</div></div>
              <div className="card"><div className="text-sm">TTC</div><div className="text-2xl font-semibold">{preview.price_ttc.toFixed(2)} €</div></div>
            </div>
          </div>
        )}
      </div>
      {step2 && (
        <div className="card">
          <h2 className="text-xl font-semibold">Recevoir le devis PDF</h2>
          <form onSubmit={onConfirm} className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label">Prénom</label><input className="input" name="prenom" required/></div>
              <div><label className="label">Nom</label><input className="input" name="nom" required/></div>
              <div><label className="label">Email</label><input className="input" type="email" name="email" required/></div>
              <div><label className="label">Téléphone</label><input className="input" name="telephone" required/></div>
            </div>
            <button className="btn">Recevoir mon devis PDF</button>
          </form>
        </div>
      )}
    </section>
  )
}
