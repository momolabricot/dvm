import { requireRole } from '@/lib/auth-helpers'

export default async function AdminPricingPage() {
  await requireRole(['ADMIN','ADMIN_IT'])
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tarifs</h1>
      <p className="text-gray-600">Barème global & overrides par client.</p>
      {/* TODO: édition du barème (km, options) + overrides par client */}
    </div>
  )
}
