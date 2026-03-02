import { DateTime } from 'luxon'
import MailCampaign from '#models/mail_campaign'
import Property from '#models/property'
import type { ZylaProperty } from '../types/property.js'
import { ZylaPropertyService } from './zyla_property_service.js'
import { PostcodeService } from '#services/postcode_service'
import { TrackingCodeService } from '#services/tracking_code_service'

export class CampaignSyncService {
  private zylaService: ZylaPropertyService
  private postcodeService: PostcodeService
  private trackingCodeService: TrackingCodeService

  constructor() {
    this.zylaService = new ZylaPropertyService()
    this.postcodeService = new PostcodeService()
    this.trackingCodeService = new TrackingCodeService()
  }

  /**
   * Sync properties for all postcodes in a campaign.
   * Updates campaign sync status as it progresses.
   */
  async syncCampaign(campaignId: number): Promise<void> {
    const campaign = await MailCampaign.findOrFail(campaignId)

    try {
      campaign.syncStatus = 'syncing'
      campaign.syncErrorMessage = null
      await campaign.save()

      const allPropertyIds: number[] = []

      for (let i = 0; i < campaign.postcodes.length; i++) {
        const postcode = campaign.postcodes[i]
        console.log(
          `[CAMPAIGN SYNC] Processing postcode ${postcode} (${i + 1}/${campaign.postcodes.length}) for campaign ${campaignId}`
        )

        const propertyIds = await this.syncPostcode(postcode, campaign.churchId)
        allPropertyIds.push(...propertyIds)

        // Rate limit: wait 2s between postcodes to avoid API throttling
        if (i < campaign.postcodes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      // Deduplicate property IDs (same property could appear from overlapping suburb searches)
      const uniquePropertyIds = [...new Set(allPropertyIds)]

      // Attach properties to campaign via pivot table
      if (uniquePropertyIds.length > 0) {
        await campaign.related('properties').sync(uniquePropertyIds)

        // Assign tracking codes to all synced properties
        await this.trackingCodeService.assignTrackingCodes(uniquePropertyIds)
      }

      // Update campaign counts and status
      campaign.propertyCount = uniquePropertyIds.length
      campaign.syncStatus = 'completed'
      campaign.syncErrorMessage = null
      await campaign.save()

      console.log(
        `[CAMPAIGN SYNC] Campaign ${campaignId} sync completed: ${uniquePropertyIds.length} properties`
      )
    } catch (error) {
      console.error(`[CAMPAIGN SYNC] Campaign ${campaignId} sync failed:`, error)
      campaign.syncStatus = 'failed'
      campaign.syncErrorMessage = (error as Error).message
      await campaign.save()
    }
  }

  /**
   * Sync properties for a single postcode.
   * Returns array of property IDs created/found.
   */
  private async syncPostcode(postcode: string, churchId: number): Promise<number[]> {
    // Resolve postcode to suburb name for Zyla API
    const suburb = await this.postcodeService.getSuburbForPostcode(postcode)
    console.log(`[CAMPAIGN SYNC] Searching suburb "${suburb}" for postcode ${postcode}`)

    // Fetch sold properties
    const { properties: soldProperties } = await this.zylaService.fetchProperties({
      searchLocation: suburb,
      maxSoldAge: 1,
    })

    // Wait between API calls
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Fetch rental properties
    const { properties: rentalProperties } = await this.zylaService.fetchRentalProperties({
      searchLocation: suburb,
    })

    // Filter by exact postcode match
    const filteredSold = this.filterByPostcode(soldProperties, postcode)
    const filteredRentals = this.filterByPostcode(rentalProperties, postcode)

    console.log(
      `[CAMPAIGN SYNC] Postcode ${postcode}: ${filteredSold.length} sold, ${filteredRentals.length} rental properties found`
    )

    // Create/update property records
    const propertyIds: number[] = []

    for (const zylaProperty of filteredSold) {
      const id = await this.upsertProperty(zylaProperty, churchId, 'sold')
      if (id) propertyIds.push(id)
    }

    for (const zylaProperty of filteredRentals) {
      const id = await this.upsertProperty(zylaProperty, churchId, 'rent')
      if (id) propertyIds.push(id)
    }

    return propertyIds
  }

  /**
   * Filter Zyla properties by exact postcode match
   */
  private filterByPostcode(properties: ZylaProperty[], postcode: string): ZylaProperty[] {
    return properties.filter((p) => p.address.postcode === postcode)
  }

  /**
   * Create or find an existing property record. Returns the property ID.
   */
  private async upsertProperty(
    zylaProperty: ZylaProperty,
    churchId: number,
    listingType: 'sold' | 'rent'
  ): Promise<number | null> {
    const address = `${zylaProperty.address.streetAddress}, ${zylaProperty.address.suburb} ${zylaProperty.address.postcode}`

    // Check for existing property with same address and listing type
    const existing = await Property.query()
      .where('church_id', churchId)
      .where('address', address)
      .where('listing_type', listingType)
      .first()

    if (existing) {
      return existing.id
    }

    // Parse dates
    let dateSold: DateTime | null = null
    let dateListed: DateTime | null = null

    if (listingType === 'sold' && zylaProperty.dateSold) {
      dateSold = DateTime.fromISO(zylaProperty.dateSold.value)
      if (!dateSold.isValid) return null
    } else if (listingType === 'rent') {
      dateListed = zylaProperty.dateListed
        ? DateTime.fromISO(zylaProperty.dateListed.value)
        : DateTime.now()
    }

    // Extract address parts
    const postcodeMatch = address.match(/\b(\d{4})\b\s*$/)
    const postcode = postcodeMatch ? postcodeMatch[1] : ''

    let streetName = ''
    let streetNumber: number | null = null
    const parts = address.split(',')
    if (parts.length > 0) {
      const streetPart = parts[0].trim()
      const streetMatch = streetPart.match(/^(?:\d+\/)?(\d+)[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+(.+)$/)
      if (streetMatch) {
        streetNumber = Number.parseInt(streetMatch[1], 10)
        streetName = streetMatch[2].trim()
      } else {
        streetName = streetPart
      }
    }

    try {
      const property = await Property.create({
        churchId,
        address,
        listingType,
        dateSold: listingType === 'sold' ? dateSold : null,
        dateListed: listingType === 'rent' ? dateListed : null,
        rentalPrice: zylaProperty.price?.display || null,
        feedbackStatus: 'pending',
        latitude: zylaProperty.address.location?.latitude || null,
        longitude: zylaProperty.address.location?.longitude || null,
        streetName,
        streetNumber,
        postcode,
      })

      return property.id
    } catch (error) {
      console.error(`[CAMPAIGN SYNC] Failed to create property "${address}":`, error)
      return null
    }
  }
}
