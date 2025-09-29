export const metadata = { title: 'À propos — DN Mobility' }
export default function APropos(){
  return (<div className="card"><h1 className="text-2xl font-semibold">À propos</h1><p className="mt-3">DN Mobility — SIRET: {process.env.SIRET ?? 'à compléter'}. Adresse: {process.env.COMPANY_ADDRESS ?? 'à compléter'}.</p></div>)
}
