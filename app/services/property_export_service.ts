import ExcelJS from 'exceljs'
import Property from '#models/property'
import StreetGroup from '#models/street_group'
import Visitor from '#models/visitor'

export default class PropertyExportService {
  /**
   * Export properties by street group to Excel
   */
  async exportByStreetGroup(streetGroupId: number): Promise<ExcelJS.Workbook> {
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('church')
      .preload('streetAssignments')
      .preload('visitors')
      .first()

    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    const streetNames = streetGroup.streetAssignments.map((assignment) => assignment.streetName)

    if (streetNames.length === 0) {
      // Return empty workbook if no streets assigned
      return this.createExcelWorkbook([])
    }

    const properties = await Property.query()
      .where('church_id', streetGroup.church.id)
      .whereIn('street_name', streetNames)
      .orderBy('street_name', 'asc')
      .orderBy('address', 'asc')

    return this.createExcelWorkbook(properties)
  }

  /**
   * Export properties by visitor to Excel
   */
  async exportByVisitor(visitorId: number): Promise<ExcelJS.Workbook> {
    const visitor = await Visitor.query()
      .where('id', visitorId)
      .preload('church')
      .preload('streetGroups', (query) => {
        query.preload('streetAssignments')
      })
      .first()

    if (!visitor) {
      throw new Error('Visitor not found')
    }

    // Collect all street names from all street groups assigned to this visitor
    const streetNames: string[] = []
    for (const streetGroup of visitor.streetGroups) {
      const names = streetGroup.streetAssignments.map((assignment) => assignment.streetName)
      streetNames.push(...names)
    }

    if (streetNames.length === 0) {
      return this.createExcelWorkbook([])
    }

    const properties = await Property.query()
      .where('church_id', visitor.church.id)
      .whereIn('street_name', streetNames)
      .orderBy('street_name', 'asc')
      .orderBy('address', 'asc')

    return this.createExcelWorkbook(properties)
  }

  /**
   * Create Excel workbook with property data
   */
  private createExcelWorkbook(properties: Property[]): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Properties')

    // Set up headers
    worksheet.columns = [
      { header: 'Address', key: 'address', width: 50 },
      { header: 'Visitor', key: 'visitor', width: 25 },
      { header: 'Feedback Status', key: 'feedbackStatus', width: 20 },
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    }

    // Add data rows
    properties.forEach((property) => {
      worksheet.addRow({
        address: property.address,
        visitor: property.visitor || '',
        feedbackStatus: property.feedbackStatus || 'pending',
      })
    })

    // Add summary row
    worksheet.addRow([])
    const summaryRow = worksheet.addRow(['Total Properties:', properties.length])
    summaryRow.font = { bold: true }

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: 'C1',
    }

    return workbook
  }

  /**
   * Export a custom list of properties to Excel
   */
  async exportPropertyList(propertyIds: number[]): Promise<ExcelJS.Workbook> {
    const properties = await Property.query().whereIn('id', propertyIds).orderBy('address', 'asc')

    return this.createExcelWorkbook(properties)
  }

  /**
   * Get workbook as buffer for download
   */
  async getWorkbookBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
