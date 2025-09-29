import puppeteer from 'puppeteer'
export async function renderQuotePDF(html:string, outPath:string){
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']})
  try{
    const page = await browser.newPage()
    await page.setContent(html, {waitUntil:'networkidle0'})
    await page.pdf({path: outPath, format:'A4', printBackground:true, margin:{top:'20mm', bottom:'20mm', left:'15mm', right:'15mm'}})
  } finally { await browser.close() }
}
