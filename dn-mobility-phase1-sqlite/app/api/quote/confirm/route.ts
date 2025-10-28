// app/api/quote/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { QuoteConfirmInput } from '@/lib/validators'
import { computeDistanceKm } from '@/lib/distance'
import { pricingForKm } from '@/lib/pricing'
import { saveQuoteAndEmail } from '@/lib/quote-service'
import { getClientPricingOverrides } from '@/lib/pricing-user'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = QuoteConfirmInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const sim = {
      depart: parsed.data.depart,
      arrivee: parsed.data.arrivee,
      round_trip: !!parsed.data.round_trip,
      retour_depart: parsed.data.retour_depart || null,
      retour_arrivee: parsed.data.retour_arrivee || null,
      vehicle_type: parsed.data.vehicle_type,
      plate: parsed.data.plate,
      option: parsed.data.option,
      depart_label: parsed.data.depart,
      arrivee_label: parsed.data.arrivee,
      retour_depart_label: parsed.data.retour_depart || undefined,
      retour_arrivee_label: parsed.data.retour_arrivee || undefined,
    }

    const contact = {
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      consent: parsed.data.consent,
      objet: parsed.data.objet,
      message: parsed.data.message,
    }

    const km = await computeDistanceKm(sim)

    const { priceFactor, perKmOverride, baseOverride } = await getClientPricingOverrides()
    const pricing = pricingForKm(km, sim, { priceFactor, perKmOverride, baseOverride })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
    const quote_no = await saveQuoteAndEmail(
      sim,
      contact,
      km,
      { price_ht: pricing.price_ht, tva: pricing.tva, price_ttc: pricing.price_ttc },
      baseUrl
    )

    return NextResponse.json({ ok: true, quote_no })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
