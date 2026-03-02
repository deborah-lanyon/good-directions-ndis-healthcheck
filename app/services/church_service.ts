import Church from '#models/church'
import { PropertyService } from '#services/property_service'
import { MailService } from '#services/mail_service'
import { DateTime } from 'luxon'
import { GeocodingService } from '#services/geocoding_service'

export class ChurchService {
  private propertyService: PropertyService
  private mailService: MailService

  constructor(propertyService?: PropertyService, mailService?: MailService) {
    this.propertyService = propertyService ?? new PropertyService()
    this.mailService = mailService ?? new MailService()
  }

  async getChurchById(churchId: number): Promise<Church | null> {
    return await Church.find(churchId)
  }

  detectLocationChanges(
    church: Church,
    newData: {
      suburb?: string
      latitude?: number
      longitude?: number
      radius?: number
      address?: string
      addressLine1?: string
      addressLine2?: string
      country?: string
      mapBounds?: any
      mapZoom?: number
    }
  ): boolean {
    return (
      (newData.suburb !== undefined && newData.suburb !== church.suburb) ||
      (newData.latitude !== undefined && newData.latitude !== church.latitude) ||
      (newData.longitude !== undefined && newData.longitude !== church.longitude) ||
      (newData.radius !== undefined && newData.radius !== church.radius) ||
      (newData.address !== undefined && newData.address !== church.address) ||
      (newData.addressLine1 !== undefined && newData.addressLine1 !== church.addressLine1) ||
      (newData.addressLine2 !== undefined && newData.addressLine2 !== church.addressLine2) ||
      (newData.country !== undefined && newData.country !== church.country) ||
      (newData.mapBounds !== undefined &&
        JSON.stringify(newData.mapBounds) !== JSON.stringify(church.mapBounds)) ||
      (newData.mapZoom !== undefined && newData.mapZoom !== church.mapZoom)
    )
  }

  async updateProfile(
    churchId: number,
    data: {
      churchName?: string
      url?: string
      address?: string
      addressLine1?: string
      addressLine2?: string
      country?: string
      latitude?: number
      longitude?: number
      suburb?: string
      postcode?: string
      radius?: number
      mapBounds?: any
      mapZoom?: number
    }
  ): Promise<{ church: Church; syncResult?: any }> {
    const church = await this.getChurchById(churchId)
    if (!church) {
      throw new Error('Territory not found')
    }

    // If address or address parts changed and latitude/longitude not provided, attempt geocoding
    const geocodingService = new GeocodingService()
    const addressParts = [data.address, data.suburb, data.postcode, 'Australia']
      .filter(Boolean)
      .join(', ')

    if ((data.address || data.suburb || data.postcode) && (!data.latitude || !data.longitude)) {
      try {
        const geo = await geocodingService.geocodeAddress(addressParts)
        data.latitude = geo.lat
        data.longitude = geo.lon
      } catch (err) {
        // Don't block the update if geocoding fails — log and continue
        console.error('Geocoding failed during church profile update:', err)
      }
    }

    const locationFieldsChanged = this.detectLocationChanges(church, data)

    await church.merge(data).save()

    let syncResult = null
    if (locationFieldsChanged) {
      try {
        syncResult = await this.propertyService.syncPropertiesForChurchById(
          churchId,
          DateTime.now().minus({ months: 1 })
        )

        // Send visitor notifications for newly assigned properties
        if (syncResult.visitorAssignments && syncResult.visitorAssignments.size > 0) {
          for (const [, assignmentData] of syncResult.visitorAssignments) {
            await this.mailService.sendVisitorPropertyNotification(
              assignmentData.visitor,
              assignmentData.properties,
              assignmentData.streetGroupName
            )
          }
        }

        // Update sync timestamp after successful manual sync
        // Use Australian timezone to ensure the date is correct for Australian users
        const nowAustralia = DateTime.now().setZone('Australia/Sydney')
        church.lastSyncAt = nowAustralia
        church.lastSyncDate = nowAustralia
        church.syncStatus = 'completed'
        await church.save()
      } catch (error) {
        console.error('Failed to sync properties after church profile update:', error)
        syncResult = {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
      }
    }

    await church.refresh()

    return { church, syncResult }
  }
}
