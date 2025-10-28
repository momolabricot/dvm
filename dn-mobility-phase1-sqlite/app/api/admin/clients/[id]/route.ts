// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Body = {
  companyName?: string
  priceFactor?: number
}

function parseNumber(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null
  const v = typeof n === 'string' ? Number(n.replace(',', '.')) : Number(n)
  return Number.isFinite(v) ? v : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: ADMIN ou ADMIN_IT
    const session = await auth()
    const role = (session?.user as any)?.role
    if (role !== 'ADMIN' && role !== 'ADMIN_IT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const body = (await req.json().catch(() => ({}))) as Body

    // companyName: string ou null (on stocke null si "Particulier"/vide)
    const rawName = (body.companyName ?? '').toString().trim()
    const companyName = rawName && rawName.toLowerCase() !== 'particulier' ? rawName : null

    // priceFactor: nombre >= 0.1 (par défaut 1.0 si absent)
    const pfParsed = parseNumber(body.priceFactor)
    const priceFactor =
      pfParsed == null ? undefined : Math.max(0.1, Math.min(10, pfParsed))

    if (priceFactor !== undefined && !Number.isFinite(priceFactor)) {
      return NextResponse.json({ error: 'priceFactor invalide' }, { status: 400 })
    }

    // Vérifier l’existence
    const exists = await prisma.clientProfile.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!exists) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    const updated = await prisma.clientProfile.update({
      where: { id },
      data: {
        // ne met à jour que ce qui est présent
        ...(companyName !== undefined ? { companyName } : {}),
        ...(priceFactor !== undefined ? { priceFactor } : {}),
      },
      select: {
        id: true,
        companyName: true,
        priceFactor: true,
        user: { select: { id: true, name: true, email: true, isActive: true, role: true } },
      },
    })

    return NextResponse.json({ ok: true, client: updated })
  } catch (e: any) {
    const msg = e?.message || 'Erreur serveur'
    // Not Found Prisma
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
