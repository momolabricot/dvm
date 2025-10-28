// lib/pdf.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer'


export async function renderQuotePDF(html: string, outPath: string): Promise<void> {
  // S'assurer que le dossier cible existe
  const dir = path.dirname(outPath)
  await fs.mkdir(dir, { recursive: true })

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    })

    await fs.writeFile(outPath, pdfBuffer)
    await fs.access(outPath)
  } finally {
    await browser.close().catch(() => {})
  }
}
