export const metadata = {
  title: 'Mentions légales — DN Mobility',
  alternates: { canonical: '/mentions-legales' },
}

export default function MentionsLegales() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Mentions légales</h1>

      <section className="space-y-3">
        <p><strong>Éditeur :</strong> DN Mobility, SIRET 123 456 789 00011</p>
        <p><strong>Siège :</strong> 1 Rue Exemple, 33000 Bordeaux, France</p>
        <p><strong>Contact :</strong> contact@dnmobility.fr — +33 5 00 00 00 00</p>
        <p><strong>Directeur de la publication :</strong> DN Mobility</p>
        <p><strong>Hébergeur :</strong> o2switch — 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand — 04 44 44 60 40</p>
      </section>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Propriété intellectuelle</h2>
      <p>Ce site et son contenu sont protégés. Toute reproduction non autorisée est interdite.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Responsabilité</h2>
      <p>Les informations sont fournies à titre indicatif et peuvent évoluer sans préavis.</p>
    </main>
  )
}
