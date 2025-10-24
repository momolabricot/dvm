// lib/quote-number.ts
import { prisma } from '@/lib/prisma'

export async function nextQuoteNumber() {
  const now = new Date()
  // Date "jour" sans l’heure pour la clé primaire
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yyyymmdd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const counter = await prisma.counter.upsert({
    where: { counter_date: day },
    create: { counter_date: day, value: 1 },
    update: { value: { increment: 1 } },
  })

  const seq = String(counter.value).padStart(4, '0')
  return `DNM-${yyyymmdd}-${seq}`
}
