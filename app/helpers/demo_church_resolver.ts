import type { HttpContext } from '@adonisjs/core/http'
import Church from '#models/church'

/**
 * Resolves the church for the current request, accounting for demo mode.
 * In demo mode, returns the demo church instead of the user's church.
 */
export async function resolveChurchForUser({ auth, session }: Pick<HttpContext, 'auth' | 'session'>): Promise<Church | null> {
  const user = auth.user!

  // Check for demo mode
  const demoMode = session.get('demo_mode')
  const demoChurchId = session.get('demo_church_id')

  if (user.isSuperAdminRole() && demoMode && demoChurchId) {
    return Church.find(demoChurchId)
  }

  // Normal mode - load user's church
  return Church.query().where('user_id', user.id).first()
}
