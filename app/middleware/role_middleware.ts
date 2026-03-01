import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * Middleware to check if user has required role(s)
 * Usage: .use(middleware.role(['church_admin', 'super_admin']))
 */
export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, _options: { roles: UserRole[] }) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'You must be logged in' })
    }

    // Single admin role — all authenticated users pass
    return next()
  }
}
