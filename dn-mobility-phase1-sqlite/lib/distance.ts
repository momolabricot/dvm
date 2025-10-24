// lib/distance.ts
type DistanceInput = {
  // champs texte saisis par l’utilisateur
  depart?: string
  arrivee?: string
  retour_depart?: string
  retour_arrivee?: string

  // place_id injectés par l’Autocomplete (si la clé front est présente)
  depart_place_id?: string
  arrivee_place_id?: string
  retour_depart_place_id?: string
  retour_arrivee_place_id?: string

  // checkbox "aller-retour" peut arriver comme boolean, "on", "1", "true", etc.
  round_trip?: boolean | string
}

const API_KEY = process.env.GOOGLE_MAPS_API_KEY

function s(v: any) {
  return (v ?? '').toString().trim()
}
function toBool(v: any) {
  if (typeof v === 'boolean') return v
  const t = s(v).toLowerCase()
  return t === 'on' || t === '1' || t === 'true' || t === 'yes'
}
function pickLoc(placeId?: string, label?: string) {
  const p = s(placeId)
  if (p) return `place_id:${p}`
  const l = s(label)
  if (l) return l
  return null
}

async function distanceOneLegKm(origin: string, destination: string) {
  if (!API_KEY) throw new Error('GOOGLE_MAPS_API_KEY manquante côté serveur')
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&mode=driving&origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Distance Matrix HTTP ${res.status}`)
  const json = await res.json()

  if (json.status !== 'OK') throw new Error(`Distance Matrix: ${json.status}`)
  const elem = json.rows?.[0]?.elements?.[0]
  if (!elem || elem.status !== 'OK') {
    if (elem?.status === 'ZERO_RESULTS') return 0
    throw new Error(`Aucun itinéraire (${elem?.status || 'inconnu'})`)
  }
  return (elem.distance.value as number) / 1000 // mètres → km
}

export async function computeDistanceKm(input: DistanceInput) {
  const A = pickLoc(input.depart_place_id, input.depart)
  const B = pickLoc(input.arrivee_place_id, input.arrivee)
  if (!A || !B) throw new Error('Adresses de départ/arrivée manquantes')

  let km = await distanceOneLegKm(A, B)

  if (toBool(input.round_trip)) {
    // si les champs retour ne sont pas fournis, on prend l’inverse B→A
    const R1 = pickLoc(input.retour_depart_place_id, input.retour_depart) ?? B
    const R2 = pickLoc(input.retour_arrivee_place_id, input.retour_arrivee) ?? A
    km += await distanceOneLegKm(R1, R2)
  }

  return Math.round(km * 100) / 100
}
