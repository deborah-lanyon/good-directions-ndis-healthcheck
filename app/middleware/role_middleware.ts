import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * Middleware to check if user has required role(s)
 * Usage: .use(middleware.role(['church_admin', 'super_admin']))
 */
export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'You must be logged in' })
    }

    // Super admins have access to everything
    if (user.isSuperAdminRole()) {
      return next()
    }

    // Check if user has one of the required roles
    const hasRequiredRole = options.roles.includes(user.role)

    if (!hasRequiredRole) {
      return response.forbidden({
        message: 'You do not have permission to access this resource',
      })
    }

    return next()
  }
}
