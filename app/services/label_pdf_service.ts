import PdfService from '#services/pdf_service'
import type Property from '#models/property'

interface LabelData {
  address: string
  trackingCode: string | null
}

export class LabelPdfService {
  private pdfService: PdfService

  constructor() {
    this.pdfService = new PdfService()
  }

  /**
   * Generate address label PDF for Avery L7160 (63.5mm x 38.1mm, 3 columns x 7 rows = 21 per sheet)
   */
  async generateLabels(properties: Property[]): Promise<Buffer> {
    const labels: LabelData[] = properties.map((p) => ({
      address: p.address,
      trackingCode: p.trackingCode,
    }))

    const html = this.buildLabelHtml(labels)
    return this.pdfService.generatePdfFromHtml(html)
  }

  private buildLabelHtml(labels: LabelData[]): string {
    // Avery L7160: 21 labels per A4 sheet (3 columns x 7 rows)
    // Label dimensions: 63.5mm x 38.1mm
    // Page margins: ~5mm top/bottom, ~7mm left/right
    const labelsPerPage = 21
    const pages: string[] = []

    for (let i = 0; i < labels.length; i += labelsPerPage) {
      const pageLabels = labels.slice(i, i + labelsPerPage)
      const cells = pageLabels
        .map((label) => {
          const addressLines = this.formatAddress(label.address)
          return `
            <div class="label">
              <div class="label-content">
                <div class="address">${addressLines}</div>
                ${label.trackingCode ? `<div class="tracking-code">${label.trackingCode}</div>` : ''}
              </div>
            </div>`
        })
        .join('\n')

      // Pad with empty cells to fill the grid
      const emptyCount = labelsPerPage - pageLabels.length
      const emptyCells = Array(emptyCount)
        .fill('<div class="label"></div>')
        .join('\n')

      pages.push(`
        <div class="page">
          <div class="grid">
            ${cells}
            ${emptyCells}
          </div>
        </div>`)
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      color: #000;
    }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 15.1mm 7.2mm 15.1mm 7.2mm;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 63.5mm);
      grid-template-rows: repeat(7, 38.1mm);
      gap: 0;
      width: 100%;
      height: 100%;
    }
    .label {
      width: 63.5mm;
      height: 38.1mm;
      padding: 3mm 4mm;
      overflow: hidden;
      position: relative;
    }
    .label-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .address {
      font-size: 9px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .tracking-code {
      position: absolute;
      bottom: 3mm;
      right: 4mm;
      font-size: 7px;
      color: #999;
      font-family: monospace;
    }
  </style>
</head>
<body>
  ${pages.join('\n')}
</body>
</html>`
  }

  private formatAddress(address: string): string {
    // Split long addresses into lines for better label readability
    // Common Australian address format: "Unit/Number Street, Suburb STATE Postcode"
    return address
      .replace(/,\s*/g, '<br>')
      .replace(/\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+/gi, '<br>$1 ')
  }
}
