// app/api/admin/convoyeurs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  const body = await req.json().catch(() => ({}))
  const { isActive } = body || {}
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive boolean requis' }, { status: 400 })
  }

  try {
    const profile = await prisma.convoyeurProfile.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const user = await prisma.user.update({
      where: { id: profile.userId },
      data: { isActive },
      select: { id: true, email: true, name: true, isActive: true },
    })
    return NextResponse.json({ user })
  } catch (e: any) {
    return NextResponse.json({ error: 'Update failed', detail: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { id } = params
  try {
    const profile = await prisma.convoyeurProfile.findUnique({
      where: { id }, select: { userId: true }
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.user.update({ where: { id: profile.userId }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Delete failed', detail: String(e) }, { status: 500 })
  }
}
