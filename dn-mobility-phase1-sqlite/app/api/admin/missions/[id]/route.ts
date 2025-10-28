// app/api/admin/missions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type MissionStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE'

// FR ↔︎ enum (⚠️ plus de "Annulée" ni "Planifiée")
const FR_TO_ENUM: Record<string, MissionStatus> = {
  'En attente': 'PENDING',
  'Assignée': 'ASSIGNED',
  'En cours': 'IN_PROGRESS',
  'Terminée': 'DONE',
} as const

const ENUM_SET = new Set<MissionStatus>(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DONE'])

function normalizeStatus(input: unknown): MissionStatus | null {
  if (!input || typeof input !== 'string') return null
  const raw = input.trim()

  // déjà un enum ?
  if (ENUM_SET.has(raw as MissionStatus)) return raw as MissionStatus

  // libellé FR exact
  if (FR_TO_ENUM[raw as keyof typeof FR_TO_ENUM]) {
    return FR_TO_ENUM[raw as keyof typeof FR_TO_ENUM]
  }

  // libellé FR insensible à la casse
  const k = Object.keys(FR_TO_ENUM).find(k => k.toLowerCase() === raw.toLowerCase())
  if (k) return FR_TO_ENUM[k as keyof typeof FR_TO_ENUM]

  // toute autre valeur (ex: "CANCELLED", "Annulée", "Planifiée") => refusée
  return null
}

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user?.email || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  return null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin()
    if (guard) return guard

    const mission = await prisma.mission.findUnique({
      where: { id: params.id },
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
            ratePerKm: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        quote: true,
      },
    })
    if (!mission) return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
    return NextResponse.json({ mission })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin()
    if (guard) return guard

    const body = await req.json().catch(() => ({}))
    const status = normalizeStatus(body?.status)
    if (!status) {
      return NextResponse.json(
        { error: 'Statut invalide. Utilise: En attente, Assignée, En cours, Terminée.' },
        { status: 400 }
      )
    }

    const updated = await prisma.mission.update({
      where: { id: params.id },
      data: { status },
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
            ratePerKm: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        quote: true,
      },
    })

    return NextResponse.json({ ok: true, mission: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin()
    if (guard) return guard

    await prisma.mission.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
