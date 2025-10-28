// lib/pricing-user.ts
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export type ClientPricingOverrides = {
  priceFactor: number
  perKmOverride?: number
  baseOverride?: number
  source: string
}

/**
 * Récupère le priceFactor (ClientProfile) et le pricing admin (ClientPricing actif).
 * IMPORTANT : sur ClientProfile, seuls id / isActive / priceFactor existent.
 */
export async function getClientPricingOverrides(): Promise<ClientPricingOverrides> {
  let priceFactor = 1.0
  let perKmOverride: number | undefined
  let baseOverride: number | undefined
  let source: string[] = []

  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) {
      return { priceFactor, perKmOverride, baseOverride, source: 'no-session' }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        clientProfile: {
          select: {
            id: true,
            isActive: true,
            priceFactor: true,
          },
        },
      },
    })

    const profile = user?.clientProfile
    if (!profile?.isActive) {
      return { priceFactor, perKmOverride, baseOverride, source: 'profile-inactive-or-missing' }
    }

    if (typeof profile.priceFactor === 'number') {
      priceFactor = profile.priceFactor
      source.push('ClientProfile.priceFactor')
    }

    // ClientPricing actif le plus récent
    if (profile.id) {
      try {
        const cp = await prisma.clientPricing.findFirst({
          where: { clientId: profile.id, isActive: true } as any,
          orderBy: { updatedAt: 'desc' } as any,
          select: { perKm: true as any, base: true as any },
        } as any)

        if (cp) {
          if (isPosNumber(cp.perKm)) {
            perKmOverride = cp.perKm
            source.push('ClientPricing.perKm')
          }
          if (isPosNumber(cp.base)) {
            baseOverride = cp.base
            source.push('ClientPricing.base')
          }
        }
      } catch {
      }
    }

    return {
      priceFactor,
      perKmOverride,
      baseOverride,
      source: source.length ? source.join('+') : 'defaults',
    }
  } catch {
    return { priceFactor, perKmOverride, baseOverride, source: 'error' }
  }
}

function isPosNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= 0
}
