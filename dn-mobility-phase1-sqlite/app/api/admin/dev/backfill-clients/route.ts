// app/api/admin/dev/backfill-clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

// POST /api/admin/dev/backfill-clients
// Crée un ClientProfile pour tout user role=CLIENT qui n'en a pas.
export async function POST(_req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT', clientProfile: null },
    select: { id: true, email: true }
  })

  for (const u of clients) {
    await prisma.clientProfile.create({ data: { userId: u.id }})
  }

  return NextResponse.json({ created: clients.length })
}
