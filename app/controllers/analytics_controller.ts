import type { HttpContext } from '@adonisjs/core/http'
import { AnalyticsService } from '#services/analytics_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class AnalyticsController {
  async index({ auth, inertia, response, session }: HttpContext) {
    // Only church_admin and super_admin can access analytics
    if (auth.user!.isVisitorRole()) {
      return response.redirect('/visitor/dashboard')
    }

    const analyticsService = new AnalyticsService()

    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return inertia.render('analytics', {
          analytics: null,
          error: 'No church found for this account',
        })
      }

      // Get current month and year for initial load
      const now = new Date()
      const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed
      const currentYear = now.getFullYear()

      // Load with "all time" by default (no month/year filter)
      const analytics = await analyticsService.getAnalytics(church.id, {})

      return inertia.render('analytics', {
        analytics,
        currentMonth,
        currentYear,
        error: null,
      })
    } catch (error) {
      console.error('[ANALYTICS ERROR]', error)
      return inertia.render('analytics', {
        analytics: null,
        error: error instanceof Error ? error.message : 'Failed to load analytics',
      })
    }
  }

  async stats({ auth, request, response, session }: HttpContext) {
    // Only church_admin and super_admin can access analytics API
    if (auth.user!.isVisitorRole()) {
      return response.status(403).json({
        error: 'Access denied',
      })
    }

    const analyticsService = new AnalyticsService()

    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({
          error: 'No church found for this account',
        })
      }

      // Get filter params from query string
      const monthParam = request.input('month')
      const yearParam = request.input('year')

      const filter: { month?: number; year?: number } = {}

      // Only set month if it's a valid number (not "all")
      if (monthParam && monthParam !== 'all') {
        const month = parseInt(monthParam, 10)
        if (!isNaN(month) && month >= 1 && month <= 12) {
          filter.month = month
        }
      }

      // Only set year if it's a valid number (not "all")
      if (yearParam && yearParam !== 'all') {
        const year = parseInt(yearParam, 10)
        if (!isNaN(year) && year >= 2000 && year <= 2100) {
          filter.year = year
        }
      }

      const analytics = await analyticsService.getAnalytics(church.id, filter)

      return response.json(analytics)
    } catch (error) {
      console.error('[ANALYTICS API ERROR]', error)
      return response.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      })
    }
  }
}
