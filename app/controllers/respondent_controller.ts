import type { HttpContext } from '@adonisjs/core/http'
import { RespondentService } from '#services/respondent_service'
import { TrackingCodeService } from '#services/tracking_code_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'
import type { RespondentStatus } from '#models/respondent'

export default class RespondentController {
  /**
   * Render public registration page
   * GET /r/:code (with tracking code)
   * GET /healthcheck-register (without tracking code)
   */
  async register({ params, inertia }: HttpContext) {
    const code = params.code || null
    let propertyAddress: string | null = null

    if (code) {
      const trackingCodeService = new TrackingCodeService()
      const property = await trackingCodeService.findPropertyByCode(code)
      if (property) {
        propertyAddress = property.address
      }
    }

    return inertia.render('healthcheck-register', {
      trackingCode: code,
      propertyAddress,
    })
  }

  /**
   * Handle public registration form submission
   * POST /api/healthcheck-register
   */
  async store({ request, response }: HttpContext) {
    const { name, email, phone, trackingCode } = request.only([
      'name',
      'email',
      'phone',
      'trackingCode',
    ])

    if (!name || !email) {
      return response.badRequest({ error: 'Name and email are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return response.badRequest({ error: 'Please provide a valid email address' })
    }

    try {
      const respondentService = new RespondentService()
      await respondentService.register({ name, email, phone, trackingCode })
      return response.ok({ message: 'Registration successful' })
    } catch (error) {
      console.error('Respondent registration error:', error)
      return response.internalServerError({
        error: 'Registration failed. Please try again.',
      })
    }
  }

  /**
   * List respondents for authenticated admin
   * GET /api/respondents
   */
  async index({ auth, response, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })
    if (!church) {
      return response.ok({ respondents: [] })
    }

    const respondentService = new RespondentService()
    const respondents = await respondentService.getRespondentsForChurch(church.id)

    return response.ok({
      respondents: respondents.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        trackingCode: r.trackingCode,
        status: r.status,
        propertyAddress: r.property?.address || null,
        notes: r.notes,
        createdAt: r.createdAt?.toISO() || null,
      })),
    })
  }

  /**
   * Update respondent status
   * PUT /api/respondents/:id
   */
  async update({ params, request, response }: HttpContext) {
    const { status, notes } = request.only(['status', 'notes'])

    const validStatuses: RespondentStatus[] = [
      'new',
      'contacted',
      'healthcheck_scheduled',
      'healthcheck_completed',
    ]
    if (status && !validStatuses.includes(status)) {
      return response.badRequest({ error: 'Invalid status' })
    }

    try {
      const respondentService = new RespondentService()
      const respondent = await respondentService.updateStatus(params.id, status, notes)
      return response.ok({ respondent })
    } catch (error) {
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Update failed',
      })
    }
  }
}
