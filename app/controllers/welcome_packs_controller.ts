import type { HttpContext } from '@adonisjs/core/http'
import WelcomePackService from '#services/welcome_pack_service'
import AmenityService from '#services/amenity_service'
import PdfService from '#services/pdf_service'
import Amenity from '#models/amenity'

export default class WelcomePacksController {
  /**
   * Get or create welcome pack template for church
   * GET /welcome-pack/template
   */
  async getTemplate({ auth, response, inertia }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.redirect('/church-profile')
      }

      const welcomePackService = new WelcomePackService()
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      return inertia.render('welcome-pack/editor', { template })
    } catch (error) {
      console.error('Error fetching template:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to fetch welcome pack template',
      })
    }
  }

  /**
   * Get or create welcome pack template for church (API endpoint)
   * GET /api/welcome-pack/template
   */
  async getTemplateApi({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      return response.ok({ template })
    } catch (error) {
      console.error('Error fetching template:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to fetch welcome pack template',
      })
    }
  }

  /**
   * Update welcome pack template
   * PUT /welcome-pack/template
   */
  async updateTemplate({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()
      const existingTemplate = await welcomePackService.getOrCreateTemplate(church.id)

      const data = request.only([
        'name',
        'welcomeMessage',
        'aboutCommunity',
        'churchInfo',
        'customContent',
        'contactAddress',
        'contactEmail',
        'contactPhone',
        'churchServices',
        'primaryColor',
        'secondaryColor',
        'includeAmenities',
        'enabled',
        'templateDesign',
      ])

      const template = await welcomePackService.updateTemplate(existingTemplate.id, data)

      return response.ok({ template })
    } catch (error) {
      console.error('Error updating template:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', errorMessage)
      return response.badRequest({
        error: 'Failed to update welcome pack template',
        details: errorMessage,
      })
    }
  }

  /**
   * Generate preview for a property
   * GET /api/welcome-pack/preview/:propertyId
   */
  async preview({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()

      // Get template to determine design
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      // Generate welcome pack data
      const data = await welcomePackService.generateWelcomePackData(params.propertyId)

      // Generate HTML with template design
      const html = await welcomePackService.generateHTML(data, template.templateDesign || 'default')

      return response.ok({ html, data })
    } catch (error) {
      console.error('Error generating preview:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to generate preview',
      })
    }
  }

  /**
   * Generate and download welcome pack as HTML
   * GET /api/welcome-pack/generate/:propertyId
   */
  async generate({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()

      // Get template to determine design
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      // Generate welcome pack data
      const data = await welcomePackService.generateWelcomePackData(params.propertyId)

      // Generate HTML with template design
      const html = await welcomePackService.generateHTML(data, template.templateDesign || 'default')

      // Log the generation
      await welcomePackService.logDelivery(
        params.propertyId,
        'print',
        undefined,
        undefined,
        user.fullName || user.email
      )

      // Return HTML for download
      response.header('Content-Type', 'text/html')
      response.header(
        'Content-Disposition',
        `attachment; filename="welcome-pack-${params.propertyId}.html"`
      )
      return response.send(html)
    } catch (error) {
      console.error('Error generating welcome pack:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to generate welcome pack',
      })
    }
  }

  /**
   * Generate welcome pack as PDF
   * GET /api/welcome-pack/generate-pdf/:propertyId
   */
  async generatePdf({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()
      const pdfService = new PdfService()

      // Get template to determine design
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      // Generate welcome pack data
      const data = await welcomePackService.generateWelcomePackData(params.propertyId)

      // Generate HTML with template design
      const html = await welcomePackService.generateHTML(data, template.templateDesign || 'default')

      // Generate PDF from HTML
      const pdfBuffer = await pdfService.generatePdfFromHtml(html)

      // Log the generation
      await welcomePackService.logDelivery(
        params.propertyId,
        'print',
        undefined,
        undefined,
        user.fullName || user.email
      )

      // Return PDF for download
      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `attachment; filename="welcome-pack-${params.propertyId}.pdf"`
      )
      return response.send(pdfBuffer)
    } catch (error) {
      console.error('Error generating PDF:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      })
    }
  }

  /**
   * Get amenities for management
   * GET /api/amenities
   */
  async getAmenities({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const amenities = await Amenity.query()
        .where('church_id', church.id)
        .preload('amenityType')
        .orderBy('name', 'asc')

      return response.ok({ amenities })
    } catch (error) {
      console.error('Error fetching amenities:', error)
      return response.badRequest({
        error: 'Failed to fetch amenities',
      })
    }
  }

  /**
   * Get amenity types
   * GET /api/amenity-types
   */
  async getAmenityTypes({ response }: HttpContext) {
    try {
      const amenityService = new AmenityService()
      const amenityTypes = await amenityService.getAmenityTypes()

      return response.ok({ amenityTypes })
    } catch (error) {
      console.error('Error fetching amenity types:', error)
      return response.badRequest({
        error: 'Failed to fetch amenity types',
      })
    }
  }

  /**
   * Create an amenity
   * POST /api/amenities
   */
  async createAmenity({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const data = request.only([
        'name',
        'amenityTypeId',
        'address',
        'description',
        'latitude',
        'longitude',
        'phone',
        'website',
        'suburb',
        'postcode',
      ])

      const amenityService = new AmenityService()
      const amenity = await amenityService.create({
        ...data,
        churchId: church.id,
      })

      return response.json({ amenity })
    } catch (error) {
      console.error('Error creating amenity:', error)
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create amenity',
      })
    }
  }

  /**
   * Update an amenity
   * PUT /api/amenities/:id
   */
  async updateAmenity({ auth, params, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      // Verify the amenity belongs to the user's church
      const amenity = await Amenity.query()
        .where('id', params.id)
        .where('church_id', church.id)
        .first()

      if (!amenity) {
        return response.notFound({
          error: 'Amenity not found or you do not have permission to update it',
        })
      }

      const data = request.only([
        'name',
        'amenityTypeId',
        'address',
        'description',
        'latitude',
        'longitude',
        'phone',
        'website',
        'suburb',
        'postcode',
      ])

      const amenityService = new AmenityService()
      const updatedAmenity = await amenityService.update(params.id, data)

      return response.ok({ amenity: updatedAmenity })
    } catch (error) {
      console.error('Error updating amenity:', error)
      return response.badRequest({
        error: 'Failed to update amenity',
      })
    }
  }

  /**
   * Delete an amenity
   * DELETE /api/amenities/:id
   */
  async deleteAmenity({ auth, params, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      // Verify the amenity belongs to the user's church
      const amenity = await Amenity.query()
        .where('id', params.id)
        .where('church_id', church.id)
        .first()

      if (!amenity) {
        return response.notFound({
          error: 'Amenity not found or you do not have permission to delete it',
        })
      }

      const amenityService = new AmenityService()
      await amenityService.delete(params.id)

      return response.ok({ message: 'Amenity deleted successfully' })
    } catch (error) {
      console.error('Error deleting amenity:', error)
      return response.badRequest({
        error: 'Failed to delete amenity',
      })
    }
  }

  /**
   * Render amenities management page
   * GET /amenities
   */
  async index({ inertia }: HttpContext) {
    return inertia.render('amenities/index')
  }

  /**
   * Preview template with fictional sample data (for template selection)
   * POST /api/welcome-pack/preview-sample
   */
  async previewSample({ request, response }: HttpContext) {
    try {
      const { templateDesign, welcomeMessage, churchInfo, customContent } = request.only([
        'templateDesign',
        'welcomeMessage',
        'churchInfo',
        'customContent',
      ])

      const welcomePackService = new WelcomePackService()

      // Build completely fictional sample data
      const data = {
        propertyAddress: '123 Sample Street, Your City',
        churchName: 'Community Church',
        churchInfo: churchInfo || 'Welcome to our church community!',
        welcomeMessage: welcomeMessage || 'Welcome to your new home!',
        aboutCommunity:
          'What makes this neighborhood special: Close-knit community with regular social events, beautiful parks and green spaces, excellent schools and family programs.',
        customContent: customContent || '',
        amenities: {
          'Schools': [
            {
              name: 'Sample Primary School',
              address: '45 Education Ave',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
            {
              name: 'Example High School',
              address: '78 Learning Lane',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
          ],
          'Parks & Recreation': [
            {
              name: 'Community Park',
              address: '12 Green Street',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
            {
              name: 'Riverside Reserve',
              address: '34 River Road',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
          ],
          'Shopping': [
            {
              name: 'Local Shopping Center',
              address: '56 Main Street',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
          ],
          'Dining': [
            {
              name: 'Sample Cafe',
              address: '23 Coffee Lane',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
            {
              name: 'Example Restaurant',
              address: '67 Food Street',
              suburb: 'Your Suburb',
              postcode: '2000',
            },
          ],
        },
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        logoUrl: 'https://placehold.co/200x200/94b4af/ffffff?text=Church+Logo',
        bannerUrl: 'https://placehold.co/1200x300/566874/ffffff?text=Welcome+Banner',
        aboutUsImageUrl: 'https://placehold.co/1200x800/94b4af/ffffff?text=About+Us',
        gettingAroundImageUrl: 'https://placehold.co/1200x800/566874/ffffff?text=Getting+Around',
        communityServicesImageUrl:
          'https://placehold.co/1200x800/94b4af/ffffff?text=Community+Services',
        thingsToDoImageUrl: 'https://placehold.co/1200x800/566874/ffffff?text=Things+To+Do',
        primaryColor: '#94b4af',
        secondaryColor: '#566874',
        contactAddress: '123 Church Street\nYour Suburb, State 2000',
        contactEmail: 'hello@communitychurch.org',
        contactPhone: '(02) 1234 5678',
        churchServices: JSON.stringify([
          { name: 'Sunday Service', days: ['sunday'], time: '10:00' },
          { name: 'Bible Study', days: ['wednesday'], time: '19:00' },
        ]),
      }

      // Generate HTML with specified template design
      const html = await welcomePackService.generateHTML(data, templateDesign || 'magazine')

      return response.ok({ html })
    } catch (error) {
      console.error('Error generating sample preview:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to generate sample preview',
      })
    }
  }

  /**
   * Preview template with user's actual data
   * GET /api/welcome-pack/preview-template
   */
  async previewTemplate({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const church = await user.related('church').query().first()

      if (!church) {
        return response.badRequest({
          error: 'You must set up your church profile first',
        })
      }

      const welcomePackService = new WelcomePackService()
      const amenityService = new AmenityService()

      // Get template
      const template = await welcomePackService.getOrCreateTemplate(church.id)

      // Get amenities if enabled
      let amenities: Record<string, any[]> = {}
      if (template.includeAmenities !== false) {
        amenities = await amenityService.getAllAmenitiesByType(church.id)
      }

      // Build sample data with template content
      const data = {
        propertyAddress: '123 Sample Street, Your City',
        churchName: church.churchName || 'Community Church',
        churchInfo: template.churchInfo || 'Welcome to our church community!',
        welcomeMessage: template.welcomeMessage || 'Welcome to your new home!',
        customContent: template.customContent || '',
        amenities,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        logoUrl: template.logoUrl || undefined,
        bannerUrl: template.bannerUrl || undefined,
        primaryColor: template.primaryColor || '#94b4af',
        secondaryColor: template.secondaryColor || '#566874',
      }

      // Generate HTML with template design
      const html = await welcomePackService.generateHTML(data, template.templateDesign || 'default')

      return response.ok({ html })
    } catch (error) {
      console.error('Error generating template preview:', error)
      return response.badRequest({
        error: error instanceof Error ? error.message : 'Failed to generate template preview',
      })
    }
  }
}
