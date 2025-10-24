// app/api/admin/convoyeurs/[id]/pricing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

type Body = { ratePerKm?: number | null }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const id = params.id
  const body = (await req.json().catch(() => ({}))) as Body
  if (body.ratePerKm != null && Number.isNaN(Number(body.ratePerKm))) {
    return NextResponse.json({ error: 'ratePerKm invalide' }, { status: 400 })
  }

  const updated = await prisma.convoyeurProfile.update({
    where: { id },
    data: { ratePerKm: body.ratePerKm == null ? null : Number(body.ratePerKm) },
    select: { id: true, ratePerKm: true },
  })

  return NextResponse.json(updated)
}
