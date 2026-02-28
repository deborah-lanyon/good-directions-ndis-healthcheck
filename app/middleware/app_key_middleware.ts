import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class AppKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const authorization = request.header('authorization') || ''
    const expected = env.get('APP_KEY')
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null
    if (!token || token !== expected) {
      return response.unauthorized({ error: 'Unauthorized' })
    }
    return next()
  }
}
