# Démarrage ultra-simple avec SQLite (gratuit)
Aucune base distante requise.

```bash
cp .env.example .env               # DATABASE_URL = file:./dev.db
npm ci
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Ensuite : http://localhost:3000 ou le port 3000 dans Codespaces.
- Simulateur → devis → PDF généré dans `public/quotes/…` (lien direct renvoyé).
- Emails : configure SMTP Mailtrap dans `.env` si tu veux les recevoir.
