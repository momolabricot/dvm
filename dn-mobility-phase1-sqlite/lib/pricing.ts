export type Grid = {
  vehicle_types: Record<'citadine'|'berline'|'utilitaire'|'vl_plateau', {per_km:number}>;
  option_multiplier: Record<'convoyeur'|'plateau', number>;
  rounding: {mode: 'ceil_to_cent'};
}
export const defaultGrid: Grid = {
  vehicle_types: { citadine:{per_km:0.70}, berline:{per_km:0.85}, utilitaire:{per_km:1.00}, vl_plateau:{per_km:1.20} },
  option_multiplier: {convoyeur:1.0, plateau:1.25},
  rounding: {mode:'ceil_to_cent'}
}
export function ceilToCent(n:number){ return Math.ceil(n*100)/100 }
export function computePrice(grid:Grid, km:number, v:keyof Grid['vehicle_types'], opt:keyof Grid['option_multiplier']){
  const base = grid.vehicle_types[v].per_km
  const k = grid.option_multiplier[opt]
  const price_ht = ceilToCent(km * base * k)
  const tva = ceilToCent(price_ht * 0.20)
  const price_ttc = +(price_ht + tva).toFixed(2)
  return {price_ht, tva, price_ttc, base_rate: base, option_k: k}
}
