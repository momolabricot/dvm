// app/api/admin/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const q = searchParams.get('q') ?? undefined
  const page = Number(searchParams.get('page') ?? '1')
  const perPage = Math.min(Number(searchParams.get('perPage') ?? '20'), 100)
  const all = searchParams.get('all') === '1'

  const where: any = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { quoteNo: { contains: q, mode: 'insensitive' } },
      { depart: { contains: q, mode: 'insensitive' } },
      { arrivee: { contains: q, mode: 'insensitive' } },
      { customer: { email: { contains: q, mode: 'insensitive' } } },
      { customer: { prenom: { contains: q, mode: 'insensitive' } } },
      { customer: { nom: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const orderBy = { createdAt: 'desc' as const }

  if (all) {
    const items = await prisma.quote.findMany({ where, orderBy, include: { customer: true } })
    return NextResponse.json({ items })
  }

  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { customer: true },
    }),
    prisma.quote.count({ where }),
  ])

  return NextResponse.json({
    items,
    page,
    perPage,
    total,
    pages: Math.ceil(total / perPage),
  })
}
