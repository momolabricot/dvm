// app/api/quote/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { QuotePreviewInput } from '@/lib/validators'
import { computeDistanceKm } from '@/lib/distance'
import { pricingForKm } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth' // ⚠️ PAS "@/auth", bien "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = QuotePreviewInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // ➜ corriger les champs null -> undefined pour coller au type DistanceInput
  const sim = parsed.data
  const distanceInput = {
    ...sim,
    retour_depart: sim.retour_depart || undefined,
    retour_arrivee: sim.retour_arrivee || undefined,
  }

  const km = await computeDistanceKm(distanceInput)

  // Récupère la session et applique le priceFactor client si dispo
  let priceFactor = 1.0
  try {
    const session = await auth()
    const email = session?.user?.email
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          role: true,
          clientProfile: { select: { priceFactor: true, isActive: true } },
        },
      })
      if (user?.role === 'CLIENT' && user.clientProfile?.isActive) {
        priceFactor = user.clientProfile.priceFactor ?? 1.0
      }
    }
  } catch {
    // pas bloquant
  }

  const { price_ht, tva, price_ttc } = pricingForKm(km, sim, { priceFactor })

  return NextResponse.json({
    distance_km: km,
    price_ht, tva, price_ttc,
  })
}
