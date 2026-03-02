import type { HttpContext } from '@adonisjs/core/http'
import { MailCampaignService } from '#services/mail_campaign_service'
import { LabelPdfService } from '#services/label_pdf_service'
import { resolveChurchForUser } from '#helpers/demo_church_resolver'

export default class MailCampaignController {
  /**
   * Render campaigns page
   * GET /campaigns
   */
  async index({ inertia, auth, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })

    let campaigns: any[] = []
    let stats = {
      totalCampaigns: 0,
      postedCampaigns: 0,
      totalPacksSent: 0,
      totalResponses: 0,
      conversionRate: '0.0',
    }

    if (church) {
      const service = new MailCampaignService()
      ;[campaigns, stats] = await Promise.all([
        service.getCampaignsForChurch(church.id),
        service.getCampaignStats(church.id),
      ])
    }

    return inertia.render('campaigns', {
      campaigns,
      stats,
      churchId: church?.id || null,
    })
  }

  /**
   * Create a new campaign
   * POST /api/campaigns
   */
  async store({ request, response, auth, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })
    if (!church) {
      return response.badRequest({ error: 'No territory selected' })
    }

    const { name, propertyIds } = request.only(['name', 'propertyIds'])

    if (!name) {
      return response.badRequest({ error: 'Campaign name is required' })
    }

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return response.badRequest({ error: 'At least one property must be selected' })
    }

    try {
      const service = new MailCampaignService()
      const campaign = await service.createCampaign(church.id, name, propertyIds)
      return response.created({
        message: 'Campaign created successfully',
        campaign: { id: campaign.id, name: campaign.name, propertyCount: campaign.propertyCount },
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
      return response.internalServerError({ error: 'Failed to create campaign' })
    }
  }

  /**
   * Get available properties for campaign creation
   * GET /api/campaigns/properties
   */
  async properties({ response, auth, session }: HttpContext) {
    const church = await resolveChurchForUser({ auth, session })
    if (!church) {
      return response.ok({ properties: [] })
    }

    try {
      const service = new MailCampaignService()
      const properties = await service.getAvailableProperties(church.id)
      return response.ok({
        properties: properties.map((p) => ({
          id: p.id,
          address: p.address,
          trackingCode: p.trackingCode,
          postcode: p.postcode,
          streetName: p.streetName,
        })),
      })
    } catch (error) {
      console.error('Error fetching properties:', error)
      return response.internalServerError({ error: 'Failed to fetch properties' })
    }
  }

  /**
   * Generate address label PDF for a campaign
   * GET /api/campaigns/:id/labels
   */
  async labels({ params, response }: HttpContext) {
    try {
      const campaignService = new MailCampaignService()
      const campaign = await campaignService.getCampaignWithProperties(params.id)

      const labelService = new LabelPdfService()
      const pdfBuffer = await labelService.generateLabels(campaign.properties)

      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `attachment; filename="labels-${campaign.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`
      )
      return response.send(pdfBuffer)
    } catch (error) {
      console.error('Error generating labels:', error)
      return response.internalServerError({ error: 'Failed to generate labels' })
    }
  }

  /**
   * Mark campaign as posted
   * POST /api/campaigns/:id/posted
   */
  async markPosted({ params, response }: HttpContext) {
    try {
      const service = new MailCampaignService()
      const campaign = await service.markAsPosted(params.id)
      return response.ok({
        message: 'Campaign marked as posted',
        postedAt: campaign.postedAt?.toISO(),
      })
    } catch (error) {
      console.error('Error marking campaign as posted:', error)
      return response.internalServerError({ error: 'Failed to mark campaign as posted' })
    }
  }

  /**
   * Delete a campaign
   * DELETE /api/campaigns/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const service = new MailCampaignService()
      await service.deleteCampaign(params.id)
      return response.ok({ message: 'Campaign deleted successfully' })
    } catch (error) {
      console.error('Error deleting campaign:', error)
      return response.internalServerError({ error: 'Failed to delete campaign' })
    }
  }
}
