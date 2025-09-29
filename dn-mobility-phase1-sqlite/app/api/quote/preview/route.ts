import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, ipFromHeaders } from '@/lib/ratelimit'
import { QuoteInput } from '@/lib/validators'
import { drivingDistanceKm } from '@/lib/distance'
import { computePrice, defaultGrid } from '@/lib/pricing'

function unflatten(obj:any){
  const out:any = {}
  for(const [k,v] of Object.entries(obj)){
    const keys = k.split('.'); let cur = out
    for(let i=0;i<keys.length-1;i++){ cur[keys[i]] = cur[keys[i]] || {}; cur = cur[keys[i]] }
    cur[keys.at(-1)!] = v
  }
  return out
}

export async function POST(req: NextRequest){
  const rl = rateLimit(ipFromHeaders(req.headers)+'::quote_preview');
  if(!rl.ok) return NextResponse.json({error:'Trop de requêtes', retryAfter: rl.retryAfter}, {status:429})
  const body = await req.json()
  const parsed = QuoteInput.safeParse(unflatten(body))
  if(!parsed.success) return NextResponse.json({error: parsed.error.flatten()}, {status:400})
  const d = parsed.data
  let km = 0
  const legs = [{a:d.depart, b:d.arrivee}]
  if(d.round_trip && d.retour_depart && d.retour_arrivee) legs.push({a:d.retour_depart, b:d.retour_arrivee})
  for(const leg of legs){ km += await drivingDistanceKm({lat:leg.a.lat,lon:leg.a.lon},{lat:leg.b.lat,lon:leg.b.lon}) }
  km = Math.round(km*100)/100
  const pricing = computePrice(defaultGrid, km, d.vehicle_type as any, d.option as any)
  return NextResponse.json({ distance_km: km, ...pricing })
}
