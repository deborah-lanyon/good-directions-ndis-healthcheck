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
      territoryStates: church?.states || [],
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

    const { name, postcodes } = request.only(['name', 'postcodes'])

    if (!name) {
      return response.badRequest({ error: 'Campaign name is required' })
    }

    if (!postcodes || !Array.isArray(postcodes) || postcodes.length === 0) {
      return response.badRequest({ error: 'At least one postcode must be entered' })
    }

    // Validate postcode format
    const invalidFormat = postcodes.filter((p: string) => !/^\d{3,4}$/.test(p))
    if (invalidFormat.length > 0) {
      return response.badRequest({ error: `Invalid postcode format: ${invalidFormat.join(', ')}` })
    }

    try {
      const service = new MailCampaignService()
      const campaign = await service.createCampaign(church.id, name, postcodes)
      return response.created({
        message: 'Campaign created. Property sync in progress.',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          postcodes: campaign.postcodes,
          syncStatus: campaign.syncStatus,
        },
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
      const message = error instanceof Error ? error.message : 'Failed to create campaign'
      return response.badRequest({ error: message })
    }
  }

  /**
   * Show properties for a campaign
   * GET /campaigns/:id/properties
   */
  async properties({ params, inertia }: HttpContext) {
    const service = new MailCampaignService()
    const campaign = await service.getCampaignWithProperties(params.id)

    return inertia.render('campaign-properties', {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        postcodes: campaign.postcodes || [],
        propertyCount: campaign.propertyCount,
        syncStatus: campaign.syncStatus,
        postedAt: campaign.postedAt?.toISO() || null,
      },
      properties: campaign.properties.map((p) => ({
        id: p.id,
        address: p.address,
        postcode: p.postcode,
        listingType: p.listingType,
        trackingCode: p.trackingCode,
        dateSold: p.dateSold?.toISO() || null,
        dateListed: p.dateListed?.toISO() || null,
        createdAt: p.createdAt?.toISO() || null,
      })),
    })
  }

  /**
   * Get sync status for a campaign
   * GET /api/campaigns/:id/sync-status
   */
  async syncStatus({ params, response }: HttpContext) {
    try {
      const service = new MailCampaignService()
      const status = await service.getSyncStatus(params.id)
      return response.ok(status)
    } catch (error) {
      console.error('Error fetching sync status:', error)
      return response.internalServerError({ error: 'Failed to fetch sync status' })
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
   * Retry sync for a failed campaign
   * POST /api/campaigns/:id/retry-sync
   */
  async retrySync({ params, response }: HttpContext) {
    try {
      const service = new MailCampaignService()
      await service.triggerSync(params.id)
      return response.ok({ message: 'Sync restarted' })
    } catch (error) {
      console.error('Error retrying sync:', error)
      return response.internalServerError({ error: 'Failed to retry sync' })
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
