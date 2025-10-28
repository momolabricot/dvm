// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    const body = await req.json().catch(() => ({} as any))
    let { companyName, priceFactor } = body as {
      companyName?: string
      priceFactor?: number | string
    }

    // Normalisations
    if (typeof companyName !== 'string') companyName = ''
    companyName = companyName.trim()
    if (companyName === '') companyName = 'Particulier'

    const pf = typeof priceFactor === 'string' ? Number(priceFactor) : Number(priceFactor)
    if (!Number.isFinite(pf)) {
      return NextResponse.json({ error: 'Facteur de prix invalide' }, { status: 400 })
    }
    // bornes raisonnables (ex: entre 0.1x et 10x)
    const safePf = Math.min(10, Math.max(0.1, pf))

    const exists = await prisma.clientProfile.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const updated = await prisma.clientProfile.update({
      where: { id },
      data: {
        companyName,
        priceFactor: safePf,
      },
      select: {
        id: true,
        companyName: true,
        priceFactor: true,
        user: {
          select: { id: true, name: true, email: true, isActive: true, role: true },
        },
      },
    })

    return NextResponse.json({
      ...updated,
      companyName: updated.companyName && updated.companyName.trim() !== '' ? updated.companyName : 'Particulier',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}
