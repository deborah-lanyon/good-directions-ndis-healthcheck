import type { HttpContext } from '@adonisjs/core/http'
import VisitorService from '#services/visitor_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class VisitorsController {
  private visitorService = new VisitorService()

  /**
   * Get all visitors for a street group
   */
  async index({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitors = await this.visitorService.getVisitorsForStreetGroup(params.streetGroupId)
      return response.json(visitors)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch visitors', error: error.message })
    }
  }

  /**
   * Get all visitors for a church (deprecated - use listAll instead)
   */
  async territoryVisitors({ auth, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitors = await this.visitorService.getVisitorsForChurch(church.id)
      return response.json(visitors)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to fetch visitors', error: error.message })
    }
  }

  /**
   * Get a single visitor by ID
   */
  async show({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitor = await this.visitorService.getVisitorById(params.id)

      if (!visitor) {
        return response.status(404).json({ message: 'Visitor not found' })
      }

      return response.json(visitor)
    } catch (error) {
      return response.status(500).json({ message: 'Failed to fetch visitor', error: error.message })
    }
  }

  /**
   * Create a new visitor (church-level)
   */
  async store({ auth, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        session.flash('error', 'Church profile not found')
        return response.redirect().back()
      }

      const data = request.only(['name', 'email', 'phone', 'streetGroupIds'])
      const visitor = await this.visitorService.createVisitor(church.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
      })

      // Attach to street groups if provided
      if (data.streetGroupIds && Array.isArray(data.streetGroupIds)) {
        await this.visitorService.attachToStreetGroups(visitor.id, data.streetGroupIds)
      }

      session.flash('success', 'Team member added successfully')
      return response.redirect().back()
    } catch (error: any) {
      // Check for duplicate email constraint violation
      if (error.message?.includes('visitors_email_unique') || error.code === '23505') {
        session.flash('error', 'This email address is already in use by another team member')
      } else {
        session.flash('error', error.message || 'Failed to add team member')
      }
      return response.redirect().back()
    }
  }

  /**
   * Update a visitor
   */
  async update({ auth, params, request, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        session.flash('error', 'Church profile not found')
        return response.redirect().back()
      }

      const visitor = await this.visitorService.getVisitorById(params.id)

      if (!visitor) {
        session.flash('error', 'Visitor not found')
        return response.redirect().back()
      }

      const data = request.only(['name', 'email', 'phone', 'streetGroupId'])
      await this.visitorService.updateVisitor(params.id, data)

      session.flash('success', 'Team member updated successfully')
      return response.redirect().back()
    } catch (error: any) {
      // Check for duplicate email constraint violation
      if (error.message?.includes('visitors_email_unique') || error.code === '23505') {
        session.flash('error', 'This email address is already in use by another team member')
      } else {
        session.flash('error', error.message || 'Failed to update team member')
      }
      return response.redirect().back()
    }
  }

  /**
   * Delete a visitor
   */
  async destroy({ auth, params, response, inertia, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitor = await this.visitorService.getVisitorById(params.id)

      if (!visitor) {
        return response.status(404).json({ message: 'Visitor not found' })
      }

      if (visitor.isAdminVisitor) {
        return response
          .status(403)
          .json({ message: 'Admin visitor records cannot be deleted. Use the toggle on Church Profile instead.' })
      }

      await this.visitorService.deleteVisitor(params.id)

      // Redirect back to the team management page
      return inertia.location('/team-management')
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to delete visitor', error: error.message })
    }
  }

  /**
   * Send invitation email to visitor
   */
  async sendInvitation({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        session.flash('error', 'Church profile not found')
        return response.redirect().back()
      }

      const visitor = await this.visitorService.getVisitorById(params.id)
      if (!visitor) {
        session.flash('error', 'Visitor not found')
        return response.redirect().back()
      }

      // Verify visitor belongs to user's church
      if (visitor.church.id !== church.id) {
        session.flash('error', 'Unauthorized access to visitor')
        return response.redirect().back()
      }

      await this.visitorService.sendInvitation(params.id)

      session.flash('success', 'Invitation sent successfully')
      return response.redirect().back()
    } catch (error: any) {
      console.error('Failed to send invitation:', error)
      session.flash('error', error.message || 'Failed to send invitation')
      return response.redirect().back()
    }
  }

  /**
   * Revoke visitor account access
   */
  async revokeAccess({ auth, params, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        session.flash('error', 'Church profile not found')
        return response.redirect().back()
      }

      const visitor = await this.visitorService.getVisitorById(params.id)
      if (!visitor) {
        session.flash('error', 'Visitor not found')
        return response.redirect().back()
      }

      // Verify visitor belongs to user's church
      if (visitor.church.id !== church.id) {
        session.flash('error', 'Unauthorized access to visitor')
        return response.redirect().back()
      }

      await this.visitorService.revokeAccess(params.id)

      session.flash('success', 'Access revoked successfully')
      return response.redirect().back()
    } catch (error: any) {
      console.error('Failed to revoke access:', error)
      session.flash('error', error.message || 'Failed to revoke access')
      return response.redirect().back()
    }
  }

  /**
   * Get all visitors for the authenticated user's church (API endpoint)
   */
  async getAllForChurch({ auth, response, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitors = await this.visitorService.getAllVisitorsForChurch(church.id)

      // Return simplified visitor data for dropdown
      const visitorData = visitors.map((v) => ({
        id: v.id,
        name: v.name,
        email: v.email || null,
        hasStreetGroups: v.streetGroups && v.streetGroups.length > 0,
      }))

      return response.json(visitorData)
    } catch (error) {
      console.error('[GET ALL VISITORS ERROR]', error)
      return response
        .status(500)
        .json({ message: 'Failed to fetch visitors', error: error.message })
    }
  }

  /**
   * Get all visitors for the authenticated user's church
   */
  async listAll({ auth, inertia, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return inertia.render('errors/not_found')
      }

      const visitors = await this.visitorService.getAllVisitorsForChurch(church.id)

      // Serialize visitors to plain objects for Inertia
      const serializedVisitors = visitors.map((v) => {
        const serialized: any = v.serialize()
        // Ensure streetGroups is serialized if loaded
        if (v.streetGroups) {
          serialized.streetGroups = v.streetGroups.map((sg) => ({
            id: sg.id,
            name: sg.name,
          }))
        }
        return serialized
      })

      return inertia.render('visitors', { visitors: serializedVisitors })
    } catch (error) {
      console.error('[VISITORS PAGE ERROR]', error)
      throw error
    }
  }

  /**
   * Start acting as a visitor (church admin or super admin in demo mode)
   */
  async actAsVisitor({ auth, params, response, session, inertia }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.forbidden({ message: 'You must be logged in' })
    }

    const isDemoMode = user.isSuperAdminRole() && !!session.get('demo_mode')
    if (user.role !== 'admin' && !isDemoMode) {
      return response.forbidden({ message: 'Only church admins can use this feature' })
    }

    try {
      const church = await resolveChurchForUser({ auth, session })
      if (!church) {
        return response.status(404).json({ message: 'Church profile not found' })
      }

      const visitor = await this.visitorService.getVisitorById(params.id)
      if (!visitor) {
        return response.status(404).json({ message: 'Visitor not found' })
      }

      // Verify visitor belongs to admin's church
      if (visitor.churchId !== church.id) {
        return response.forbidden({ message: 'This visitor does not belong to your church' })
      }

      // Store in session
      session.put('acting_as_visitor_id', visitor.id)

      // Redirect to visitor dashboard
      return inertia.location('/visitor/dashboard')
    } catch (error: any) {
      console.error('Failed to act as visitor:', error)
      return response.status(500).json({ message: 'Failed to switch to visitor view' })
    }
  }

  /**
   * Stop acting as a visitor and return to admin view
   */
  async stopActingAsVisitor({ auth, session, inertia }: HttpContext) {
    session.forget('acting_as_visitor_id')

    // If super admin in demo mode, go back to demo dashboard
    const user = auth.user
    if (user?.isSuperAdminRole() && session.get('demo_mode')) {
      return inertia.location('/dashboard')
    }

    return inertia.location('/team-management')
  }

  /**
   * Toggle admin-as-visitor: create or remove the admin's visitor record
   */
  async toggleAdminVisitor({ auth, request, response, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.forbidden({ message: 'You must be logged in' })
    }

    try {
      const church = await resolveChurchForUser({ auth, session })
      if (!church) {
        session.flash('error', 'Church profile not found')
        return response.redirect().back()
      }

      const enabled = request.input('enabled')

      if (enabled) {
        await this.visitorService.createVisitorForAdmin(user, church.id)
        session.flash('success', 'You are now also a visitor. Assign yourself to street groups in Team Management.')
      } else {
        await this.visitorService.removeAdminVisitor(user.id, church.id)
        session.flash('success', 'Visitor record removed. You will no longer receive visitor notifications.')
      }

      return response.redirect().back()
    } catch (error: any) {
      console.error('Failed to toggle admin visitor:', error)
      session.flash('error', error.message || 'Failed to update visitor status')
      return response.redirect().back()
    }
  }
}
