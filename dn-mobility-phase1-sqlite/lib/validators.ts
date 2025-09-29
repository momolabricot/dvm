import { z } from 'zod'
export const Address = z.object({ texte: z.string().optional(), lat: z.coerce.number(), lon: z.coerce.number() })
export const QuoteInput = z.object({
  depart: Address, arrivee: Address,
  round_trip: z.coerce.boolean().optional(),
  retour_depart: Address.optional(), retour_arrivee: Address.optional(),
  time_depart: z.string().optional(), time_arrivee: z.string().optional(),
  vehicle_type: z.enum(['citadine','berline','utilitaire','vl_plateau']),
  plate: z.string().min(3),
  option: z.enum(['convoyeur','plateau'])
}).refine(d=>!d.round_trip || (d.retour_depart && d.retour_arrivee), {message:'Retour incomplet'})
export const QuoteConfirmInput = QuoteInput.extend({
  prenom: z.string().min(2), nom: z.string().min(2), email: z.string().email(), telephone: z.string().min(6)
})
