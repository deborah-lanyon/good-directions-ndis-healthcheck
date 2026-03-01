import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import env from '#start/env'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: async (ctx) => {
      const user = ctx.auth?.user
      if (!user) return null

      const Church = (await import('#models/church')).default

      // Resolve church — check demo mode first, then user's own church
      let church = null
      const demoChurchId = ctx.session?.get('demo_church_id')
      if (demoChurchId) {
        church = await Church.find(demoChurchId)
      }
      if (!church) {
        church = await Church.query().where('user_id', user.id).first()
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        adminApprovalStatus: user.adminApprovalStatus,
        hasChurch: !!church,
        churchName: church?.churchName || null,
      }
    },
    flash: (ctx) => ({
      success: ctx.session?.flashMessages.get('success') || null,
      error: ctx.session?.flashMessages.get('error') || null,
    }),
    adminEmail: () => env.get('ADMIN_EMAIL'),
    isImpersonating: (ctx) => ctx.session?.get('impersonating_from') !== undefined,
    viewMode: (ctx) => ctx.session?.get('view_mode', 'admin'),
    demoMode: (ctx) => ctx.session?.get('demo_mode') || null,
    actingAsVisitor: async (ctx) => {
      const visitorId = ctx.session?.get('acting_as_visitor_id')
      if (!visitorId) return null
      const Visitor = (await import('#models/visitor')).default
      const visitor = await Visitor.find(visitorId)
      return visitor ? { id: visitor.id, name: visitor.name } : null
    },
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
