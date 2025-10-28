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

/**
 * Calcule le prix à partir d'une distance et des paramètres de simulation.
 * On peut passer des overrides admin (base, perKm) et un priceFactor client.
 */
export function pricingForKm(
  km: number,
  sim: SimInput,
  opts?: { priceFactor?: number; perKmOverride?: number; baseOverride?: number }
) {
  const factor = typeof opts?.priceFactor === 'number' ? opts.priceFactor : 1.0

  const def = BASES[sim.vehicle_type] ?? BASES.citadine
  const perKm = typeof opts?.perKmOverride === 'number' ? opts.perKmOverride : def.perKm
  const base  = typeof opts?.baseOverride === 'number'  ? opts.baseOverride  : def.base

  let ht = base + perKm * km

  // option plateau : majoration simple (ex.)
  if (sim.option === 'plateau') ht *= 1.25

  // aller-retour : coeff (ex. 1.8)
  if (sim.round_trip) ht *= 1.8

  ht = ht * factor

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
