import { HttpContext } from '@adonisjs/core/http'
import { updateChurchProfileValidator } from '#validators/church_profile_validator'
import { ChurchService } from '#services/church_service'
import { GeocodingService } from '#services/geocoding_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'
import VisitorService from '#services/visitor_service'

export default class ChurchProfilesController {
  private visitorService = new VisitorService()

  async index({ auth, inertia, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })
    const user = auth.user!
    const adminVisitor = church ? await this.visitorService.getAdminVisitor(user.id, church.id) : null
    return inertia.render('territory-detail', { church, syncResult: null, adminVisitorEnabled: !!adminVisitor })
  }

  async update(ctx: HttpContext) {
    const church = await resolveChurchForUser({ auth: ctx.auth, session: ctx.session })

    if (!church) {
      return ctx.response.status(404).json({
        error: 'Church not found',
      })
    }

    const user = ctx.auth.user!
    const adminVisitor = await this.visitorService.getAdminVisitor(user.id, church.id)

    try {
      const payload = await ctx.request.validateUsing(updateChurchProfileValidator)
      const churchService = new ChurchService()
      const result = await churchService.updateProfile(church.userId!, payload)

      return ctx.inertia.render('territory-detail', {
        church: result.church,
        syncResult: result.syncResult,
        adminVisitorEnabled: !!adminVisitor,
      })
    } catch (error) {
      const formattedErrors: Record<string, string[]> = {}
      if (error.messages) {
        for (const message of error.messages) {
          if (!formattedErrors[message.field]) {
            formattedErrors[message.field] = []
          }
          formattedErrors[message.field].push(message.message)
        }
      }

      return ctx.inertia.render('territory-detail', {
        church,
        errors: formattedErrors,
        adminVisitorEnabled: !!adminVisitor,
      })
    }
  }
  async geocode(ctx: HttpContext) {
    const { request, response } = ctx
    const address = request.qs().address || request.input('address')

    try {
      const geocodingService = new GeocodingService()
      const result = await geocodingService.geocodeAddress(address)
      return response.json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred while geocoding the address'
      console.error('Geocoding error:', message)

      if (message === 'Address parameter is required') {
        return response.status(400).json({ error: message })
      }
      if (message.includes('No results found')) {
        return response.status(404).json({ error: message })
      }
      return response.status(500).json({ error: message })
    }
  }
}
