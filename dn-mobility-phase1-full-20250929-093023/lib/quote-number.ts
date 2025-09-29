import { prisma } from './db'
export async function nextQuoteNo(){
  const now = new Date()
  const ymd = now.toISOString().slice(0,10).replaceAll('-','')
  const sqlDate = now.toISOString().slice(0,10)
  await prisma.$executeRawUnsafe(`INSERT IGNORE INTO counters (counter_date, value) VALUES ('${sqlDate}', 0)`)
  await prisma.$executeRawUnsafe(`UPDATE counters SET value = value + 1 WHERE counter_date='${sqlDate}'`)
  const row:any = await prisma.$queryRawUnsafe(`SELECT value FROM counters WHERE counter_date='${sqlDate}'`)
  const val = Array.isArray(row) ? row[0].value : 1
  return `DNM-${ymd}-${String(val).padStart(4,'0')}`
}
