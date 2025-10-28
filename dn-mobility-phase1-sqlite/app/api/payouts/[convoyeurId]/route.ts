// app/api/admin/payouts/[convoyeurId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function monthRange(year?: number, month1based?: number) {
  const now = new Date()
  const y = year ?? now.getFullYear()
  const m0 = typeof month1based === 'number' ? month1based - 1 : now.getMonth()
  const start = new Date(Date.UTC(y, m0, 1, 0, 0, 0))
  const end = new Date(Date.UTC(y, m0 + 1, 1, 0, 0, 0))
  return { start, end }
}

/**
 * PATCH /api/admin/payouts/:convoyeurId?year=YYYY&month=MM
 * Body optionnel: { mark: "PAID" | "PENDING" } (default: "PAID")
 * Marque toutes les missions COMPLETED du mois comme PAID/PENDING
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { convoyeurId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined
    const { start, end } = monthRange(year, month)

    const body = await req.json().catch(() => ({}))
    const mark: 'PAID' | 'PENDING' = body?.mark === 'PENDING' ? 'PENDING' : 'PAID'

    // Mettre à jour
    const res = await prisma.mission.updateMany({
      where: {
        assignedToId: params.convoyeurId,
        status: 'COMPLETED',
        createdAt: { gte: start, lt: end },
      },
      data: { payoutStatus: mark },
    })

    return NextResponse.json({ updated: res.count, payoutStatus: mark })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
