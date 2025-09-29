# DN Mobility — Phase 1 (MVP)
- Next.js (App Router) + TypeScript + Tailwind
- Prisma (MySQL) — PlanetScale conseillé en dev
- Puppeteer (PDF) + Nodemailer (SMTP)
- Zod (validation)
- EJS (PDF + emails)

## Démarrage (Codespaces recommandé)
```bash
cp .env.example .env
npm ci
npx prisma generate
# (Optionnel si DB dispo)
# npx prisma migrate deploy
# npm run seed
npm run dev
```

### Notes
- Distance: OSRM public → fallback haversine×1,2.
- Tarifs: grille par défaut intégrée.
- Rate limit: 10 req/min sur /api/quote/* et /api/email/contact.
- SEO: JSON-LD, sitemap, robots.
