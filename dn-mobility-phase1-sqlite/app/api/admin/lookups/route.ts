// app/api/admin/lookups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])

  const convoyeurs = await prisma.convoyeurProfile.findMany({
    select: { id: true, user: { select: { id: true, email: true, name: true } } },
    orderBy: { id: 'asc' },
  })
  const clients = await prisma.clientProfile.findMany({
    select: { id: true, user: { select: { id: true, email: true, name: true } } },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({
    convoyeurs: convoyeurs.map(c => ({
      id: c.id,
      label: c.user.name || c.user.email,
      userId: c.user.id,
    })),
    clients: clients.map(c => ({
      id: c.id,
      label: c.user.name || c.user.email,
      userId: c.user.id,
    })),
  })
}
