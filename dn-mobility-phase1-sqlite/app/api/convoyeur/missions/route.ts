// app/api/convoyeur/missions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil convoyeur du user connecté (pas de isActive sur ConvoyeurProfile)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        convoyeurProfile: {
          select: {
            id: true,
            userId: true,
            ratePerKm: true,
          },
        },
      },
    })

    const convoyeurId = user?.convoyeurProfile?.id
    if (!convoyeurId) {
      return NextResponse.json({ missions: [] }) // pas de profil convoyeur → pas de missions
    }

    const missions = await prisma.mission.findMany({
      where: { assignedToId: convoyeurId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            isActive: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        assignedTo: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
            ratePerKm: true,
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        quote: true,
      },
    })

    return NextResponse.json({ missions })
  } catch (e: any) {
    console.error('[GET /api/convoyeur/missions] ', e)
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
