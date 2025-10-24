export const metadata = {
  title: 'Conditions d’utilisation des données — DN Mobility',
  alternates: { canonical: '/donnees-personnelles' },
}

export default function DonneesPersonnelles() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Conditions d’utilisation des données</h1>

      <p className="mb-4">
        DN Mobility traite vos données pour répondre à vos demandes (contact, devis) et assurer la
        gestion des missions. Base légale : l’exécution de mesures précontractuelles/contractuelles
        et votre consentement pour la prospection.
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li><strong>Données traitées :</strong> identité, coordonnées, éléments du devis/mission.</li>
        <li><strong>Durées de conservation :</strong> 3 ans pour les prospects, 10 ans pour les documents comptables.</li>
        <li><strong>Destinataires :</strong> DN Mobility et ses sous-traitants techniques (hébergement, email).</li>
        <li><strong>Vos droits :</strong> accès, rectification, opposition, effacement, limitation, portabilité.</li>
        <li><strong>Contact RGPD :</strong> privacy@dnmobility.fr</li>
      </ul>

      <p className="mt-4">
        Pour toute question ou exercice de vos droits, contactez <a className="underline" href="mailto:privacy@dnmobility.fr">privacy@dnmobility.fr</a>.
      </p>
    </main>
  )
}
