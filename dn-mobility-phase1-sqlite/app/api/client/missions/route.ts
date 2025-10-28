// app/api/client/missions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // On récupère le profil client actif depuis l'email utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: { clientProfile: { select: { id: true, isActive: true } } },
    })

    const clientProfileId = user?.clientProfile?.id
    const isActive = user?.clientProfile?.isActive
    if (!clientProfileId || isActive === false) {
      // On renvoie une liste vide pour éviter un 404 côté UI
      return NextResponse.json({ missions: [], info: 'Aucun profil client actif' }, { status: 200 })
    }

    // ⚠️ NE PAS inclure "convoyeur" (n’existe pas). Si besoin du convoyeur,
    // c’est "assignedTo" dans ton schéma.
    const missions = await prisma.mission.findMany({
      where: { clientId: clientProfileId },
      orderBy: { createdAt: 'desc' },
      // Ajoute seulement ce qui existe vraiment dans ton schéma :
      // include: { quote: true, assignedTo: true, createdBy: true },
    })

    return NextResponse.json({ missions })
  } catch (e: any) {
    console.error('[GET /api/client/missions] ', e)
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
