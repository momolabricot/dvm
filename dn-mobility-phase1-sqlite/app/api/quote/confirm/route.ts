// app/api/quote/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { QuoteConfirmInput } from '@/lib/validators'
import { computeDistanceKm } from '@/lib/distance'
import { pricingForKm } from '@/lib/pricing'
import { saveQuoteAndEmail } from '@/lib/quote-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { applyUserMultiplier } from '@/lib/pricing-user'


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
      depart_label: parsed.data.depart, // si tu veux afficher le libellé user
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
    const pricing = pricingForKm(km, sim)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
    const quote_no = await saveQuoteAndEmail(sim, contact, km, {
      price_ht: pricing.price_ht,
      tva: pricing.tva,
      price_ttc: pricing.price_ttc,
    }, baseUrl)

    const session = await getServerSession(authOptions)
const userMult = Number((session?.user as any)?.priceMultiplier ?? 1)
// pricing déjà calculé = { price_ht, tva, price_ttc }
const price_ttc_adj = applyUserMultiplier(pricing.price_ttc, userMult)
const delta = price_ttc_adj - pricing.price_ttc
pricing.price_ttc = price_ttc_adj
pricing.price_ht = pricing.price_ht + delta / 1.2 // si TVA 20%
pricing.tva = pricing.price_ttc - pricing.price_ht

    return NextResponse.json({ ok: true, quote_no })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
