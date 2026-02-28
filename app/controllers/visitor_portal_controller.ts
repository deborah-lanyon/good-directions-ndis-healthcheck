import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { PropertyService } from '#services/property_service'
import Property from '#models/property'
import VisitorService from '#services/visitor_service'

export default class VisitorPortalController {
  private propertyService = new PropertyService()
  private visitorService = new VisitorService()

  /**
   * Show visitor dashboard
   */
  async dashboard({ auth, inertia }: HttpContext) {
    const visitor = (auth as any).visitor

    // Preload church and street groups with their street assignments
    await visitor.load('church')
    await visitor.load('streetGroups', (query: any) => {
      query.preload('streetAssignments')
    })

    // Get visitor statistics
    const stats = await this.propertyService.getVisitorStats(visitor.id)

    return inertia.render('visitor/dashboard', {
      visitor: visitor.serialize(),
      stats,
    })
  }

  /**
   * List all properties assigned to visitor
   */
  async properties({ auth, inertia, request }: HttpContext) {
    const visitor = (auth as any).visitor
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const status = request.input('status', 'all')

    let properties = await this.propertyService.getPropertiesForVisitor(visitor.id)

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      properties = properties.filter(
        (p) =>
          p.address.toLowerCase().includes(searchLower) ||
          p.streetName?.toLowerCase().includes(searchLower) ||
          p.postcode?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (status !== 'all') {
      if (status === 'not-visited' || status === 'pending') {
        properties = properties.filter(
          (p) => p.feedbackStatus === 'pending' || p.feedbackStatus === 'Not Visited'
        )
      } else if (status === 'visited') {
        properties = properties.filter((p) => p.feedbackStatus === 'Visited')
      }
    }

    // Simple pagination
    const perPage = 20
    const total = properties.length
    const lastPage = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const paginatedProperties = properties.slice(start, start + perPage)

    return inertia.render('visitor/properties', {
      visitor: visitor.serialize(),
      properties: paginatedProperties.map((p) => p.serialize()),
      pagination: {
        currentPage: page,
        lastPage,
        perPage,
        total,
      },
      filters: {
        search,
        status,
      },
    })
  }

  /**
   * Show single property detail
   */
  async showProperty({ auth, params, inertia, response }: HttpContext) {
    const visitor = (auth as any).visitor
    const propertyId = params.id

    const property = await Property.find(propertyId)

    if (!property) {
      return response.status(404).json({ message: 'Property not found' })
    }

    // Verify this property is assigned to the visitor
    const visitorProperties = await this.propertyService.getPropertiesForVisitor(visitor.id)
    const isAssigned = visitorProperties.some((p) => p.id === propertyId)

    if (!isAssigned) {
      return response.status(403).json({
        message: 'You do not have permission to view this property',
      })
    }

    return inertia.render('visitor/property-detail', {
      visitor: visitor.serialize(),
      property: property.serialize(),
    })
  }

  /**
   * Update property feedback
   */
  async updateProperty({ auth, params, request, response }: HttpContext) {
    try {
      const visitor = (auth as any).visitor
      const user = auth.user!
      const propertyId = params.id

      const data = request.only(['feedbackStatus', 'dateOfVisit', 'visitNotes', 'visitOutcome'])

      // Convert dateOfVisit string to DateTime if provided
      if (data.dateOfVisit) {
        data.dateOfVisit = DateTime.fromISO(data.dateOfVisit)
      }

      const property = await this.propertyService.updatePropertyAsVisitor(
        propertyId,
        visitor.id,
        user.id,
        data
      )

      return response.json({
        message: 'Property updated successfully',
        property: property.serialize(),
      })
    } catch (error: any) {
      console.error('Failed to update property:', error)

      if (error.message === 'Property not found') {
        return response.status(404).json({ message: error.message })
      }

      if (error.message === 'You do not have permission to update this property') {
        return response.status(403).json({ message: error.message })
      }

      return response.status(500).json({
        message: 'Failed to update property. Please try again.',
      })
    }
  }

  /**
   * Get visitor statistics (API endpoint)
   */
  async stats({ auth, response }: HttpContext) {
    try {
      const visitor = (auth as any).visitor
      const stats = await this.propertyService.getVisitorStats(visitor.id)

      return response.json(stats)
    } catch (error) {
      console.error('Failed to get visitor stats:', error)
      return response.status(500).json({
        message: 'Failed to load statistics',
      })
    }
  }

  /**
   * Show invitation acceptance form
   */
  async showAcceptInvitation({ params, inertia }: HttpContext) {
    const token = params.token

    try {
      // Verify token exists (basic validation)
      const Visitor = (await import('#models/visitor')).default
      const visitor = await Visitor.query()
        .where('invitation_token', token)
        .preload('church')
        .first()

      if (!visitor) {
        return inertia.render('visitor/invalid-invitation')
      }

      if (visitor.userId) {
        return inertia.render('visitor/invitation-already-accepted')
      }

      return inertia.render('visitor/accept-invitation', {
        token,
        visitorName: visitor.name,
        churchName: visitor.church?.churchName || 'Unknown Church',
      })
    } catch (error) {
      console.error('Error loading invitation:', error)
      return inertia.render('visitor/invalid-invitation')
    }
  }

  /**
   * Accept invitation and create account
   */
  async acceptInvitation({ params, request, response, auth, session, inertia }: HttpContext) {
    const token = params.token
    const { password, password_confirmation } = request.only(['password', 'password_confirmation'])

    try {
      // Validate passwords match
      if (password !== password_confirmation) {
        session.flash('errors', { password: 'Passwords do not match' })
        return response.redirect().back()
      }

      // Validate password length
      if (!password || password.length < 8) {
        session.flash('errors', { password: 'Password must be at least 8 characters long' })
        return response.redirect().back()
      }

      // Accept invitation and create user account
      const result = await this.visitorService.acceptInvitation(token, password)

      // Log in the new user
      await auth.use('web').login(result.user)

      // Redirect to visitor dashboard using Inertia location for full page redirect
      return inertia.location('/visitor/dashboard')
    } catch (error: any) {
      console.error('Error accepting invitation:', error)
      session.flash('errors', { password: error.message || 'Failed to accept invitation' })
      return response.redirect().back()
    }
  }

  /**
   * Show help/how to use page
   */
  async help({ auth, inertia }: HttpContext) {
    const visitor = (auth as any).visitor

    await visitor.load('church')

    return inertia.render('visitor/help', {
      visitor: visitor.serialize(),
    })
  }
}
