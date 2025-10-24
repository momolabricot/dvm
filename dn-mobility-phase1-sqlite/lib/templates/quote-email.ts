// lib/templates/quote-email.ts
type EmailArgs = {
  to: { prenom: string; nom: string }
  companyName: string
  quote_no: string
  distance_km: number
  pricing: { price_ht:number; tva:number; price_ttc:number }
  downloadUrl?: string // si tu envoies un lien, sinon on dira "en pièce jointe"
}

function eur(n:number){ return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n) }

export function buildQuoteEmail(args: EmailArgs){
  const name = [args.to.prenom, args.to.nom].filter(Boolean).join(' ') || 'Bonjour'
  const subject = `Votre devis ${args.companyName} — #${args.quote_no}`

  const button = args.downloadUrl ? `
    <tr>
      <td align="center" style="padding:24px 0 8px;">
        <a href="${args.downloadUrl}"
           style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600">
          Télécharger le devis (PDF)
        </a>
      </td>
    </tr>` : `
    <tr>
      <td align="center" style="padding:24px 0 8px;color:#6b7280;font:14px/20px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
        Le devis est en pièce jointe (PDF).
      </td>
    </tr>`

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#f5f7fb;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,.06);overflow:hidden">
          <tr>
            <td style="padding:22px 24px;border-bottom:1px solid #eef0f4;font:600 16px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111827">
              ${args.companyName}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;font:14px/22px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111827">
              <p style="margin:0 0 10px;">${name},</p>
              <p style="margin:0 0 10px;">Voici votre devis <strong>#${args.quote_no}</strong>.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:10px;background:#f9fafb;border:1px solid #eef0f4;border-radius:10px;width:100%;">
                <tr>
                  <td style="padding:12px 14px;font:13px/20px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;color:#374151;">
                    Distance estimée&nbsp;: <strong>${args.distance_km.toFixed(1)} km</strong><br/>
                    Total TTC&nbsp;: <strong>${eur(args.pricing.price_ttc)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${button}
          <tr>
            <td style="padding:18px 24px 24px;color:#6b7280;font:12px/18px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
              Si vous avez des questions, répondez à ce message — nous sommes là pour vous aider.
            </td>
          </tr>
        </table>
        <div style="padding:14px 0 0;color:#9ca3af;font:11px/16px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
          © ${new Date().getFullYear()} ${args.companyName}
        </div>
      </td>
    </tr>
  </table>
</body></html>`

  return { subject, html }
}
