import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, ipFromHeaders } from '@/lib/ratelimit'
import { sendMail } from '@/lib/email'
import { renderEJS } from '@/lib/tpl'
export async function POST(req: NextRequest){
  const rl = rateLimit(ipFromHeaders(req.headers)+'::contact');
  if(!rl.ok) return NextResponse.json({error:'Trop de requêtes', retryAfter: rl.retryAfter}, {status:429})
  const {email, phone, message} = await req.json()
  const commercial = process.env.COMMERCIAL_EMAIL||''
  const htmlClient = await renderEJS('templates/email-client.ejs', { quoteNo:'—', client:{prenom:'', nom:'', email, telephone: phone||''}, pricing:{distance_km:0, price_ht:0, tva:0, price_ttc:0} })
  const htmlSales = `<p>Nouveau message</p><pre>${message}</pre><p>Email: ${email} — Tél: ${phone}</p>`
  await Promise.all([
    sendMail(email, 'Confirmation — DN Mobility', htmlClient),
    commercial? sendMail(commercial, 'Nouveau contact', htmlSales):Promise.resolve()
  ])
  return NextResponse.json({ok:true})
}
