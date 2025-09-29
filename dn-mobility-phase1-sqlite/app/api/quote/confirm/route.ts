import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, ipFromHeaders } from '@/lib/ratelimit'
import { QuoteConfirmInput } from '@/lib/validators'
import { computePrice, defaultGrid } from '@/lib/pricing'
import { nextQuoteNo } from '@/lib/quote-number'
import { renderQuotePDF } from '@/lib/pdf'
import { renderEJS } from '@/lib/tpl'
import { sendMail } from '@/lib/email'

function unflatten(obj:any){ const out:any={}; for(const [k,v] of Object.entries(obj)){ const keys=k.split('.'); let cur=out; for(let i=0;i<keys.length-1;i++){cur[keys[i]]=cur[keys[i]]||{}; cur=cur[keys[i]]} cur[keys.at(-1)!]=v } return out }

export async function POST(req: NextRequest){
  const rl = rateLimit(ipFromHeaders(req.headers)+'::quote_confirm');
  if(!rl.ok) return NextResponse.json({error:'Trop de requêtes', retryAfter: rl.retryAfter}, {status:429})
  const p = QuoteConfirmInput.parse(unflatten(await req.json()))
  const distance_km = Number((p as any).distance_km || 0)
  const pricing = computePrice(defaultGrid, distance_km, p.vehicle_type as any, p.option as any)
  const quoteNo = await nextQuoteNo()
  const html = await renderEJS('templates/quote.ejs', {
    quoteNo,
    date: new Date().toLocaleDateString('fr-FR'),
    siret: process.env.SIRET||'',
    companyAddress: process.env.COMPANY_ADDRESS||'',
    client:{prenom:p.prenom, nom:p.nom, email:p.email, telephone:p.telephone},
    details: p,
    pricing:{distance_km, ...pricing},
    mailFrom: process.env.MAIL_FROM || ''
  })
  const dir = process.cwd() + '/public/quotes'
  await (await import('fs/promises')).mkdir(dir, {recursive:true})
  const outPath = `${dir}/${quoteNo}.pdf`
  await renderQuotePDF(html, outPath)
  const pdfUrl = `/quotes/${quoteNo}.pdf`

  // Emails
  const commercial = process.env.COMMERCIAL_EMAIL||''
  const htmlClient = await renderEJS('templates/email-client.ejs', {quoteNo, client:{prenom:p.prenom, nom:p.nom, email:p.email, telephone:p.telephone}, pricing:{distance_km, ...pricing}})
  const htmlSales  = await renderEJS('templates/email-commercial.ejs', {quoteNo, client:{prenom:p.prenom, nom:p.nom, email:p.email, telephone:p.telephone}, details:p, pricing:{distance_km, ...pricing}})
  await Promise.all([
    sendMail(p.email, `Votre devis ${quoteNo}`, htmlClient, [{path: outPath}]),
    commercial? sendMail(commercial, `Nouveau devis ${quoteNo}`, htmlSales, [{path: outPath}]): Promise.resolve()
  ])

  return NextResponse.json({quote_no: quoteNo, pdf_url: pdfUrl})
}
