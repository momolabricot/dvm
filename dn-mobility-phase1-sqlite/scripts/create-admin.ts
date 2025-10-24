// scripts/create-admin.ts
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
async function main() {
  const hash = await bcrypt.hash('Admin!234', 10)
  await prisma.users.create({
    data: { email: 'admin@dnm.test', password: hash, role: 'ADMIN', isActive: true, priceMultiplier: 1 },
  })
  console.log('ok')
}
main()
