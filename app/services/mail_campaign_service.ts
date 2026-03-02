import MailCampaign from '#models/mail_campaign'
import Property from '#models/property'
import Respondent from '#models/respondent'
import { TrackingCodeService } from '#services/tracking_code_service'
import { DateTime } from 'luxon'

export class MailCampaignService {
  private trackingCodeService: TrackingCodeService

  constructor() {
    this.trackingCodeService = new TrackingCodeService()
  }

  /**
   * Create a new mail campaign and assign tracking codes to properties
   */
  async createCampaign(
    churchId: number,
    name: string,
    propertyIds: number[]
  ): Promise<MailCampaign> {
    // Assign tracking codes to any properties that don't have them
    await this.trackingCodeService.assignTrackingCodes(propertyIds)

    const campaign = await MailCampaign.create({
      churchId,
      name,
      propertyCount: propertyIds.length,
    })

    // Attach properties to campaign via pivot table
    await campaign.related('properties').attach(propertyIds)

    return campaign
  }

  /**
   * Get all campaigns for a church with response counts
   */
  async getCampaignsForChurch(churchId: number): Promise<any[]> {
    const campaigns = await MailCampaign.query()
      .where('church_id', churchId)
      .preload('properties')
      .orderBy('created_at', 'desc')

    const result = []
    for (const campaign of campaigns) {
      // Count respondents linked to properties in this campaign
      const propertyIds = campaign.properties.map((p) => p.id)
      let responseCount = 0
      if (propertyIds.length > 0) {
        const respondents = await Respondent.query()
          .whereIn('property_id', propertyIds)
          .count('* as total')
        responseCount = Number(respondents[0].$extras.total)
      }

      result.push({
        id: campaign.id,
        name: campaign.name,
        propertyCount: campaign.propertyCount,
        postedAt: campaign.postedAt?.toISO() || null,
        responseCount,
        createdAt: campaign.createdAt?.toISO() || null,
      })
    }

    return result
  }

  /**
   * Get campaign with properties for label generation
   */
  async getCampaignWithProperties(campaignId: number): Promise<MailCampaign> {
    return MailCampaign.query()
      .where('id', campaignId)
      .preload('properties')
      .firstOrFail()
  }

  /**
   * Mark a campaign as posted
   */
  async markAsPosted(campaignId: number): Promise<MailCampaign> {
    const campaign = await MailCampaign.findOrFail(campaignId)
    campaign.postedAt = DateTime.now()
    await campaign.save()

    // Mark all pivot entries as posted
    await campaign.related('properties').pivotQuery().update({ posted: true })

    return campaign
  }

  /**
   * Get campaign stats for a church
   */
  async getCampaignStats(churchId: number) {
    const campaigns = await MailCampaign.query().where('church_id', churchId)

    const totalCampaigns = campaigns.length
    const postedCampaigns = campaigns.filter((c) => c.postedAt !== null).length
    const totalPacksSent = campaigns
      .filter((c) => c.postedAt !== null)
      .reduce((sum, c) => sum + c.propertyCount, 0)

    // Count total respondents for this church
    const respondentResult = await Respondent.query()
      .where('church_id', churchId)
      .count('* as total')
    const totalResponses = Number(respondentResult[0].$extras.total)

    const conversionRate =
      totalPacksSent > 0 ? ((totalResponses / totalPacksSent) * 100).toFixed(1) : '0.0'

    return {
      totalCampaigns,
      postedCampaigns,
      totalPacksSent,
      totalResponses,
      conversionRate,
    }
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: number): Promise<void> {
    const campaign = await MailCampaign.findOrFail(campaignId)
    await campaign.delete()
  }

  /**
   * Get available properties for a church (for creating campaigns)
   */
  async getAvailableProperties(churchId: number): Promise<Property[]> {
    return Property.query()
      .where('church_id', churchId)
      .orderBy('address', 'asc')
  }
}
