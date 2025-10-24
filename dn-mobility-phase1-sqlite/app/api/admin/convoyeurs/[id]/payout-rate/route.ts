// app/api/admin/convoyeurs/[id]/payout-rate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

/** PATCH: mettre à jour le ratePerKm du convoyeur */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  const body = await req.json().catch(() => ({}))
  const { ratePerKm } = body || {}
  if (typeof ratePerKm !== 'number' || ratePerKm < 0) {
    return NextResponse.json({ error: 'ratePerKm invalide' }, { status: 400 })
  }

  try {
    const updated = await prisma.convoyeurProfile.update({
      where: { id },
      data: { ratePerKm },
      select: { id: true, ratePerKm: true },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: 'Update failed', detail: String(e) }, { status: 500 })
  }
}
