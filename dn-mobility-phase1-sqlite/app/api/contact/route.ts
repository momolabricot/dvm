// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ContactInput } from '@/lib/validators'
import { sendMail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => ({}))
  const parsed = ContactInput.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const c = parsed.data
  await sendMail(
    c.email,
    c.objet || 'Merci pour votre message',
    `<p>Bonjour ${c.prenom},</p><p>Nous avons bien reçu votre message.</p>`
  )
  return NextResponse.json({ ok: true })
}
