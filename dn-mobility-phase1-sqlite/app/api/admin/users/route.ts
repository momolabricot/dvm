// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') as 'ADMIN' | 'ADMIN_IT' | 'CLIENT' | 'CONVOYEUR' | null
    const q = (searchParams.get('q') || '').trim()
    const includeInactive = searchParams.get('include_inactive') === '1'

    const where: any = {}
    if (role) where.role = role
    if (!includeInactive) where.isActive = true
    if (q) {
      where.OR = [
        { email: { contains: q } },
        { name: { contains: q } },
        { phone: { contains: q } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        isActive: true,
      },
    })

    return NextResponse.json({
      users,
      total: users.length,
      page: 1,
      pageSize: users.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}



export async function POST(req: NextRequest) {
  
  const headerSecret = req.headers.get('x-admin-secret')
  const envSecret = process.env.ADMIN_CREATE_SECRET
  let isAuthorized = false

  if (headerSecret && envSecret && headerSecret === envSecret) {
    isAuthorized = true
  } else {
    try {
      await requireRole(['ADMIN', 'ADMIN_IT'])
      isAuthorized = true
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const data = await req.json().catch(() => ({}))
  const { email, password, role, name, phone } = data || {}
  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password, role requis' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? email.split('@')[0],
        phone: phone ?? null,
        role,
        passwordHash,
        isActive: true,
        convoyeurProfile: role === 'CONVOYEUR' ? { create: {} } : undefined,
        clientProfile:   role === 'CLIENT'    ? { create: {} } : undefined,
      },
      select: { id: true, email: true, role: true, name: true, phone: true, isActive: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Create user error', detail: String(e) }, { status: 500 })
  }
}
