// app/api/convoyeur/missions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, getSessionUser } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await requireRole(['CONVOYEUR'])

    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filtre robuste par relation: missions dont le profil assigné appartient au user courant
    const missions = await prisma.mission.findMany({
      where: { assignedTo: { userId: user.id } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        pickupAddress: true,
        dropoffAddress: true,
        scheduledAt: true,
        status: true,
      },
    })

    return NextResponse.json({ missions }, { status: 200 })
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Server error', detail: String(e) }, { status: 500 })
  }
}
