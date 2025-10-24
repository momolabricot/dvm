// app/api/client/missions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET() {
  try {
    // Doit être connecté en tant que CLIENT
    const me = await requireRole(['CLIENT'])

    // Profil client lié
    const client = await prisma.clientProfile.findUnique({
      where: { userId: me.id },
      select: { id: true },
    })
    if (!client) {
      return NextResponse.json({ missions: [] })
    }

    // Missions de ce client
    const missions = await prisma.mission.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        pickupAddress: true,
        dropoffAddress: true,
        distanceKm: true,
        status: true,
        // pour info: le client peut voir la quote associée
        quote: { select: { number: true } },
        assignedTo: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    const data = missions.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      scheduledAt: m.scheduledAt,
      pickupAddress: m.pickupAddress,
      dropoffAddress: m.dropoffAddress,
      distanceKm: m.distanceKm,
      status: m.status,
      quoteNumber: m.quote?.number ?? null,
      convoyeurName: m.assignedTo?.user?.name ?? m.assignedTo?.user?.email ?? null,
    }))

    return NextResponse.json({ missions: data })
  } catch (e: any) {
    const msg = e?.message || 'Error'
    const code = msg === 'FORBIDDEN' ? 403 : msg === 'UNAUTHORIZED' ? 401 : 500
    return NextResponse.json({ error: msg }, { status: code })
  }
}
