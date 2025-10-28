// app/api/admin/missions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth' // on récupère l'utilisateur connecté via NextAuth

function parseNumber(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null
  const v = typeof n === 'string' ? Number(n.replace(',', '.')) : Number(n)
  return Number.isFinite(v) ? v : null
}
function parseDateISO(s: unknown): Date | null {
  if (!s || typeof s !== 'string') return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// GET avec recherche optionnelle ?q=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()

    // même orderBy/include qu’avant; on ajoute juste un where si q est fourni
    const where: any = {}
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { pickupAddress: { contains: q } },
        { dropoffAddress: { contains: q } },
        { client: { user: { name: { contains: q } } } },
        { client: { user: { email: { contains: q } } } },
        { assignedTo: { user: { name: { contains: q } } } },
        { assignedTo: { user: { email: { contains: q } } } },
      ]
    }

    const rows = await prisma.mission.findMany({
      where,
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
            ratePerKm: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        quote: true,
      },
    })

    return NextResponse.json({ rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1) Récupérer l'utilisateur connecté
    const session = await auth()
    const email = session?.user?.email
    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const me = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (!me) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 })
    }

    // 2) Lire / valider le body
    const body = await req.json()

    const title = (body?.title ?? '').toString().trim()
    const description = (body?.description ?? '').toString().trim()
    const clientId = (body?.clientId ?? '').toString().trim()
    const assignedToIdRaw = body?.assignedToId
    const pickupAddress = (body?.pickupAddress ?? '').toString().trim()
    const dropoffAddress = (body?.dropoffAddress ?? '').toString().trim()

    if (!title) throw new Error('Titre requis')
    if (!clientId) throw new Error('Client requis')
    if (!pickupAddress) throw new Error('Adresse de prise en charge requise')
    if (!dropoffAddress) throw new Error('Adresse de dépose requise')

    const distanceKm = parseNumber(body?.distanceKm)
    const clientPriceTTC = parseNumber(body?.clientPriceTTC)
    const scheduledAt = parseDateISO(body?.scheduledAt)

    // 3) Construire le payload Prisma (sans "status" -> default du schéma)
    const data: any = {
      title,
      description: description || null,
      clientId,
      assignedToId: assignedToIdRaw ? String(assignedToIdRaw) : null,
      pickupAddress,
      dropoffAddress,
      distanceKm,         // nullable dans le schéma
      clientPriceTTC,     // nullable dans le schéma
      scheduledAt,        // nullable dans le schéma
      createdById: me.id,
    }

    const created = await prisma.mission.create({
      data,
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

    return NextResponse.json({ ok: true, mission: created })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
