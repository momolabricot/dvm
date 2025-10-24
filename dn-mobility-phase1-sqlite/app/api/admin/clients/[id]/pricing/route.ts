// app/api/admin/clients/[id]/pricing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params

  const body = await req.json().catch(() => ({} as any))
  const patch: { priceFactor?: number; isActive?: boolean } = {}

  if (typeof body.priceFactor === 'number' && isFinite(body.priceFactor) && body.priceFactor > 0) {
    patch.priceFactor = body.priceFactor
  }
  if (typeof body.isActive === 'boolean') {
    patch.isActive = body.isActive
  }

  if (!('priceFactor' in patch) && !('isActive' in patch)) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }

  try {
    const updated = await prisma.clientProfile.update({
      where: { id },
      data: patch,
      select: { id: true, priceFactor: true, isActive: true },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: 'Update pricing error', detail: String(e) }, { status: 500 })
  }
}
