// app/api/admin/convoyeurs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')

    const whereUser =
      active === '1'
        ? { role: 'CONVOYEUR' as const, isActive: true }
        : { role: 'CONVOYEUR' as const }

    // On part du profil convoyeur pour avoir ratePerKm etc.
    const rows = await prisma.convoyeurProfile.findMany({
      where: {
        user: whereUser,
      },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        ratePerKm: true,
        iban: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
