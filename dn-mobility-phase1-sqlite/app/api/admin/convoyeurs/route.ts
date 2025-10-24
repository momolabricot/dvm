// app/api/admin/convoyeurs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const onlyActive = searchParams.get('active') === '1'

  const convoyeurs = await prisma.convoyeurProfile.findMany({
    where: {
      user: {
        role: 'CONVOYEUR',
        ...(onlyActive ? { isActive: true } : {}),
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      ratePerKm: true,
      user: { select: { id: true, email: true, name: true, isActive: true } },
    },
  })

  return NextResponse.json({ convoyeurs })
}
