// lib/validators.ts
import { z } from 'zod'

// helpers pour coersion depuis FormData/JSON
const zBoolFromForm = z.union([
  z.coerce.boolean(),
  z.enum(['on','1','true','false']).transform(v => v === 'on' || v === '1' || v === 'true')
]).transform(Boolean)

export const QuotePreviewInput = z.object({
  depart: z.string().min(3),
  arrivee: z.string().min(3),
  depart_place_id: z.string().optional().nullable(),
  arrivee_place_id: z.string().optional().nullable(),

  round_trip: z.union([
    zBoolFromForm,
    z.string().optional().transform(v => v === 'on' || v === '1' || v === 'true')
  ]).default(false),

  retour_depart: z.string().optional().nullable(),
  retour_arrivee: z.string().optional().nullable(),
  retour_depart_place_id: z.string().optional().nullable(),
  retour_arrivee_place_id: z.string().optional().nullable(),

  vehicle_type: z.enum(['citadine','berline','utilitaire','vl_plateau']),
  plate: z.string().min(2),
  option: z.enum(['convoyeur','plateau']),
})

export const ContactInput = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().min(6),
  consent: z.union([zBoolFromForm, z.literal('1')]).transform(Boolean).refine(v => v, 'Consentement requis'),
  objet: z.string().optional(),
  message: z.string().optional(),
})

// payload final confirm
export const QuoteConfirmInput = QuotePreviewInput.merge(ContactInput)


export const MissionCreateInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),

  // on accepte soit clientId (ClientProfile.id) soit clientUserId (User.id du client)
  clientId: z.string().optional(),
  clientUserId: z.string().optional(),

  scheduledAt: z.string().datetime().optional(), // ISO
  pickupAddress: z.string().min(2),
  dropoffAddress: z.string().min(2),
  distanceKm: z.number().optional(),
  clientPriceTTC: z.number().optional(),

  // idem pour convoyeur: soit assignedToId (ConvoyeurProfile.id) soit assignedToUserId (User.id)
  assignedToId: z.string().optional(),
  assignedToUserId: z.string().optional(),
})

export const MissionUpdateInput = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),

  clientId: z.string().optional(),
  clientUserId: z.string().optional(),

  scheduledAt: z.string().datetime().nullable().optional(),
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  distanceKm: z.number().nullable().optional(),
  clientPriceTTC: z.number().nullable().optional(),

  assignedToId: z.string().nullable().optional(),
  assignedToUserId: z.string().nullable().optional(),

  status: z.enum(['DRAFT','PLANNED','ASSIGNED','IN_PROGRESS','DONE','CANCELED']).optional(),
})

export const MissionStatusUpdateByConvoyeur = z.object({
  status: z.enum(['IN_PROGRESS','DONE','CANCELED']),
})