import { requireRole } from '@/lib/auth-helpers'

export default async function AdminQuotesPage() {
  await requireRole(['ADMIN','ADMIN_IT'])
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Devis</h1>
      <p className="text-gray-600">Historique des devis générés, export PDF, conversion en mission.</p>
      {/* TODO: listing quotes + bouton "Créer mission" */}
    </div>
  )
}
