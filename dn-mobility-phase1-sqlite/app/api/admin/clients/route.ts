// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')

    const where =
      active === '1'
        ? { user: { role: 'CLIENT' as const, isActive: true } }
        : { user: { role: 'CLIENT' as const } }

    const raw = await prisma.clientProfile.findMany({
      where,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        companyName: true,
        priceFactor: true,
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

    // Normalise: companyName => "Particulier" si null/vidé
    const rows = raw.map(r => ({
      ...r,
      companyName: r.companyName && r.companyName.trim() !== '' ? r.companyName : 'Particulier',
    }))

    return NextResponse.json({ rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
