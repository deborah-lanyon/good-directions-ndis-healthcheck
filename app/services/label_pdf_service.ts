import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import type Property from '#models/property'

// Custom layout: 2 columns x 5 rows = 10 per A4 sheet
// A4 = 210mm x 297mm
// All measurements in PDF points (1mm = 2.835pt)
const MM = 2.835

const PAGE_WIDTH = 210 * MM
const PAGE_HEIGHT = 297 * MM

const COLS = 2
const ROWS = 5
const LABELS_PER_PAGE = COLS * ROWS

// Margins
const MARGIN_TOP = 13.5 * MM
const MARGIN_LEFT = 7 * MM

// Label dimensions (calculated to fill the page)
const LABEL_WIDTH = (PAGE_WIDTH - MARGIN_LEFT * 2) / COLS // ~98mm
const LABEL_HEIGHT = (PAGE_HEIGHT - MARGIN_TOP * 2) / ROWS // ~54mm

// Internal label padding
const PAD_X = 6 * MM
const PAD_Y = 5 * MM

// QR code size
const QR_SIZE = 30 * MM

export class LabelPdfService {
  async generateLabels(
    properties: Property[],
    options: { territoryName?: string; baseUrl?: string } = {}
  ): Promise<Buffer> {
    // Pre-generate all QR codes as PNG buffers
    const qrBuffers = new Map<string, Buffer>()
    for (const p of properties) {
      if (p.trackingCode && options.baseUrl) {
        const url = `${options.baseUrl}/r/${p.trackingCode}`
        const pngBuffer = await QRCode.toBuffer(url, {
          width: 200,
          margin: 0,
          errorCorrectionLevel: 'M',
        })
        qrBuffers.set(p.trackingCode, pngBuffer)
      }
    }

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

          // Calculate text area width (leave room for QR code if present)
          const hasQr = label.trackingCode && qrBuffers.has(label.trackingCode)
          const textWidth = hasQr
            ? LABEL_WIDTH - PAD_X * 2 - QR_SIZE - 3 * MM
            : LABEL_WIDTH - PAD_X * 2

          // "The Occupant" header
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000000')
            .text('The Occupant', x + PAD_X, y + PAD_Y, {
              width: textWidth,
            })

          // Address text
          const addressLines = this.formatAddress(label.address)
          doc
            .font('Helvetica')
            .fontSize(12)
            .text(addressLines, x + PAD_X, y + PAD_Y + 18, {
              width: textWidth,
              height: LABEL_HEIGHT - PAD_Y * 2 - 28,
              lineGap: 2,
            })

          // Tracking code (bottom-left, small grey text)
          if (label.trackingCode) {
            doc
              .font('Courier')
              .fontSize(7)
              .fillColor('#999999')
              .text(
                label.trackingCode,
                x + PAD_X,
                y + LABEL_HEIGHT - PAD_Y - 9,
                {
                  width: textWidth,
                  align: 'left',
                }
              )
              .fillColor('#000000')
          }

          // QR code (right side of label, vertically centred)
          if (hasQr) {
            const qrBuf = qrBuffers.get(label.trackingCode!)!
            const qrX = x + LABEL_WIDTH - PAD_X - QR_SIZE
            const qrY = y + (LABEL_HEIGHT - QR_SIZE) / 2
            doc.image(qrBuf, qrX, qrY, { width: QR_SIZE, height: QR_SIZE })
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
