import PDFDocument from 'pdfkit'
import type Property from '#models/property'

// Avery L7160: 63.5mm x 38.1mm, 3 columns x 7 rows = 21 per A4 sheet
// All measurements in PDF points (1mm = 2.835pt)
const MM = 2.835

const LABEL_WIDTH = 63.5 * MM
const LABEL_HEIGHT = 38.1 * MM
const COLS = 3
const ROWS = 7
const LABELS_PER_PAGE = COLS * ROWS

// Page margins (Avery L7160 spec)
const MARGIN_TOP = 15.1 * MM
const MARGIN_LEFT = 7.2 * MM

// Internal label padding
const PAD_X = 4 * MM
const PAD_Y = 3 * MM

export class LabelPdfService {
  async generateLabels(properties: Property[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: false,
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const labels = properties.map((p) => ({
        address: p.address,
        trackingCode: p.trackingCode,
      }))

      for (let i = 0; i < labels.length; i += LABELS_PER_PAGE) {
        doc.addPage()
        const pageLabels = labels.slice(i, i + LABELS_PER_PAGE)

        pageLabels.forEach((label, idx) => {
          const col = idx % COLS
          const row = Math.floor(idx / COLS)

          const x = MARGIN_LEFT + col * LABEL_WIDTH
          const y = MARGIN_TOP + row * LABEL_HEIGHT

          // Address text
          const addressLines = this.formatAddress(label.address)
          doc
            .font('Helvetica')
            .fontSize(9)
            .text(addressLines, x + PAD_X, y + PAD_Y, {
              width: LABEL_WIDTH - PAD_X * 2,
              height: LABEL_HEIGHT - PAD_Y * 2 - 10,
              lineGap: 1.5,
            })

          // Tracking code (bottom-right, small grey text)
          if (label.trackingCode) {
            doc
              .font('Courier')
              .fontSize(6)
              .fillColor('#999999')
              .text(
                label.trackingCode,
                x + PAD_X,
                y + LABEL_HEIGHT - PAD_Y - 7,
                {
                  width: LABEL_WIDTH - PAD_X * 2,
                  align: 'right',
                }
              )
              .fillColor('#000000')
          }
        })
      }

      doc.end()
    })
  }

  private formatAddress(address: string): string {
    // Split on commas and state abbreviations for multi-line labels
    return address
      .replace(/,\s*/g, '\n')
      .replace(/\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+/gi, '\n$1 ')
  }
}
