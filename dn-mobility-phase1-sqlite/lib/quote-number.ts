import { prisma } from './db'
export async function nextQuoteNo(){
  const now = new Date()
  const ymd = now.toISOString().slice(0,10).replaceAll('-','')
  const dateKey = new Date(ymd + 'T00:00:00.000Z')
  const val = await prisma.$transaction(async (tx)=>{
    await tx.counters.upsert({ where:{ counter_date: dateKey }, create:{ counter_date: dateKey, value: 0 }, update:{} })
    const updated = await tx.counters.update({ where:{ counter_date: dateKey }, data: { value: { increment: 1 } } })
    return updated.value
  })
  return `DNM-${ymd}-${String(val).padStart(4,'0')}`
}
