// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

// Soft delete (désactiver)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Delete failed', detail: String(e) }, { status: 500 })
  }
}

// Réactiver un utilisateur
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  const body = await req.json().catch(() => ({}))
  const { isActive } = body || {}

  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive boolean requis' }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, role: true, name: true, phone: true, isActive: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ error: 'Patch failed', detail: String(e) }, { status: 500 })
  }
}
