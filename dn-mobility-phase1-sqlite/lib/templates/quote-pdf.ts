// lib/templates/quote-pdf.ts
export type QuotePDFData = {
  quote_no: string
  created_at: Date | string
  company: {
    name: string
    logo?: string // URL (optionnel)
    addr: string
    email: string
    phone: string
    siret?: string
    tva?: string
    site?: string
  }
  customer: { prenom: string; nom: string; email: string; telephone: string }
  form: {
    depart: string
    arrivee: string
    round_trip: boolean
    retour_depart?: string | null
    retour_arrivee?: string | null
    vehicle_type: 'citadine'|'berline'|'utilitaire'|'vl_plateau'
    plate: string
    option: 'convoyeur'|'plateau'
  }
  distance_km: number
  pricing: { price_ht: number; tva: number; price_ttc: number }
  validity_days?: number
  notes?: string
}

function eur(n:number){ return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n) }
function dmy(d:Date){ return d.toLocaleDateString('fr-FR') }

export function buildQuoteHTML(d: QuotePDFData){
  const created = new Date(d.created_at)
  const clientName = `${d.customer.prenom} ${d.customer.nom}`.trim()
  const backTrip = d.form.round_trip && d.form.retour_depart && d.form.retour_arrivee
  const trajet1 = `${d.form.depart} → ${d.form.arrivee}`
  const trajet2 = backTrip ? `${d.form.retour_depart} → ${d.form.retour_arrivee}` : null

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Devis ${d.quote_no}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root{
      --ink:#0f172a; --muted:#64748b; --brand:#111827; --line:#e5e7eb; --chip:#f3f4f6;
    }
    *{ box-sizing:border-box; }
    body{ font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:var(--ink); margin:0; }
    .page{ padding:28mm 18mm 22mm; }
    header{ display:flex; align-items:center; justify-content:space-between; gap:24px; }
    .brand{ display:flex; align-items:center; gap:14px; }
    .brand img{ height:48px; }
    .brand h1{ font-size:18px; margin:0; }
    .meta{ text-align:right; font-size:12px; color:var(--muted); }
    h2{ font-size:22px; margin:28px 0 10px; }
    .cols{ display:flex; gap:28px; }
    .col{ flex:1; }
    .card{ border:1px solid var(--line); border-radius:12px; padding:14px 16px; background:#fff; }
    .muted{ color:var(--muted); }
    .chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .chip{ background:var(--chip); border-radius:999px; padding:6px 10px; font-size:12px; }
    table{ width:100%; border-collapse:collapse; margin-top:14px; }
    th, td{ padding:12px 10px; text-align:left; font-size:13px; vertical-align:top; }
    thead th{ font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); border-bottom:1px solid var(--line); }
    tbody tr + tr td{ border-top:1px solid var(--line); }
    tfoot td{ border-top:2px solid var(--ink); font-weight:600; }
    .right{ text-align:right; }
    .totals{ margin-top:16px; width:100%; }
    .totals td{ padding:6px 0; }
    .totals .label{ color:var(--muted); }
    footer{ margin-top:28px; font-size:11px; color:var(--muted); display:flex; justify-content:space-between; gap:20px; }
    .small{ font-size:12px; }
  </style>
</head>
<body>
  <section class="page">
    <header>
      <div class="brand">
        ${d.company.logo ? `<img src="${d.company.logo}" alt="${d.company.name}"/>` : ''}
        <div>
          <h1>${d.company.name}</h1>
          <div class="muted small">${d.company.addr}</div>
          <div class="muted small">${d.company.email} · ${d.company.phone}</div>
        </div>
      </div>
      <div class="meta">
        <div><strong>Devis</strong> ${d.quote_no}</div>
        <div>Émis le ${dmy(created)}</div>
        ${d.validity_days ? `<div>Validité: ${d.validity_days} jours</div>` : ''}
      </div>
    </header>

    <div class="cols" style="margin-top:20px;">
      <div class="col card">
        <div class="muted small">Destinataire</div>
        <div><strong>${clientName || 'Client'}</strong></div>
        <div class="small">${d.customer.email} · ${d.customer.telephone}</div>
      </div>
      <div class="col card">
        <div class="muted small">Résumé de la mission</div>
        <div class="chips">
          <span class="chip">Véhicule: ${d.form.vehicle_type}</span>
          <span class="chip">Option: ${d.form.option}</span>
          <span class="chip">Immat: ${d.form.plate}</span>
          <span class="chip">Distance: ${d.distance_km.toFixed(1)} km</span>
          ${backTrip ? `<span class="chip">Aller-retour</span>` : `<span class="chip">Aller simple</span>`}
        </div>
      </div>
    </div>

    <h2>Trajet</h2>
    <div class="card">
      <div class="small"><strong>Aller :</strong> ${trajet1}</div>
      ${trajet2 ? `<div class="small" style="margin-top:6px;"><strong>Retour :</strong> ${trajet2}</div>` : ''}
    </div>

    <h2>Détail</h2>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Qté</th>
          <th class="right">Prix unit. HT</th>
          <th class="right">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Prestation de transport (${d.form.vehicle_type}, ${d.form.option})<br/>
            <span class="muted small">${trajet1}${trajet2 ? ` · ${trajet2}` : ''} · ${d.distance_km.toFixed(1)} km</span>
          </td>
          <td class="right">1</td>
          <td class="right">—</td>
          <td class="right">${eur(d.pricing.price_ht)}</td>
        </tr>
      </tbody>
    </table>

    <table class="totals">
      <tr>
        <td class="label">Sous-total HT</td>
        <td class="right">${eur(d.pricing.price_ht)}</td>
      </tr>
      <tr>
        <td class="label">TVA</td>
        <td class="right">${eur(d.pricing.tva)}</td>
      </tr>
      <tr>
        <td class="label"><strong>Total TTC</strong></td>
        <td class="right"><strong>${eur(d.pricing.price_ttc)}</strong></td>
      </tr>
    </table>

    ${d.notes ? `<div class="card" style="margin-top:16px;"><div class="muted small">Notes</div><div class="small">${d.notes}</div></div>` : ''}

    <footer>
      <div>
        ${d.company.siret ? `SIRET: ${d.company.siret} · ` : ''}${d.company.tva ? `TVA: ${d.company.tva}` : ''}
        ${d.company.site ? ` · ${d.company.site}` : ''}
      </div>
      <div>Devis valable sous réserve de disponibilité et conditions de circulation.</div>
    </footer>
  </section>
</body>
</html>`
}
