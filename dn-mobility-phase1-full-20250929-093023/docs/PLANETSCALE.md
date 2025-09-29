# PlanetScale (MySQL) — configuration rapide
1. Crée une base `dnmobility` sur https://planetscale.com (EU).
2. Onglet **Passwords** → **Create new password** (role Admin) et copie l'URL.
3. Dans `.env`, mets `DATABASE_URL` avec l'URL fournie.
4. Initialise le schéma :
```bash
npx prisma migrate deploy
npm run seed
```
