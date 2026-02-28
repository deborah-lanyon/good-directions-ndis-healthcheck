import type { HttpContext } from '@adonisjs/core/http'
import Property from '#models/property'
import { PropertyService } from '#services/property_service'
import { PropertySyncService } from '#services/property_sync_service'
import { PropertySyncOnLoginService } from '#services/property_sync_on_login_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class PropertiesController {
  async index({ auth, inertia, response, session }: HttpContext) {
    try {
      console.log('[DASHBOARD] Loading dashboard for user:', auth.user!.id)

      // Redirect visitors to their own dashboard
      if (auth.user!.isVisitorRole()) {
        return response.redirect('/visitor/dashboard')
      }

      const isImpersonating = session.get('impersonating_from') !== undefined
      const demoMode = session.get('demo_mode')

      // Super admins in admin view (not impersonating and not in demo mode) see home page
      if (auth.user!.role === 'super_admin' && !isImpersonating && !demoMode) {
        return response.redirect('/')
      }

      const propertyService = new PropertyService()
      const church = await resolveChurchForUser({ auth, session })

      let properties: any[] = []
      if (church) {
        properties = await propertyService.getPropertiesForChurch(church.id)
      }

      // Calculate next sync time (tomorrow at 2:00 AM)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(2, 0, 0, 0)

      // Use actual sync status from church record instead of hardcoding 'success'
      const syncStatus = church?.syncStatus === 'failed' ? 'failed' : 'success'

      return inertia.render('properties', {
        properties,
        lastSyncDate: church?.lastSyncDate?.toISO() || null,
        syncStatus,
        nextSyncTime: tomorrow.toISOString(),
      })
    } catch (error) {
      console.error('[DASHBOARD ERROR]', error)
      return response.status(500).json({
        error: 'Failed to load dashboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async list({ auth, inertia, response, session }: HttpContext) {
    try {
      const propertyService = new PropertyService()
      const church = await resolveChurchForUser({ auth, session })

      let properties: any[] = []
      if (church) {
        properties = await propertyService.getPropertiesForChurch(church.id)
      }

      // Calculate next sync time (tomorrow at 2:00 AM)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(2, 0, 0, 0)

      const syncStatus = church?.syncStatus === 'failed' ? 'failed' : 'success'

      return inertia.render('properties', {
        properties,
        lastSyncDate: church?.lastSyncDate?.toISO() || null,
        syncStatus,
        nextSyncTime: tomorrow.toISOString(),
      })
    } catch (error) {
      console.error('[PROPERTY LIST ERROR]', error)
      return response.status(500).json({
        error: 'Failed to load property list',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      const propertyId = params.id || request.input('id')

      if (!propertyId) {
        return response.status(400).json({
          error: 'Property ID is required',
        })
      }

      const { feedbackStatus, visitor } = request.only(['feedbackStatus', 'visitor'])
      const propertyService = new PropertyService()
      const property = await propertyService.updateProperty(propertyId, auth.user!.id, {
        feedbackStatus,
        visitor,
      })

      return response.json({
        message: 'Property updated successfully',
        property: property.serialize(),
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Property not found') {
          return response.status(404).json({
            error: 'Property not found',
          })
        }
        if (error.message === 'You do not have permission to update this property') {
          return response.status(403).json({
            error: 'You do not have permission to update this property',
          })
        }
        if (error.message === 'At least one field must be provided to update') {
          return response.status(400).json({
            error: 'At least one field must be provided to update',
          })
        }
      }
      return response.status(500).json({
        error: 'Failed to update property',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  async sync({ response }: HttpContext) {
    try {
      const propertySyncService = new PropertySyncService()
      const result = await propertySyncService.syncAllChurches()
      return response.json(result)
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to sync properties',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  async testEmail({ response, auth }: HttpContext) {
    try {
      const { MailService } = await import('#services/mail_service')
      const mailService = new MailService()
      await mailService.sendPropertySyncNotification(auth.user!)
      return response.json({
        message: 'Test email sent successfully',
        recipient: auth.user!.email,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to send test email',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  async syncStatus({ response, auth, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })

      if (!church) {
        return response.json({
          status: 'no_church',
          lastSyncAt: null,
          retryCount: 0,
          errorMessage: null,
        })
      }

      const syncService = new PropertySyncOnLoginService()
      const status = await syncService.getSyncStatus(church.id)

      return response.json(status)
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  /**
   * Display all records page for church admins (spreadsheet-style view)
   */
  async records({ auth, inertia, response, session }: HttpContext) {
    try {
      if (auth.user!.isVisitorRole()) {
        return response.redirect('/visitor/dashboard')
      }

      const church = await resolveChurchForUser({ auth, session })
      if (!church) {
        return inertia.render('records', {
          properties: [],
          totalCount: 0,
          availableYears: [],
        })
      }

      const properties = await Property.query()
        .where('church_id', church.id)
        .orderBy('created_at', 'desc')
        .limit(500)

      // Get available years from created_at (when the record was added)
      const yearSet = new Set<number>()
      for (const p of properties) {
        if (p.createdAt) yearSet.add(p.createdAt.year)
      }
      const availableYears = Array.from(yearSet).sort((a, b) => b - a)

      return inertia.render('records', {
        properties: properties.map((p) => ({
          id: p.id,
          address: p.address,
          streetName: p.streetName,
          streetNumber: p.streetNumber,
          postcode: p.postcode,
          listingType: p.listingType,
          dateSold: p.dateSold?.toISODate() || null,
          dateListed: p.dateListed?.toISODate() || null,
          dateDelisted: p.dateDelisted?.toISODate() || null,
          feedbackStatus: p.feedbackStatus,
          visitOutcome: p.visitOutcome,
          visitor: p.visitor,
          dateOfVisit: p.dateOfVisit?.toISODate() || null,
          visitNotes: p.visitNotes,
          distanceFromChurch: p.distanceFromChurch,
          createdAt: p.createdAt?.toISO() || null,
          updatedAt: p.updatedAt?.toISO() || null,
        })),
        totalCount: properties.length,
        availableYears,
      })
    } catch (error) {
      console.error('Error loading records:', error)
      return inertia.render('records', {
        properties: [],
        totalCount: 0,
        availableYears: [],
        error: 'Failed to load records',
      })
    }
  }

  /**
   * API endpoint for filtered church records
   */
  async getRecords({ request, response, auth, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })
      if (!church) {
        return response.ok({ properties: [], total: 0, page: 1, limit: 100, totalPages: 0 })
      }

      const { listingType, feedbackStatus, search, year, month, page = 1, limit = 100 } = request.qs()

      let query = Property.query().where('church_id', church.id)

      if (listingType && listingType !== 'all') {
        query = query.where('listing_type', listingType)
      }

      if (feedbackStatus && feedbackStatus !== 'all') {
        query = query.where('feedback_status', feedbackStatus)
      }

      if (search) {
        const searchTerm = `%${search}%`
        query = query.where((q) => {
          q.whereLike('address', searchTerm)
            .orWhereLike('street_name', searchTerm)
            .orWhereLike('visitor', searchTerm)
            .orWhereLike('postcode', searchTerm)
        })
      }

      if (year && year !== 'all') {
        const yearNum = parseInt(year, 10)
        query = query.whereRaw('EXTRACT(YEAR FROM created_at) = ?', [yearNum])
        if (month && month !== 'all') {
          const monthNum = parseInt(month, 10)
          query = query.whereRaw('EXTRACT(MONTH FROM created_at) = ?', [monthNum])
        }
      }

      const countQuery = query.clone()
      const totalResult = await countQuery.count('* as total')
      const total = Number(totalResult[0].$extras.total)

      const offset = (Number(page) - 1) * Number(limit)
      const properties = await query
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(Number(limit))

      return response.ok({
        properties: properties.map((p) => ({
          id: p.id,
          address: p.address,
          streetName: p.streetName,
          streetNumber: p.streetNumber,
          postcode: p.postcode,
          listingType: p.listingType,
          dateSold: p.dateSold?.toISODate() || null,
          dateListed: p.dateListed?.toISODate() || null,
          dateDelisted: p.dateDelisted?.toISODate() || null,
          feedbackStatus: p.feedbackStatus,
          visitOutcome: p.visitOutcome,
          visitor: p.visitor,
          dateOfVisit: p.dateOfVisit?.toISODate() || null,
          visitNotes: p.visitNotes,
          distanceFromChurch: p.distanceFromChurch,
          createdAt: p.createdAt?.toISO() || null,
          updatedAt: p.updatedAt?.toISO() || null,
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      })
    } catch (error) {
      console.error('Error fetching records:', error)
      return response.internalServerError({ error: 'Failed to fetch records' })
    }
  }

  /**
   * Export church records as CSV
   */
  async exportRecords({ request, response, auth, session }: HttpContext) {
    try {
      const church = await resolveChurchForUser({ auth, session })
      if (!church) {
        return response.badRequest({ error: 'No church found' })
      }

      const { listingType, feedbackStatus, year, month } = request.qs()

      let query = Property.query().where('church_id', church.id)

      if (listingType && listingType !== 'all') {
        query = query.where('listing_type', listingType)
      }

      if (feedbackStatus && feedbackStatus !== 'all') {
        query = query.where('feedback_status', feedbackStatus)
      }

      if (year && year !== 'all') {
        const yearNum = parseInt(year, 10)
        query = query.whereRaw('EXTRACT(YEAR FROM created_at) = ?', [yearNum])
        if (month && month !== 'all') {
          const monthNum = parseInt(month, 10)
          query = query.whereRaw('EXTRACT(MONTH FROM created_at) = ?', [monthNum])
        }
      }

      const properties = await query.orderBy('created_at', 'desc')

      const headers = [
        'ID', 'Address', 'Street', 'Postcode', 'Type', 'Date Added',
        'Status', 'Outcome', 'Visitor', 'Visit Date', 'Notes',
      ]

      const rows = properties.map((p) => [
        p.id,
        p.address,
        p.streetName || '',
        p.postcode || '',
        p.listingType,
        p.createdAt?.toISODate() || '',
        p.feedbackStatus || '',
        p.visitOutcome || '',
        p.visitor || '',
        p.dateOfVisit?.toISODate() || '',
        (p.visitNotes || '').replace(/"/g, '""'),
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', 'attachment; filename="records.csv"')
      return response.send(csv)
    } catch (error) {
      console.error('Error exporting records:', error)
      return response.internalServerError({ error: 'Failed to export records' })
    }
  }

  /**
   * Get tracked rentals (active listings being monitored for delisting)
   * This is for testing purposes only
   */
  async trackedRentals({ response, auth }: HttpContext) {
    try {
      const propertyService = new PropertyService()
      const trackedRentals = await propertyService.getTrackedRentalsForUser(auth.user!.id)

      return response.json({
        trackedRentals,
        count: trackedRentals.length,
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to get tracked rentals',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }
}
