// app/api/admin/missions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, getSessionUser } from '@/lib/auth-helpers'

export async function GET(_req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'ADMIN_IT'])

    const missions = await prisma.mission.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        pickupAddress: true,
        dropoffAddress: true,
        distanceKm: true,
        clientPriceTTC: true,
        status: true,
        clientId: true,
        assignedToId: true,
        quoteId: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            companyName: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        assignedTo: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        quote: { select: { number: true } },
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

export async function POST(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'ADMIN_IT'])
    const admin = await getSessionUser()
    const body = await req.json().catch(() => ({}))

    const {
      title,
      description,
      scheduledAt,
      pickupAddress,
      dropoffAddress,
      distanceKm,
      clientPriceTTC,
      clientId,       // ClientProfile.id
      assignedToId,   // ConvoyeurProfile.id (facultatif)
      quoteId,        // (facultatif)
    } = body || {}

    if (!title || !pickupAddress || !dropoffAddress || !clientId) {
      return NextResponse.json(
        { error: 'title, pickupAddress, dropoffAddress, clientId requis' },
        { status: 400 }
      )
    }

    // Vérifier client
    const client = await prisma.clientProfile.findUnique({
      where: { id: String(clientId) },
      select: { id: true, user: { select: { role: true } } },
    })
    if (!client || client.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 400 })
    }

    // Vérifier convoyeur si fourni
    if (assignedToId) {
      const convoyeur = await prisma.convoyeurProfile.findUnique({
        where: { id: String(assignedToId) },
        select: { id: true, user: { select: { role: true } } },
      })
      if (!convoyeur || convoyeur.user.role !== 'CONVOYEUR') {
        return NextResponse.json({ error: 'Convoyeur introuvable' }, { status: 400 })
      }
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description: description ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        pickupAddress,
        dropoffAddress,
        distanceKm: distanceKm ?? null,
        clientPriceTTC: clientPriceTTC ?? null,
        clientId: String(clientId),
        assignedToId: assignedToId ? String(assignedToId) : null,
        quoteId: quoteId ?? null,
        createdById: admin?.id ?? null,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: mission.id }, { status: 201 })
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Create mission error', detail: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'ADMIN_IT'])
    const body = await req.json().catch(() => ({}))
    const { id, ...patch } = body || {}
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    // si on change clientId, vérifier que c’est bien un ClientProfile.id
    if (patch.clientId) {
      const exists = await prisma.clientProfile.findUnique({
        where: { id: String(patch.clientId) },
        select: { id: true },
      })
      if (!exists) return NextResponse.json({ error: 'Client introuvable' }, { status: 400 })
    }

    await prisma.mission.update({
      where: { id: String(id) },
      data: {
        ...(patch.title != null ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.scheduledAt !== undefined
          ? { scheduledAt: patch.scheduledAt ? new Date(patch.scheduledAt) : null }
          : {}),
        ...(patch.pickupAddress != null ? { pickupAddress: patch.pickupAddress } : {}),
        ...(patch.dropoffAddress != null ? { dropoffAddress: patch.dropoffAddress } : {}),
        ...(patch.distanceKm !== undefined ? { distanceKm: patch.distanceKm } : {}),
        ...(patch.clientPriceTTC !== undefined ? { clientPriceTTC: patch.clientPriceTTC } : {}),
        ...(patch.clientId != null ? { clientId: String(patch.clientId) } : {}),
        ...(patch.assignedToId !== undefined
          ? { assignedToId: patch.assignedToId ? String(patch.assignedToId) : null }
          : {}),
        ...(patch.status != null ? { status: patch.status } : {}),
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    if (e?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Update mission error', detail: String(e) }, { status: 500 })
  }
}
