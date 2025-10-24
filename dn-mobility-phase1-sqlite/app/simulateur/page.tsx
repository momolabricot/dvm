// app/simulateur/page.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

type PreviewResult = {
  distance_km: number
  price_ht: number
  tva: number
  price_ttc: number
}

export default function SimulateurPage() {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [quoteData, setQuoteData] = useState<Record<string, any> | null>(null)

  // refs vers les inputs pour l’autocomplete
  const refDepart = useRef<HTMLInputElement>(null)
  const refArrivee = useRef<HTMLInputElement>(null)
  const refRetDep = useRef<HTMLInputElement>(null)
  const refRetArr = useRef<HTMLInputElement>(null)

  // Charge Google Places Autocomplete si la clé publique est présente
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) return // le formulaire fonctionne sans autocomplete

    const loadMaps = () =>
      new Promise<void>((resolve, reject) => {
        const w = window as any
        if (w.google?.maps?.places) return resolve()

        const existing = document.getElementById('gmaps-sdk')
        if (existing) {
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', reject)
          return
        }

        const s = document.createElement('script')
        s.id = 'gmaps-sdk'
        s.async = true
        s.defer = true
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          key
        )}&libraries=places&language=fr&region=FR`
        s.onload = () => resolve()
        s.onerror = reject
        document.head.appendChild(s)
      })

    loadMaps()
      .then(() => {
        const w = window as any
        const g = w.google as any
        if (!g?.maps?.places) return

        const attach = (el: HTMLInputElement | null, hiddenId: string) => {
          if (!el) return
          const ac = new g.maps.places.Autocomplete(el, {
            fields: ['place_id', 'formatted_address'],
            componentRestrictions: { country: ['fr'] },
          })
          ac.addListener('place_changed', () => {
            const p = ac.getPlace()
            const hid = document.getElementById(hiddenId) as HTMLInputElement | null
            if (hid) hid.value = p?.place_id || ''
            if (p?.formatted_address) el.value = p.formatted_address
          })
        }

        attach(refDepart.current, 'depart_place_id')
        attach(refArrivee.current, 'arrivee_place_id')
        attach(refRetDep.current, 'retour_depart_place_id')
        attach(refRetArr.current, 'retour_arrivee_place_id')
      })
      .catch((e) => {
        console.warn('Google Maps script load failed:', e)
      })
  }, [])

  async function onPreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true); setErr(null); setOk(null); setPreview(null)

    try {
      const fd = new FormData(form)
      const payload = Object.fromEntries(fd.entries())
      setQuoteData(payload)

      const res = await fetch('/api/quote/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Erreur serveur')
      setPreview(j as PreviewResult)
    } catch (e: any) {
      setErr(e?.message || 'Impossible de calculer le devis.')
    } finally {
      setLoading(false)
    }
  }

  async function onConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true); setErr(null); setOk(null)

    try {
      if (!quoteData) throw new Error('Données de simulation manquantes.')
      const fd = new FormData(form)
      const contact = Object.fromEntries(fd.entries())

      const res = await fetch('/api/quote/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quoteData, ...contact }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Erreur serveur')
      setOk(`Devis #${j?.quote_no || ''} envoyé par email.`)
      form.reset()
    } catch (e: any) {
      setErr(e?.message || 'Impossible de générer le PDF de devis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Simulateur de devis</h1>

      {/* Formulaire de simulation */}
      <form onSubmit={onPreview} className="space-y-4 border rounded-lg p-5 shadow-sm bg-white">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Adresse de départ *</label>
            <input ref={refDepart} name="depart" required className="mt-1 w-full rounded-md border px-3 py-2" />
            <input id="depart_place_id" name="depart_place_id" type="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium">Adresse d’arrivée *</label>
            <input ref={refArrivee} name="arrivee" required className="mt-1 w-full rounded-md border px-3 py-2" />
            <input id="arrivee_place_id" name="arrivee_place_id" type="hidden" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="round_trip" name="round_trip" type="checkbox" className="mt-1" />
          <label htmlFor="round_trip">Aller-retour</label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Retour — départ</label>
            <input ref={refRetDep} name="retour_depart" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="(si aller-retour)" />
            <input id="retour_depart_place_id" name="retour_depart_place_id" type="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium">Retour — arrivée</label>
            <input ref={refRetArr} name="retour_arrivee" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="(si aller-retour)" />
            <input id="retour_arrivee_place_id" name="retour_arrivee_place_id" type="hidden" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Type de véhicule *</label>
            <select name="vehicle_type" required className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="citadine">
              <option value="citadine">Citadine</option>
              <option value="berline">Berline</option>
              <option value="utilitaire">Utilitaire</option>
              <option value="vl_plateau">VL Plateau</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Immatriculation *</label>
            <input name="plate" required className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Option *</label>
            <select name="option" required className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="convoyeur">
              <option value="convoyeur">Convoyeur</option>
              <option value="plateau">Plateau</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Calcul…' : 'Obtenir un devis'}
        </button>
      </form>

      {/* Résultat + confirmation */}
      {preview && (
        <section className="mt-6 border rounded-lg p-5 shadow-sm bg-white">
          <h2 className="text-xl font-semibold">Résultat</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>Distance: <strong>{preview.distance_km.toFixed(1)} km</strong></div>
            <div>Prix HT: <strong>{preview.price_ht.toFixed(2)} €</strong></div>
            <div>TVA (20%): <strong>{preview.tva.toFixed(2)} €</strong></div>
            <div>Total TTC: <strong>{preview.price_ttc.toFixed(2)} €</strong></div>
          </div>

          <h3 className="text-lg font-semibold mt-6">Vos coordonnées</h3>
          <form onSubmit={onConfirm} className="space-y-4 mt-3" noValidate>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Prénom *</label>
                <input name="prenom" required className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Nom *</label>
                <input name="nom" required className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Email *</label>
                <input type="email" name="email" required className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Téléphone *</label>
                <input type="tel" name="telephone" required className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input id="q-consent" name="consent" type="checkbox" value="1" required className="mt-1" />
              <label htmlFor="q-consent" className="text-sm">
                J’accepte les <a className="underline" href="/donnees-personnelles" target="_blank" rel="noopener">Conditions d’utilisation des données</a>
                {' '}et j’ai pris connaissance des{' '}
                <a className="underline" href="/mentions-legales" target="_blank" rel="noopener">Mentions légales</a>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn">
              {loading ? 'Génération…' : 'Confirmer et recevoir le devis PDF'}
            </button>
          </form>
        </section>
      )}

      {err && <p className="text-red-700 mt-4">{err}</p>}
      {ok && <p className="text-green-700 mt-4">{ok}</p>}
    </main>
  )
}
