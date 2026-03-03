import MailCampaign from '#models/mail_campaign'
import Church from '#models/church'
import Respondent from '#models/respondent'
import { PostcodeService } from '#services/postcode_service'
import { CampaignSyncService } from '#services/campaign_sync_service'
import { DateTime } from 'luxon'

export class MailCampaignService {
  private postcodeService: PostcodeService

  constructor() {
    this.postcodeService = new PostcodeService()
  }

  /**
   * Create a new postcode-driven mail campaign.
   * Validates postcodes against the territory's states, then triggers async sync.
   */
  async createCampaign(
    churchId: number,
    name: string,
    postcodes: string[]
  ): Promise<MailCampaign> {
    // Load territory to validate postcodes against its states
    const church = await Church.findOrFail(churchId)

    if (church.states && church.states.length > 0) {
      const { invalid } = this.postcodeService.validatePostcodesForStates(postcodes, church.states)
      if (invalid.length > 0) {
        throw new Error(
          `Postcodes not within territory states: ${invalid.join(', ')}`
        )
      }
    }

    const campaign = await MailCampaign.create({
      churchId,
      name,
      postcodes,
      propertyCount: 0,
      syncStatus: 'pending',
    })

    return campaign
  }

  /**
   * Trigger property sync for a campaign (async)
   */
  async triggerSync(campaignId: number): Promise<void> {
    const syncService = new CampaignSyncService()
    await syncService.syncCampaign(campaignId)
  }

  /**
   * Get sync status for a campaign
   */
  async getSyncStatus(campaignId: number) {
    const campaign = await MailCampaign.findOrFail(campaignId)
    return {
      syncStatus: campaign.syncStatus,
      propertyCount: campaign.propertyCount,
      errorMessage: campaign.syncErrorMessage,
    }
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
        postcodes: campaign.postcodes || [],
        propertyCount: campaign.propertyCount,
        syncStatus: campaign.syncStatus,
        syncErrorMessage: campaign.syncErrorMessage,
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
}
