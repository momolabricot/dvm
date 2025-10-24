// app/api/client/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_req: NextRequest) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const me = await prisma.user.findUnique({
    where: { email },
    select: { clientProfile: { select: { id: true } } }
  })
  const clientId = me?.clientProfile?.id
  if (!clientId) return NextResponse.json([], { status: 200 })

  const quotes = await prisma.quote.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, number: true, createdAt: true }
  })
  return NextResponse.json(quotes)
}
