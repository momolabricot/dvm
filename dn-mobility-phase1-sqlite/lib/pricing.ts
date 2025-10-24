// lib/pricing.ts

export type SimInput = {
  vehicle_type: 'citadine' | 'berline' | 'utilitaire' | 'vl_plateau'
  option: 'convoyeur' | 'plateau'
  round_trip: boolean
}

type BasePricing = {
  base: number
  perKm: number
}

const BASES: Record<SimInput['vehicle_type'], BasePricing> = {
  citadine:   { base: 25, perKm: 0.8 },
  berline:    { base: 30, perKm: 0.95 },
  utilitaire: { base: 35, perKm: 1.1 },
  vl_plateau: { base: 45, perKm: 1.5 },
}

export function pricingForKm(km: number, sim: SimInput, clientFactor = 1.0) {
  const p = BASES[sim.vehicle_type] ?? BASES.citadine
  let ht = p.base + p.perKm * km

  // option plateau = majoration simple (exemple)
  if (sim.option === 'plateau') ht *= 1.25

  // aller-retour : on peut décider d'un coeff (exemple = *1.8)
  if (sim.round_trip) ht *= 1.8

  ht = ht * clientFactor

  const tva = ht * 0.2
  const ttc = ht + tva
  return {
    price_ht: round2(ht),
    tva: round2(tva),
    price_ttc: round2(ttc),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
