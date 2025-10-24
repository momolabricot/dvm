// lib/pdf.ts
import puppeteer from 'puppeteer'

/**
 * Rend un HTML en PDF (Buffer) via Puppeteer.
 * - Pas d'écriture disque
 * - Marges légères, format A4
 */
export async function renderQuotePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    // Ces flags évitent la majorité des soucis en conteneur / CI
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    })
    return pdf
  } finally {
    await browser.close()
  }
}
