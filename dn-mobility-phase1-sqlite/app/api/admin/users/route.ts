// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { requireRole } from '@/lib/auth-helpers'

/**
 * GET /api/admin/users
 * Query:
 *  - role=ADMIN|ADMIN_IT|CLIENT|CONVOYEUR (optionnel)
 *  - q=jean@example.com (optionnel - recherche email)
 *  - include_inactive=1 (optionnel - inclure les inactifs)
 *  - page=1&pageSize=20 (optionnel)
 */
export async function GET(req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') || undefined
  const q = searchParams.get('q') || undefined
  const includeInactive = searchParams.get('include_inactive') === '1'

  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 50)))
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (role) where.role = role
  if (!includeInactive) where.isActive = true
  if (q) where.email = { contains: q, mode: 'insensitive' as const }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        createdAt: true, isActive: true,
      },
      skip, take: pageSize,
    }),
  ])

  return NextResponse.json({ users, total, page, pageSize })
}

/**
 * POST /api/admin/users
 * Body: { email, password, role, name?, phone? }
 * Autorisé via x-admin-secret (dev) ou session ADMIN/ADMIN_IT (prod)
 */
export async function POST(req: NextRequest) {
  // autorisation
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
