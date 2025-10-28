// app/api/convoyeur/missions/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { convoyeurProfile: { select: { id: true } } },
    })
    const convoyeurProfileId = user?.convoyeurProfile?.id
    if (!convoyeurProfileId) {
      return NextResponse.json({ error: 'Profil convoyeur introuvable' }, { status: 404 })
    }

    const mission = await prisma.mission.findFirst({
      where: { id: params.id, assignedToId: convoyeurProfileId },
      // include: { assignedTo: true, quote: true, createdBy: true }, // si nécessaire
    })
    if (!mission) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
    }

    return NextResponse.json({ mission })
  } catch (e: any) {
    console.error('[GET /api/convoyeur/missions/[id]] ', e)
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
