import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import Visitor from '#models/visitor'

/**
 * Middleware to ensure user is a visitor with a linked account
 * Also preloads the visitor record for use in controllers
 *
 * Special case: Super admins in demo mode can access visitor routes
 * using the demo visitor account.
 */
export default class VisitorMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'You must be logged in' })
    }

    // Check for super admin in demo mode
    if (user.isSuperAdminRole()) {
      const demoMode = session.get('demo_mode')

      // Super admin acting as a specific visitor (from "View as Visitor" button in demo mode)
      const actingAsVisitorId = session.get('acting_as_visitor_id')
      if (actingAsVisitorId && demoMode) {
        const actingVisitor = await Visitor.query()
          .where('id', actingAsVisitorId)
          .preload('church')
          .preload('streetGroups')
          .first()

        if (actingVisitor) {
          ;(auth as any).visitor = actingVisitor
          ;(auth as any).isActingAsVisitor = true
          ;(auth as any).isDemoMode = true
          return next()
        }
        session.forget('acting_as_visitor_id')
      }

      // Super admin in demo visitor mode (generic demo visitor)
      const demoVisitorId = session.get('demo_visitor_id')
      if (demoMode === 'visitor' && demoVisitorId) {
        const demoVisitor = await Visitor.query()
          .where('id', demoVisitorId)
          .preload('church')
          .preload('streetGroups')
          .first()

        if (demoVisitor) {
          ;(auth as any).visitor = demoVisitor
          ;(auth as any).isDemoMode = true
          return next()
        }
      }

      // Super admin not in any visitor mode - deny access
      return response.forbidden({
        message: 'This area is only accessible to visitors. Use demo mode to preview as a visitor.',
      })
    }

    // Check for church admin acting as a visitor
    if (user.role === 'church_admin') {
      const actingAsVisitorId = session.get('acting_as_visitor_id')
      if (actingAsVisitorId) {
        const actingVisitor = await Visitor.query()
          .where('id', actingAsVisitorId)
          .preload('church')
          .preload('streetGroups')
          .first()

        // Verify visitor belongs to admin's church
        if (actingVisitor) {
          const Church = (await import('#models/church')).default
          const church = await Church.query().where('user_id', user.id).first()
          if (church && actingVisitor.churchId === church.id) {
            ;(auth as any).visitor = actingVisitor
            ;(auth as any).isActingAsVisitor = true
            return next()
          }
        }
        // Invalid - clear stale session
        session.forget('acting_as_visitor_id')
      }
      return response.forbidden({
        message: 'This area is only accessible to visitors',
      })
    }

    // Check if user has visitor role
    if (!user.isVisitorRole()) {
      return response.forbidden({
        message: 'This area is only accessible to visitors',
      })
    }

    // Verify user has a linked visitor record
    const visitor = await Visitor.query()
      .where('user_id', user.id)
      .preload('church')
      .preload('streetGroups')
      .first()

    if (!visitor) {
      return response.forbidden({
        message: 'No visitor account found. Please contact your administrator.',
      })
    }

    // Update last login timestamp
    visitor.lastLoginAt = DateTime.now()
    await visitor.save()

    // Attach visitor to context for easy access in controllers
    ;(auth as any).visitor = visitor

    return next()
  }
}
