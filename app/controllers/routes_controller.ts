import type { HttpContext } from '@adonisjs/core/http'
import RouteService from '#services/route_service'
import Visitor from '#models/visitor'

export default class RoutesController {
  /**
   * Plan an optimized route for property visits
   * POST /api/routes/plan
   */
  async plan({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      // Get property IDs from request
      const { propertyIds } = request.only(['propertyIds'])

      if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
        return response.badRequest({
          error: 'Please select at least one property to plan a route',
        })
      }

      // Get church - either from user's church or visitor's church
      let church

      if (user.isVisitorRole()) {
        // For visitors, get church from visitor record
        const visitor = await Visitor.query().where('user_id', user.id).preload('church').first()
        if (!visitor) {
          return response.badRequest({
            error: 'Visitor record not found',
          })
        }
        church = visitor.church
      } else {
        // For church admins, get church from user relationship
        church = await user.related('church').query().first()
      }

      if (!church) {
        return response.badRequest({
          error: 'You must set up your territory before planning routes',
        })
      }

      // Plan the route
      const routeService = new RouteService()
      const route = await routeService.optimizeRoute(church.id, propertyIds)

      return response.ok({ route })
    } catch (error) {
      console.error('Error planning route:', error)

      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to plan route',
      })
    }
  }

  /**
   * Plan an optimized route for a street group
   * POST /api/routes/plan-street-group
   */
  async planStreetGroup({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      // Get street group ID from request
      const { streetGroupId } = request.only(['streetGroupId'])

      if (!streetGroupId) {
        return response.badRequest({
          error: 'Street group ID is required',
        })
      }

      // Get user's church
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your territory before planning routes',
        })
      }

      // Plan the route for the street group
      const routeService = new RouteService()
      const route = await routeService.optimizeRouteForStreetGroup(church.id, streetGroupId)

      return response.ok({ route })
    } catch (error) {
      console.error('Error planning street group route:', error)

      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to plan route',
      })
    }
  }
}
