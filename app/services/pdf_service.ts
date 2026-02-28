import puppeteer from 'puppeteer'

export default class PdfService {
  /**
   * Generate PDF from HTML content
   */
  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }

  /**
   * Generate PDF from welcome pack data
   */
  async generateWelcomePackPdf(html: string): Promise<Buffer> {
    return this.generatePdfFromHtml(html)
  }
}
