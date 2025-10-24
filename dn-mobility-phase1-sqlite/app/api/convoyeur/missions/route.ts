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

    // Récupérer le profil convoyeur via userId (unique)
    const profile = await prisma.convoyeurProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    // Si pas de profil: renvoyer une liste vide (UI simple)
    if (!profile) return NextResponse.json([], { status: 200 })

    const missions = await prisma.mission.findMany({
      where: { assignedToId: profile.id },
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

    return NextResponse.json(missions, { status: 200 })
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
