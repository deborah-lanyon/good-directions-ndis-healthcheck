import type { HttpContext } from '@adonisjs/core/http'
import PropertyExportService from '#services/property_export_service'
import StreetGroupService from '#services/street_group_service'
import VisitorService from '#services/visitor_service'
import Church from '#models/church'

export default class ExportsController {
  private exportService = new PropertyExportService()
  private streetGroupService = new StreetGroupService()
  private visitorService = new VisitorService()

  /**
   * Export properties by street group
   */
  async exportStreetGroup({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const church = await Church.query().where('user_id', user.id).first()

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      // Verify street group belongs to user's church
      const streetGroup = await this.streetGroupService.getStreetGroupById(params.streetGroupId)
      if (!streetGroup || streetGroup.church.id !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to street group' })
      }

      const workbook = await this.exportService.exportByStreetGroup(params.streetGroupId)
      const buffer = await this.exportService.getWorkbookBuffer(workbook)

      response.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      response.header(
        'Content-Disposition',
        `attachment; filename="${streetGroup.name}-properties.xlsx"`
      )

      return response.send(buffer)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to export street group', error: error.message })
    }
  }

  /**
   * Export properties by visitor
   */
  async exportVisitor({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const church = await Church.query().where('user_id', user.id).first()

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      // Verify visitor belongs to user's church
      const visitor = await this.visitorService.getVisitorById(params.visitorId)
      if (!visitor || visitor.church.id !== church.id) {
        return response.status(403).json({ message: 'Unauthorized access to visitor' })
      }

      const workbook = await this.exportService.exportByVisitor(params.visitorId)
      const buffer = await this.exportService.getWorkbookBuffer(workbook)

      response.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      response.header(
        'Content-Disposition',
        `attachment; filename="${visitor.name}-properties.xlsx"`
      )

      return response.send(buffer)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to export visitor properties', error: error.message })
    }
  }

  /**
   * Export a custom list of properties
   */
  async exportPropertyList({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const church = await Church.query().where('user_id', user.id).first()

      if (!church) {
        return response.status(404).json({ message: 'Territory not found' })
      }

      const { propertyIds } = request.only(['propertyIds'])

      if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
        return response.status(400).json({ message: 'Property IDs are required' })
      }

      const workbook = await this.exportService.exportPropertyList(propertyIds)
      const buffer = await this.exportService.getWorkbookBuffer(workbook)

      const timestamp = new Date().toISOString().split('T')[0]
      response.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      response.header('Content-Disposition', `attachment; filename="properties-${timestamp}.xlsx"`)

      return response.send(buffer)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to export properties', error: error.message })
    }
  }
}
