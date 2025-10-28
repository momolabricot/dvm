// app/api/admin/payouts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function parseYm(ym: string | null | undefined): Date | null {
  if (!ym) return null
  const m = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!m) return null
  const [, y, mo] = m
  const year = Number(y)
  const month0 = Number(mo) - 1
  if (month0 < 0 || month0 > 11) return null
  // 1er jour du mois en UTC
  return new Date(Date.UTC(year, month0, 1, 0, 0, 0))
}
function endOfMonthUTC(d: Date): Date {
  // dernier jour du mois à 23:59:59 en UTC
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59))
}

export async function GET(req: NextRequest) {
  // Auth ADMIN / ADMIN_IT
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'ADMIN' && role !== 'ADMIN_IT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const fromYm = searchParams.get('from') // ex: 2025-10
  const toYm   = searchParams.get('to')   // ex: 2025-10
  const convoyeurId = searchParams.get('convoyeurId') || undefined
  const all = searchParams.get('all') === '1' // debug: ignore la fenêtre

  // WHERE de base : missions assignées uniquement
  const whereBase: any = {
    assignedToId: { not: null },
  }

  // Fenêtre temporelle (si demandée et pas all=1)
  if (!all) {
    // si un seul des deux est fourni, on applique ce même mois
    const start = parseYm(fromYm) || parseYm(toYm)
    const endStart = parseYm(toYm) || parseYm(fromYm)
    if (start && endStart) {
      const end = endOfMonthUTC(endStart)
      // scheduledAt dans [start, end] OU (scheduledAt null ET createdAt dans [start, end])
      whereBase.OR = [
        { scheduledAt: { gte: start, lte: end } },
        { AND: [{ scheduledAt: null }, { createdAt: { gte: start, lte: end } }] },
      ]
    }
  }

  if (convoyeurId) {
    whereBase.assignedToId = convoyeurId
  }

  // Sélection
  const missions = await prisma.mission.findMany({
    where: whereBase,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      scheduledAt: true,
      assignedToId: true,
      distanceKm: true,
      payoutAmount: true,
      clientPriceTTC: true,
      status: true,
      assignedTo: {
        select: {
          id: true,
          ratePerKm: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  type Row = {
    convoyeurId: string
    convoyeurName: string | null
    convoyeurEmail: string | null
    ratePerKm: number | null
    totalKm: number
    totalAmount: number
    missions: Array<{
      id: string
      date: string
      km: number
      ratePerKm: number | null
      amount: number
      clientPriceTTC: number | null
      status: string
    }>
  }

  const byConv: Record<string, Row> = {}

  for (const m of missions) {
    const conv = m.assignedTo
    const convId = conv?.id ?? 'unknown'
    const rate = typeof conv?.ratePerKm === 'number' ? Math.max(conv.ratePerKm, 0) : null
    const km = typeof m.distanceKm === 'number' ? Math.max(m.distanceKm, 0) : 0
    const computed = rate != null && km > 0 ? +(km * rate).toFixed(2) : 0

    if (!byConv[convId]) {
      byConv[convId] = {
        convoyeurId: convId,
        convoyeurName: conv?.user?.name ?? null,
        convoyeurEmail: conv?.user?.email ?? null,
        ratePerKm: rate,
        totalKm: 0,
        totalAmount: 0,
        missions: [],
      }
    }

    byConv[convId].totalKm += km
    byConv[convId].totalAmount += computed
    byConv[convId].missions.push({
      id: m.id,
      date: (m.scheduledAt ?? m.createdAt).toISOString(),
      km,
      ratePerKm: rate,
      amount: computed,
      clientPriceTTC: m.clientPriceTTC ?? null,
      status: m.status,
    })
  }

  const rows = Object.values(byConv).sort((a, b) =>
    (a.convoyeurName || '').localeCompare(b.convoyeurName || '')
  )

  const totalsKm = +rows.reduce((s, r) => s + r.totalKm, 0).toFixed(2)
  const totalsAmount = +rows.reduce((s, r) => s + r.totalAmount, 0).toFixed(2)

  return NextResponse.json({
    window: { from: fromYm, to: toYm, all },
    debug: { countMissions: missions.length },
    count: rows.length,
    rows,
    totals: { km: totalsKm, amount: totalsAmount },
  })
}
