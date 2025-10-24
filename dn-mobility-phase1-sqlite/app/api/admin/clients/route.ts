// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  await requireRole(['ADMIN', 'ADMIN_IT'])

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const onlyActive = searchParams.get('active') === '1'

  const clients = await prisma.clientProfile.findMany({
    where: {
      user: {
        role: 'CLIENT',
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
      companyName: true,
      priceFactor: true,        
      user: {
        select: { id: true, email: true, name: true, isActive: true, role: true },
      },
    },
  })

  return NextResponse.json({ clients })
}
