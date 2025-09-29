import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'
async function main(){
  const it = await prisma.users.upsert({ where:{email:'it@dnmobility.fr'}, update:{}, create:{ email:'it@dnmobility.fr', role:'it_admin', password_hash: await bcrypt.hash('ChangeMe!2025', 12) } })
  await prisma.tariffs.create({ data:{ name:'Défaut 2025', grid_json:{ vehicle_types: { citadine:{per_km:0.70}, berline:{per_km:0.85}, utilitaire:{per_km:1.00}, vl_plateau:{per_km:1.20} }, option_multiplier: {convoyeur:1.0, plateau:1.25}, rounding:{mode:'ceil_to_cent'} } as any, active:1, updated_by: it.id } })
}
main().finally(()=>process.exit(0))
