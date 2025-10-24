// app/api/admin/quotes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PatchInput = z.object({
  status: z.enum(['PENDING','SENT','VIEWED','ACCEPTED','REJECTED']),
})

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
  const item = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { customer: true },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  const body = await req.json().catch(() => ({}))
  const parsed = PatchInput.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.quote.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })
  return NextResponse.json(updated)
}
