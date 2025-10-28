// app/api/quote/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { QuotePreviewInput } from '@/lib/validators'
import { computeDistanceKm } from '@/lib/distance'
import { pricingForKm } from '@/lib/pricing'
import { getClientPricingOverrides } from '@/lib/pricing-user'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = QuotePreviewInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const sim = parsed.data

  // normalise retour_* null -> undefined pour computeDistanceKm
  const distanceInput = {
    ...sim,
    retour_depart: sim.retour_depart || undefined,
    retour_arrivee: sim.retour_arrivee || undefined,
  }

  const km = await computeDistanceKm(distanceInput)

  // overrides (priceFactor du client + pricing admin perKm/base si présent)
  const { priceFactor, perKmOverride, baseOverride } = await getClientPricingOverrides()

  const pricing = pricingForKm(km, sim, { priceFactor, perKmOverride, baseOverride })

  return NextResponse.json({
    distance_km: km,
    price_ht: pricing.price_ht,
    tva: pricing.tva,
    price_ttc: pricing.price_ttc,
  })
}
