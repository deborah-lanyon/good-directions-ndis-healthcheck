import type { HttpContext } from '@adonisjs/core/http'
import Church from '#models/church'

/**
 * Resolves the territory for the current request.
 * Checks session for a selected territory, falls back to user's linked territory.
 */
export async function resolveChurchForUser({ auth, session }: Pick<HttpContext, 'auth' | 'session'>): Promise<Church | null> {
  // Check for selected territory in session (set via admin panel or login)
  const selectedChurchId = session.get('selected_church_id')
  if (selectedChurchId) {
    const church = await Church.find(selectedChurchId)
    if (church) return church
  }

  // Fall back to user's linked territory (backward compat)
  const user = auth.user!
  return Church.query().where('user_id', user.id).first()
}
