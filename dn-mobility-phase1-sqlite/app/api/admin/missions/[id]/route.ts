// app/api/admin/missions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  const data = await req.json().catch(() => ({}))

  const update: any = {}
  if (data.title !== undefined) update.title = data.title
  if (data.description !== undefined) update.description = data.description
  if (data.pickupAddress !== undefined) update.pickupAddress = data.pickupAddress
  if (data.dropoffAddress !== undefined) update.dropoffAddress = data.dropoffAddress
  if (data.distanceKm !== undefined) update.distanceKm = data.distanceKm
  if (data.clientPriceTTC !== undefined) update.clientPriceTTC = data.clientPriceTTC
  if (data.status !== undefined) update.status = data.status
  if (data.scheduledAt !== undefined) update.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null

  if (data.assignedToId !== undefined) {
    if (data.assignedToId === null || data.assignedToId === '') {
      update.assignedToId = null
      if (update.status === undefined) update.status = 'PLANNED'
    } else {
      const conv = await prisma.convoyeurProfile.findUnique({ where: { id: data.assignedToId } })
      if (!conv) return NextResponse.json({ error: 'Convoyeur introuvable' }, { status: 400 })
      update.assignedToId = conv.id
      if (update.status === undefined) update.status = 'ASSIGNED'
    }
  }

  try {
    const res = await prisma.mission.update({ where: { id }, data: update, select: { id: true } })
    return NextResponse.json({ ok: true, id: res.id })
  } catch (e: any) {
    return NextResponse.json({ error: 'Update mission error', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  try {
    await prisma.mission.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Delete mission error', detail: String(e) }, { status: 500 })
  }
}
