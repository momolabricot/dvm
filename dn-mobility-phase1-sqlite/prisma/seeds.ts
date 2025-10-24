import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding…')

  // IT Admin (2FA sera vu plus tard)
  const it = await prisma.users.upsert({
    where: { email: 'it@dnmobility.fr' },
    update: {},
    create: {
      email: 'it@dnmobility.fr',
      role: 'it_admin', // NOTE: avec SQLite on stocke les rôles en string
      password_hash: await bcrypt.hash('ChangeMe!2025', 12),
    },
  })

  // Grille tarifaire par défaut (JSON stringifié car SQLite ne supporte pas JSON native)
  await prisma.tariffs.create({
    data: {
      name: 'Défaut 2025',
      grid_json: JSON.stringify({
        vehicle_types: {
          citadine: { per_km: 0.70 },
          berline: { per_km: 0.85 },
          utilitaire: { per_km: 1.00 },
          vl_plateau: { per_km: 1.20 },
        },
        option_multiplier: { convoyeur: 1.0, plateau: 1.25 },
        rounding: { mode: 'ceil_to_cent' },
      }),
      active: 1,
      updated_by: it.id,
    },
  })

  console.log('Seed done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
