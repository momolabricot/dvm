// lib/quote-service.ts
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { prisma } from '@/lib/prisma'
import { nextQuoteNumber } from '@/lib/quote-number'
import { sendMail } from '@/lib/email'
import { renderQuotePDF } from '@/lib/pdf'

type Sim = {
  depart: string
  arrivee: string
  round_trip: boolean
  retour_depart?: string | null
  retour_arrivee?: string | null
  vehicle_type: 'citadine' | 'berline' | 'utilitaire' | 'vl_plateau'
  plate: string
  option: 'convoyeur' | 'plateau'
  depart_label?: string
  arrivee_label?: string
  retour_depart_label?: string
  retour_arrivee_label?: string
}

type Contact = {
  prenom: string
  nom: string
  email: string
  telephone: string
  consent?: boolean
  objet?: string
  message?: string
}

type Pricing = { price_ht: number; tva: number; price_ttc: number }

export async function saveQuoteAndEmail(
  sim: Sim,
  contact: Contact,
  distance_km: number,
  pricing: Pricing,
  baseUrl?: string
) {
  if (!sim || !sim.depart || !sim.arrivee) {
    throw new Error('saveQuoteAndEmail: simulation invalide (depart/arrivee manquant)')
  }

  // 1) Numéro de devis unique
  const quote_no = await nextQuoteNumber()

  // 1bis) Lier le devis à un client existant via l'email si possible
  let clientId: string | undefined
  const existing = await prisma.user.findUnique({
    where: { email: contact.email },
    select: { clientProfile: { select: { id: true, isActive: true } } },
  })
  if (existing?.clientProfile?.isActive) {
    clientId = existing.clientProfile.id
  }

  // 2) HTML du PDF
  const fmt = (n: number, frac = 2) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: frac, maximumFractionDigits: frac })

  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<title>Devis ${quote_no}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#111;padding:24px;}
  h1{font-size:20px;margin:0 0 8px;}
  h2{font-size:16px;margin:16px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px;}
  table{border-collapse:collapse;width:100%;}
  td,th{border:1px solid #ddd;padding:8px;vertical-align:top;}
  .right{text-align:right}
  .muted{color:#666}
</style>
</head><body>
  <h1>Devis ${quote_no}</h1>
  <p class="muted">${new Date().toLocaleString('fr-FR')}</p>

  <h2>Trajet</h2>
  <table>
    <tr><th>Départ</th><td>${sim.depart_label || sim.depart}</td></tr>
    <tr><th>Arrivée</th><td>${sim.arrivee_label || sim.arrivee}</td></tr>
    ${sim.round_trip ? `
      <tr><th>Retour — départ</th><td>${sim.retour_depart_label || sim.retour_depart || '-'}</td></tr>
      <tr><th>Retour — arrivée</th><td>${sim.retour_arrivee_label || sim.retour_arrivee || '-'}</td></tr>
    ` : ''}
    <tr><th>Aller-retour ?</th><td>${sim.round_trip ? 'Oui' : 'Non'}</td></tr>
    <tr><th>Distance totale</th><td>${fmt(distance_km, 1)} km</td></tr>
  </table>

  <h2>Véhicule</h2>
  <table>
    <tr><th>Type</th><td>${sim.vehicle_type}</td></tr>
    <tr><th>Immatriculation</th><td>${sim.plate}</td></tr>
    <tr><th>Option</th><td>${sim.option}</td></tr>
  </table>

  <h2>Prix</h2>
  <table>
    <tr><th>Prix HT</th><td class="right">${fmt(pricing.price_ht)} €</td></tr>
    <tr><th>TVA</th><td class="right">${fmt(pricing.tva)} €</td></tr>
    <tr><th>Total TTC</th><td class="right"><strong>${fmt(pricing.price_ttc)} €</strong></td></tr>
  </table>

  <h2>Contact</h2>
  <table>
    <tr><th>Nom</th><td>${contact.prenom} ${contact.nom}</td></tr>
    <tr><th>Email</th><td>${contact.email}</td></tr>
    <tr><th>Téléphone</th><td>${contact.telephone}</td></tr>
    ${contact.objet ? `<tr><th>Objet</th><td>${contact.objet}</td></tr>` : ''}
    ${contact.message ? `<tr><th>Message</th><td>${contact.message}</td></tr>` : ''}
  </table>
</body></html>`

  // 3) PDF temporaire (dans /tmp)
  const filename = `devis-${quote_no}.pdf`
  const outPath = path.join(os.tmpdir(), filename)

  // Génère le PDF et ATTEND l'écriture disque
  await renderQuotePDF(html, outPath)

  // Double-check d'existence (belt & suspenders)
  await fs.access(outPath)

  // 3bis) Enregistrer le devis en BDD
  await prisma.quote.create({
    data: {
      number: quote_no,
      clientId: clientId,
    },
  })

  // 4) Email avec PDF en pièce jointe
  const subject = contact.objet || `Votre devis ${quote_no}`
  const mailHtml = `
    <p>Bonjour ${contact.prenom},</p>
    <p>Vous trouverez ci-joint votre devis <strong>${quote_no}</strong>.</p>
    <p class="muted" style="color:#666">Distance: ${fmt(distance_km,1)} km — Total TTC: <strong>${fmt(pricing.price_ttc)} €</strong></p>
    <p>Bien cordialement,</p>
    <p>DN Mobility</p>
  `
  await sendMail(contact.email, subject, mailHtml, [
    { filename, path: outPath, contentType: 'application/pdf' },
  ])

  // Nettoyage silencieux
  try { await fs.unlink(outPath) } catch {}

  return quote_no
}
