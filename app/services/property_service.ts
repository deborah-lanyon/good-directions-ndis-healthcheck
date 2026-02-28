import { DateTime } from 'luxon'
import Church from '#models/church'
import Property from '#models/property'
import type { ListingType } from '#models/property'
import StreetGroup from '#models/street_group'
import Visitor from '#models/visitor'
import type { PropertyNotificationDetail, ZylaProperty } from '../types/property.js'
import { ZylaPropertyService } from './zyla_property_service.js'
import db from '@adonisjs/lucid/services/db'
import { normalizeStreetName } from '#helpers/street_name'

type FilterSettings = {
  searchLocation: string
  latitude?: number
  longitude?: number
  radiusKm?: number
}

type PropertyWithVisitedStatus = {
  id: number
  uid: number
  church_id: number
  address: string
  date_sold: string | null
  date_listed: string | null
  listing_type: ListingType
  rental_price: string | null
  feedback_status: string
  feedbackStatus: string
  visited: boolean
  visitor: string | null
  date_of_visit: string | null
  latitude: number | null
  longitude: number | null
  distance_from_church: number | null
  date_of_status_change: string | null
  created_at: string
  updated_at: string | null
}

export class PropertyService {
  private zylaService: ZylaPropertyService

  constructor(zylaService?: ZylaPropertyService) {
    this.zylaService = zylaService ?? new ZylaPropertyService()
  }

  async syncPropertiesForChurch(
    userId: number,
    filterSince: DateTime
  ): Promise<{
    totalFromApi: number
    propertiesReported: number
    propertiesFiltered: number
    propertiesCreated: number
    propertiesUpdated: number
    propertiesRemoved: number
    propertiesSkipped: number
    visitorAssignments?: Map<
      number,
      {
        visitor: Visitor
        properties: Array<{ address: string; dateSold: string; listingType: 'sold' | 'rent' }>
        streetGroupName: string
      }
    >
    apiCallsRemaining?: number | null
  }> {
    try {
      const church = await this.getChurchByUserId(userId)
      if (!church.id) {
        throw new Error('Church ID is missing. Cannot sync properties without a valid church ID.')
      }
      return await this.syncPropertiesForChurchById(church.id, filterSince)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unknown error occurred during property sync')
    }
  }

  async syncPropertiesForChurchById(
    churchId: number,
    filterSince: DateTime
  ): Promise<{
    totalFromApi: number
    propertiesReported: number
    propertiesFiltered: number
    propertiesCreated: number
    propertiesUpdated: number
    propertiesRemoved: number
    propertiesSkipped: number
    visitorAssignments?: Map<
      number,
      {
        visitor: Visitor
        properties: Array<{ address: string; dateSold: string; listingType: 'sold' | 'rent' }>
        streetGroupName: string
      }
    >
    apiCallsRemaining?: number | null
  }> {
    try {
      const church = await Church.findOrFail(churchId)
      if (!church.id) {
        throw new Error('Church ID is missing. Cannot sync properties without a valid church ID.')
      }

      // Check if church has territories (territories are optional, but visitor assignment won't work without them)
      const filterSettings = this.buildFilterSettings(church)

      if (!filterSettings.searchLocation) {
        throw new Error('Church must have a suburb to sync properties')
      }

      if (!church.postcode) {
        throw new Error('Church must have a postcode to sync properties')
      }

      // Fetch sold properties
      const {
        properties: zylaSoldProperties,
        totalFromApi: totalSoldFromApi,
        propertiesReported: soldPropertiesReported,
      } = await this.zylaService.fetchProperties({
        searchLocation: filterSettings.searchLocation,
        maxSoldAge: 1,
      })

      // Wait 2 seconds between API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Fetch rental properties
      const {
        properties: zylaRentalProperties,
        totalFromApi: totalRentalFromApi,
        propertiesReported: rentalPropertiesReported,
      } = await this.zylaService.fetchRentalProperties({
        searchLocation: filterSettings.searchLocation,
      })

      const totalFromApi = totalSoldFromApi + totalRentalFromApi
      const propertiesReported = soldPropertiesReported + rentalPropertiesReported

      // Filter sold properties by date
      const dateFilteredSold = this.filterPropertiesByDate(zylaSoldProperties, filterSince)
      const postcodeFilteredSold = this.filterPropertiesByPostcode(
        dateFilteredSold,
        church.postcode
      )

      // Filter rental properties by postcode only (no date filter for rentals)
      const postcodeFilteredRental = this.filterPropertiesByPostcode(
        zylaRentalProperties,
        church.postcode
      )

      // For rentals, we only want to track properties that have been REMOVED from listings
      // (indicating someone has likely signed a lease). We'll process rentals separately.
      // Only sold properties go through the normal creation flow.
      const allZylaProperties: Array<{ property: ZylaProperty; listingType: ListingType }> = [
        ...postcodeFilteredSold.map((p) => ({ property: p, listingType: 'sold' as ListingType })),
      ]

      const postcodeFiltered = allZylaProperties

      // Load existing properties to check what needs updating vs creating
      const existingProperties = await Property.query().where('church_id', church.id)
      // Map by address + listing type to allow same address for both sold and rent
      const existingByAddressAndType = new Map(
        existingProperties.map((p) => [`${p.address}|${p.listingType}`, p])
      )

      console.log(`Found ${existingProperties.length} existing properties for church ${church.id}`)

      // Load street groups for visitor auto-assignment
      const streetGroups = await StreetGroup.query()
        .where('church_id', church.id)
        .preload('streetAssignments')
        .preload('visitors')

      // Track properties assigned to each visitor for notifications
      const visitorAssignments = new Map<
        number,
        {
          visitor: Visitor
          properties: Array<{ address: string; dateSold: string; listingType: 'sold' | 'rent' }>
          streetGroupName: string
        }
      >()

      let propertiesCreated = 0
      let propertiesUpdated = 0
      let propertiesSkipped = 0
      const processedAddresses = new Set<string>()

      for (const { property: zylaProperty, listingType } of postcodeFiltered) {
        const address = `${zylaProperty.address.streetAddress}, ${zylaProperty.address.suburb} ${zylaProperty.address.postcode}`

        // Get the relevant date based on listing type
        let propertyDate: DateTime | null = null
        let propertyDateISO: string | null = null
        let rentalPrice: string | null = null

        if (listingType === 'sold' && zylaProperty.dateSold) {
          propertyDate = DateTime.fromISO(zylaProperty.dateSold.value)
        } else if (listingType === 'rent') {
          // For rentals, use dateListed if available, otherwise use current date
          if (zylaProperty.dateListed) {
            propertyDate = DateTime.fromISO(zylaProperty.dateListed.value)
          } else {
            propertyDate = DateTime.now()
          }
          // Get rental price from the price display
          rentalPrice = zylaProperty.price?.display || null
        }

        // For sold properties, skip if date is invalid
        if (listingType === 'sold') {
          if (!propertyDate || !propertyDate.isValid) {
            propertiesSkipped++
            continue
          }
          propertyDateISO = propertyDate.toISODate()
          if (!propertyDateISO) {
            propertiesSkipped++
            continue
          }
        } else {
          // For rentals, set date to today if not available
          if (!propertyDate || !propertyDate.isValid) {
            propertyDate = DateTime.now()
          }
          propertyDateISO = propertyDate.toISODate() || DateTime.now().toISODate()
        }

        if (
          !zylaProperty.address.location ||
          zylaProperty.address.location.latitude === undefined ||
          zylaProperty.address.location.longitude === undefined
        ) {
          propertiesSkipped++
          continue
        }

        let distanceFromChurch: number | null = null
        if (
          church.latitude &&
          church.longitude &&
          zylaProperty.address.location.latitude !== undefined &&
          zylaProperty.address.location.longitude !== undefined
        ) {
          distanceFromChurch = this.calculateDistance(
            church.latitude,
            church.longitude,
            zylaProperty.address.location.latitude,
            zylaProperty.address.location.longitude
          )
        }

        // Extract street name, street number, and postcode from address
        const { streetName, streetNumber, postcode } = this.extractAddressParts(address)

        // Create a unique key that includes listing type to allow same address for both sold and rent
        const addressKey = `${address}|${listingType}`

        // Mark this address as processed
        processedAddresses.add(addressKey)

        // Check if property already exists (same address AND listing type)
        const existingProperty = existingByAddressAndType.get(addressKey)

        if (existingProperty) {
          // Update existing property - preserve visitor feedback and visit data
          // Only update location/distance data if it has changed
          const updates: any = {}

          if (existingProperty.latitude !== zylaProperty.address.location.latitude) {
            updates.latitude = zylaProperty.address.location.latitude
          }
          if (existingProperty.longitude !== zylaProperty.address.location.longitude) {
            updates.longitude = zylaProperty.address.location.longitude
          }
          if (
            distanceFromChurch !== null &&
            existingProperty.distanceFromChurch !== distanceFromChurch
          ) {
            updates.distanceFromChurch = distanceFromChurch
          }
          if (existingProperty.streetName !== streetName) {
            updates.streetName = streetName
          }
          if (existingProperty.streetNumber !== streetNumber) {
            updates.streetNumber = streetNumber
          }
          if (existingProperty.postcode !== postcode) {
            updates.postcode = postcode
          }
          // Update rental price if changed
          if (listingType === 'rent' && existingProperty.rentalPrice !== rentalPrice) {
            updates.rentalPrice = rentalPrice
          }

          // Only auto-assign visitor if property doesn't already have one assigned
          // This preserves manual visitor assignments
          if (!existingProperty.visitor && streetName) {
            const matchingStreetGroup = this.findMatchingStreetGroup(
              streetGroups,
              streetName,
              streetNumber
            )
            if (
              matchingStreetGroup &&
              matchingStreetGroup.visitors &&
              matchingStreetGroup.visitors.length > 0
            ) {
              updates.visitor = matchingStreetGroup.visitors.map((v) => v.name).join(', ')
            }
          }

          // Only update if there are actual changes
          if (Object.keys(updates).length > 0) {
            await existingProperty.merge(updates).save()
            propertiesUpdated++
          }

          continue // Move to next property
        }

        // Property doesn't exist - create new one
        // Auto-assign visitor based on street group (now with number range support)
        let visitor: string | null = null

        if (streetName) {
          const matchingStreetGroup = this.findMatchingStreetGroup(
            streetGroups,
            streetName,
            streetNumber
          )
          if (
            matchingStreetGroup &&
            matchingStreetGroup.visitors &&
            matchingStreetGroup.visitors.length > 0
          ) {
            visitor = matchingStreetGroup.visitors.map((v) => v.name).join(', ')
            console.log(
              `[SYNC DEBUG] Matched new ${listingType} property "${address}" to street group "${matchingStreetGroup.name}" with ${matchingStreetGroup.visitors.length} visitors`
            )

            // Track this property for each visitor's notification (only for NEW properties)
            for (const vis of matchingStreetGroup.visitors) {
              console.log(`[SYNC DEBUG] Adding property to visitor ${vis.id} (${vis.name})`)
              if (!visitorAssignments.has(vis.id)) {
                visitorAssignments.set(vis.id, {
                  visitor: vis,
                  properties: [],
                  streetGroupName: matchingStreetGroup.name,
                })
              }
              visitorAssignments.get(vis.id)!.properties.push({
                address,
                dateSold: propertyDateISO || '',
                listingType,
              })
            }
          }
        }

        await Property.create({
          churchId: church.id,
          address,
          listingType,
          dateSold: listingType === 'sold' ? propertyDate : null,
          dateListed: listingType === 'rent' ? propertyDate : null,
          rentalPrice,
          feedbackStatus: 'pending',
          latitude: zylaProperty.address.location.latitude,
          longitude: zylaProperty.address.location.longitude,
          distanceFromChurch,
          streetName,
          streetNumber,
          postcode,
          visitor,
        })

        propertiesCreated++
      }

      // NOTE: We do NOT delete sold properties that don't appear in the API response
      // because the API only returns recent properties (last week for sold).
      // Older sold properties would be incorrectly removed if we deleted based on API response.

      // === RENTAL PROPERTY TRACKING ===
      // For rentals, we track which listings are currently active and detect when they disappear
      // (indicating a lease has been signed). Only delisted rentals become "welcomeable" properties.

      const currentRentalAddresses = new Set(
        postcodeFilteredRental.map(
          (p) => `${p.address.streetAddress}, ${p.address.suburb} ${p.address.postcode}`
        )
      )

      // Get all existing rental properties for this church (both active and delisted)
      const existingRentals = await Property.query()
        .where('church_id', church.id)
        .where('listing_type', 'rent')

      let rentalsDelisted = 0
      let rentalsUpdatedLastSeen = 0

      for (const rental of existingRentals) {
        if (currentRentalAddresses.has(rental.address)) {
          // Rental is still listed - update last_seen_at
          rental.lastSeenAt = DateTime.now()
          // Clear dateDelisted if it was previously set (re-listed property)
          if (rental.dateDelisted) {
            rental.dateDelisted = null
          }
          await rental.save()
          rentalsUpdatedLastSeen++
        } else if (!rental.dateDelisted) {
          // Rental is no longer in listings and hasn't been marked as delisted yet
          // This means someone likely signed a lease - mark it as delisted (ready to welcome)
          rental.dateDelisted = DateTime.now()
          await rental.save()
          rentalsDelisted++
          console.log(`[SYNC] Rental delisted (likely leased): ${rental.address}`)

          // Auto-assign visitor for newly delisted rental if not already assigned
          if (!rental.visitor && rental.streetName) {
            const matchingStreetGroup = this.findMatchingStreetGroup(
              streetGroups,
              rental.streetName,
              rental.streetNumber
            )
            if (
              matchingStreetGroup &&
              matchingStreetGroup.visitors &&
              matchingStreetGroup.visitors.length > 0
            ) {
              rental.visitor = matchingStreetGroup.visitors.map((v) => v.name).join(', ')
              await rental.save()

              // Track this property for each visitor's notification
              for (const vis of matchingStreetGroup.visitors) {
                if (!visitorAssignments.has(vis.id)) {
                  visitorAssignments.set(vis.id, {
                    visitor: vis,
                    properties: [],
                    streetGroupName: matchingStreetGroup.name,
                  })
                }
                visitorAssignments.get(vis.id)!.properties.push({
                  address: rental.address,
                  dateSold: rental.dateDelisted?.toISODate() || '',
                  listingType: 'rent',
                })
              }
            }
          }
        }
        // If rental.dateDelisted is already set, do nothing - it stays delisted
      }

      // Create new rental tracking records for rentals we haven't seen before
      // These are "active" rentals - they'll become welcomeable when they disappear from listings
      let newRentalsTracked = 0
      for (const zylaRental of postcodeFilteredRental) {
        const address = `${zylaRental.address.streetAddress}, ${zylaRental.address.suburb} ${zylaRental.address.postcode}`
        const addressKey = `${address}|rent`

        if (!existingByAddressAndType.has(addressKey)) {
          // New rental we haven't seen before - create tracking record
          const { streetName, streetNumber, postcode } = this.extractAddressParts(address)

          let distanceFromChurch: number | null = null
          if (
            church.latitude &&
            church.longitude &&
            zylaRental.address.location?.latitude !== undefined &&
            zylaRental.address.location?.longitude !== undefined
          ) {
            distanceFromChurch = this.calculateDistance(
              church.latitude,
              church.longitude,
              zylaRental.address.location.latitude,
              zylaRental.address.location.longitude
            )
          }

          // Get the listing date
          let dateListed: DateTime | null = null
          if (zylaRental.dateListed) {
            dateListed = DateTime.fromISO(zylaRental.dateListed.value)
          } else {
            dateListed = DateTime.now()
          }

          await Property.create({
            churchId: church.id,
            address,
            listingType: 'rent',
            dateListed,
            rentalPrice: zylaRental.price?.display || null,
            feedbackStatus: 'pending',
            latitude: zylaRental.address.location?.latitude || null,
            longitude: zylaRental.address.location?.longitude || null,
            distanceFromChurch,
            streetName,
            streetNumber,
            postcode,
            visitor: null, // Don't assign visitor until delisted
            lastSeenAt: DateTime.now(),
            dateDelisted: null, // Not delisted yet - still active listing
          })
          newRentalsTracked++
        }
      }

      console.log(
        `[SYNC] Rental tracking: ${newRentalsTracked} new tracked, ${rentalsUpdatedLastSeen} updated last_seen, ${rentalsDelisted} delisted`
      )

      const apiCallsRemaining = this.zylaService.getRemainingCalls()
      console.log(
        `Sync complete for church ${church.id}: ${propertiesCreated} sold created, ${propertiesUpdated} updated, ${rentalsDelisted} rentals delisted` +
        (apiCallsRemaining !== null ? ` (${apiCallsRemaining} API calls remaining)` : '')
      )

      return {
        totalFromApi,
        propertiesReported,
        propertiesFiltered: postcodeFiltered.length + postcodeFilteredRental.length,
        propertiesCreated,
        propertiesUpdated,
        propertiesRemoved: rentalsDelisted,
        propertiesSkipped,
        visitorAssignments,
        apiCallsRemaining,
      }
    } catch (error) {
      console.error('Property sync error details:', error)
      throw new Error(`Property sync error: ${(error as Error).message}`)
    }
  }

  async getPropertiesForChurch(churchId: number): Promise<PropertyWithVisitedStatus[]> {
    const church = await Church.find(churchId)
    if (!church) {
      return []
    }

    // Get sold properties and ONLY delisted rentals
    const properties = await db
      .from('properties')
      .where('church_id', churchId)
      .where((query) => {
        query.where('listing_type', 'sold').orWhere((subQuery) => {
          subQuery.where('listing_type', 'rent').whereNotNull('date_delisted')
        })
      })
      .orderByRaw('COALESCE(date_sold, date_delisted) DESC')

    // Load street groups for visitor auto-assignment
    const sgResults = await StreetGroup.query()
      .where('church_id', churchId)
      .preload('streetAssignments')
      .preload('visitors')
    const streetGroups = sgResults.map((sg) => sg.serialize())

    // Auto-assign visitors for properties that don't have one
    const propertiesWithVisitors = properties.map((property: any) => {
      const feedbackStatus = property.feedback_status || 'pending'
      const visited = feedbackStatus !== 'pending' && feedbackStatus !== 'No Answer'
      const dateOfVisit = visited && property.date_of_visit ? property.date_of_visit : null

      let visitor = property.visitor
      if (!visitor && property.street_name) {
        const matchingStreetGroup = streetGroups.find(
          (sg: any) =>
            sg.streetAssignments &&
            sg.streetAssignments.some(
              (sa: any) =>
                sa.streetName &&
                property.street_name &&
                sa.streetName.toLowerCase() === property.street_name.toLowerCase()
            )
        )
        if (matchingStreetGroup && matchingStreetGroup.visitors?.length > 0) {
          visitor = matchingStreetGroup.visitors[0].name
        }
      }

      return {
        ...property,
        feedbackStatus,
        visited,
        dateOfVisit,
        visitor,
      }
    })

    return propertiesWithVisitors
  }

  async getPropertiesForUser(userId: number): Promise<PropertyWithVisitedStatus[]> {
    const church = await Church.query().where('user_id', userId).first()
    let properties: any[] = []

    if (church) {
      // Get sold properties and ONLY delisted rentals (not active rental listings)
      // Rental properties are only shown after they've been removed from listings
      // (indicating a lease was signed and new tenant has moved in)
      properties = await db
        .from('properties')
        .where('church_id', church.id)
        .where((query) => {
          query.where('listing_type', 'sold').orWhere((subQuery) => {
            subQuery.where('listing_type', 'rent').whereNotNull('date_delisted')
          })
        })
        .orderByRaw('COALESCE(date_sold, date_delisted) DESC')
    }

    // Load street groups for visitor auto-assignment
    let streetGroups: any[] = []
    if (church) {
      const sgResults = await StreetGroup.query()
        .where('church_id', church.id)
        .preload('streetAssignments')
        .preload('visitors')
      streetGroups = sgResults.map((sg) => sg.serialize())
    }

    // Auto-assign visitors for properties that don't have one
    const propertiesWithVisitors = properties.map((property: any) => {
      const feedbackStatus = property.feedback_status || 'pending'
      const visited = feedbackStatus !== 'pending' && feedbackStatus !== 'No Answer'
      const dateOfVisit = visited && property.date_of_visit ? property.date_of_visit : null

      // Auto-assign visitor if not manually set
      let visitor = property.visitor
      if (!visitor && property.street_name) {
        const matchingStreetGroup = streetGroups.find(
          (sg: any) =>
            sg.streetAssignments &&
            sg.streetAssignments.some(
              (assignment: any) => assignment.streetName === property.street_name
            )
        )
        if (
          matchingStreetGroup &&
          matchingStreetGroup.visitors &&
          matchingStreetGroup.visitors.length > 0
        ) {
          visitor = matchingStreetGroup.visitors.map((v: any) => v.name).join(', ')
        }
      }

      return {
        ...property,
        uid: property.id,
        feedbackStatus,
        visited,
        visitor,
        date_of_visit: dateOfVisit,
        date_listed: property.date_listed,
        date_delisted: property.date_delisted,
        listing_type: property.listing_type || 'sold',
        rental_price: property.rental_price,
        streetName: property.street_name,
        postcode: property.postcode,
        latitude: property.latitude,
        longitude: property.longitude,
        visit_outcome: property.visit_outcome,
      }
    })

    return propertiesWithVisitors
  }

  async updateProperty(
    propertyId: number,
    userId: number,
    updateData: { feedbackStatus?: string; visitor?: string }
  ): Promise<Property> {
    const property = await Property.findOrFail(propertyId)

    const church = await Church.query().where('user_id', userId).first()
    if (!church || property.churchId !== church.id) {
      throw new Error('You do not have permission to update this property')
    }

    if (updateData.feedbackStatus === undefined && updateData.visitor === undefined) {
      throw new Error('At least one field must be provided to update')
    }

    const dataToUpdate: Record<string, any> = {}
    const currentFeedbackStatus = property.feedbackStatus || 'pending'

    if (updateData.feedbackStatus !== undefined) {
      const feedbackStatusChanged = updateData.feedbackStatus !== currentFeedbackStatus

      dataToUpdate.feedbackStatus = updateData.feedbackStatus

      if (feedbackStatusChanged) {
        dataToUpdate.dateOfStatusChange = DateTime.now()
      }

      const visited =
        updateData.feedbackStatus !== 'pending' && updateData.feedbackStatus !== 'No Answer'
      const wasVisited =
        currentFeedbackStatus !== 'pending' && currentFeedbackStatus !== 'No Answer'

      if (visited) {
        dataToUpdate.dateOfVisit = DateTime.now()
      }

      if (!visited && wasVisited) {
        dataToUpdate.dateOfVisit = null
      }
    }

    if (updateData.visitor !== undefined) {
      const formattedVisitor =
        typeof updateData.visitor === 'string' && updateData.visitor.trim().length > 0
          ? updateData.visitor.trim()
          : null
      dataToUpdate.visitor = formattedVisitor
    }

    await property.merge(dataToUpdate).save()

    return property
  }

  formatPropertiesForNotification(properties: PropertyNotificationDetail[]): string {
    if (properties.length === 0) {
      return 'No new property settlements found.'
    }

    const groupedByDate = properties.reduce(
      (acc, property) => {
        const date = property.settlementDate
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(property)
        return acc
      },
      {} as Record<string, PropertyNotificationDetail[]>
    )

    const sortedDates = Object.keys(groupedByDate).sort()

    let message = `🏡 *${properties.length} New Property Settlement${properties.length > 1 ? 's' : ''}*\n\n`

    sortedDates.forEach((date) => {
      const propertiesForDate = groupedByDate[date]
      const formattedDate = this.formatDate(date)

      message += `📅 *${formattedDate}*\n`

      propertiesForDate.forEach((property) => {
        const propertyType = this.formatPropertyType(
          property.propertyType,
          property.propertySubType
        )
        message += `• ${property.address.singleLineAddress}\n`
        message += `  ${propertyType} - ${property.saleType}\n\n`
      })
    })

    return message.trim()
  }

  private async getChurchByUserId(userId: number) {
    const church = await Church.query().where('user_id', userId).first()
    if (!church) {
      throw new Error('Church profile not found. Please set up your church profile.')
    }
    return church
  }

  private buildFilterSettings(church: Church): FilterSettings {
    return {
      searchLocation: church.suburb || '',
      latitude: church.latitude ?? undefined,
      longitude: church.longitude ?? undefined,
      radiusKm: church.radius ?? undefined,
    }
  }

  private filterPropertiesByDate(properties: ZylaProperty[], requestDate: DateTime) {
    return properties.filter((property) => {
      if (!property.dateSold) return false
      const propertyDate = DateTime.fromISO(property.dateSold.value)
      return propertyDate.isValid && propertyDate >= requestDate
    })
  }

  private filterPropertiesByPostcode(properties: ZylaProperty[], postcode: string) {
    return properties.filter((property) => {
      return property.address.postcode === postcode
    })
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number) {
    return degrees * (Math.PI / 180)
  }

  private formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Find a matching street group for a property based on street name and number
   * Matches if:
   * 1. Street name matches exactly
   * 2. AND either no number range is set (matches all), OR the street number falls within the range
   */
  private findMatchingStreetGroup(
    streetGroups: StreetGroup[],
    streetName: string,
    streetNumber: number | null
  ): StreetGroup | undefined {
    return streetGroups.find((sg) =>
      sg.streetAssignments.some((assignment) => {
        // Street name must match (case-insensitive, abbreviation-tolerant)
        if (normalizeStreetName(assignment.streetName) !== normalizeStreetName(streetName)) {
          return false
        }

        // If no number range is set, match all properties on this street
        if (assignment.streetNumberStart === null && assignment.streetNumberEnd === null) {
          return true
        }

        // If property has no street number, don't match range-specific assignments
        if (streetNumber === null) {
          return false
        }

        // Check if street number falls within the range
        const startOk =
          assignment.streetNumberStart === null || streetNumber >= assignment.streetNumberStart
        const endOk =
          assignment.streetNumberEnd === null || streetNumber <= assignment.streetNumberEnd

        return startOk && endOk
      })
    )
  }

  /**
   * Extract street name, street number, and postcode from address
   * Example: "1/123 Smith Street, Sydney NSW 2000" -> { streetName: "Smith Street", streetNumber: 123, postcode: "2000" }
   * Example: "2/678-682 Main Road, Sydney NSW 2000" -> { streetName: "Main Road", streetNumber: 678, postcode: "2000" }
   */
  private extractAddressParts(address: string): {
    streetName: string
    streetNumber: number | null
    postcode: string
  } {
    // Extract postcode (4 digits at the end)
    const postcodeMatch = address.match(/\b(\d{4})\b\s*$/)
    const postcode = postcodeMatch ? postcodeMatch[1] : ''

    // Extract street name and street number
    let streetName = ''
    let streetNumber: number | null = null

    // Split by comma to get the first part (street part)
    const parts = address.split(',')
    if (parts.length > 0) {
      const streetPart = parts[0].trim()

      // Extract street number and name
      // Handles: "123 Main St", "9/19-21 Main St", "123A Main St", "123-125 Main St", "2/678-682 Main St"
      // Pattern breakdown:
      // - optional unit number with slash (2/)
      // - main street number (678)
      // - optional letter suffix (A)
      // - optional range (-682)
      // - space and street name
      const streetMatch = streetPart.match(/^(?:\d+\/)?(\d+)[A-Za-z]?(?:-\d+[A-Za-z]?)?\s+(.+)$/)
      if (streetMatch) {
        // streetMatch[1] = the main street number (e.g., "678" from "2/678-682")
        // streetMatch[2] = the street name
        streetNumber = Number.parseInt(streetMatch[1], 10)
        streetName = streetMatch[2].trim()
      } else {
        // If no number found, use the whole part as street name
        streetName = streetPart
      }
    }

    return { streetName, streetNumber, postcode }
  }

  private formatPropertyType(propertyType: string, propertySubType: string) {
    const typeMap: Record<string, string> = {
      HOUSE: '🏠 House',
      UNIT: '🏢 Unit',
      FLATS: '🏢 Flat',
      FARM: '🚜 Farm',
      COMMUNITY: '🏘️ Community',
    }

    const baseType = typeMap[propertyType] || propertyType
    const subType = propertySubType.replace(/^(House|Unit|Flat):\s*/, '')

    return subType ? `${baseType} (${subType})` : baseType
  }

  /**
   * Get properties assigned to a specific visitor
   */
  async getPropertiesForVisitor(visitorId: number): Promise<Property[]> {
    const visitor = await Visitor.query()
      .where('id', visitorId)
      .preload('church')
      .preload('streetGroups', (query) => {
        query.preload('streetAssignments')
      })
      .first()

    console.log('[getPropertiesForVisitor] Visitor ID:', visitorId)
    console.log('[getPropertiesForVisitor] Visitor found:', !!visitor)
    console.log('[getPropertiesForVisitor] Street groups count:', visitor?.streetGroups.length)

    if (!visitor || visitor.streetGroups.length === 0) {
      console.log('[getPropertiesForVisitor] No visitor or no street groups - returning empty')
      return []
    }

    const church = visitor.church
    console.log('[getPropertiesForVisitor] Church ID:', church.id)
    console.log('[getPropertiesForVisitor] Church postcode:', church.postcode)

    // Collect all street assignments from all street groups
    const streetAssignments: Array<{
      streetName: string
      streetNumberStart: number | null
      streetNumberEnd: number | null
    }> = []
    for (const streetGroup of visitor.streetGroups) {
      for (const sa of streetGroup.streetAssignments) {
        streetAssignments.push({
          streetName: sa.streetName,
          streetNumberStart: sa.streetNumberStart,
          streetNumberEnd: sa.streetNumberEnd,
        })
      }
    }

    const streetNames = [...new Set(streetAssignments.map((sa) => sa.streetName))]
    console.log('[getPropertiesForVisitor] Street names to match:', streetNames)

    if (!church.postcode) {
      console.log('[getPropertiesForVisitor] No church postcode - returning empty')
      return []
    }

    if (streetNames.length === 0) {
      console.log('[getPropertiesForVisitor] No street names - returning empty')
      return []
    }

    // Get properties matching the visitor's postcode
    // Street name filtering is done in-memory below to handle abbreviations (St vs Street, etc.)
    const allProperties = await Property.query()
      .where('church_id', church.id)
      .where('postcode', church.postcode)
      .whereNotNull('street_name')
      .where((query) => {
        query.where('listing_type', 'sold').orWhere((subQuery) => {
          subQuery.where('listing_type', 'rent').whereNotNull('date_delisted')
        })
      })
      .orderByRaw('COALESCE(date_sold, date_delisted) DESC')

    // Filter properties by number ranges
    const filteredProperties = allProperties.filter((property) => {
      // Find if any street assignment matches this property
      return streetAssignments.some((assignment) => {
        // Must match street name (case-insensitive, abbreviation-tolerant)
        if (!property.streetName || normalizeStreetName(property.streetName) !== normalizeStreetName(assignment.streetName)) {
          return false
        }

        // If no number range specified, match all properties on this street
        if (assignment.streetNumberStart === null && assignment.streetNumberEnd === null) {
          return true
        }

        // If property has no street number, only match if assignment has no range
        if (property.streetNumber === null) {
          return false
        }

        // Check if property's street number is within the range
        const startOk =
          assignment.streetNumberStart === null ||
          property.streetNumber >= assignment.streetNumberStart
        const endOk =
          assignment.streetNumberEnd === null || property.streetNumber <= assignment.streetNumberEnd
        return startOk && endOk
      })
    })

    console.log('[getPropertiesForVisitor] Properties found:', filteredProperties.length)

    return filteredProperties
  }

  /**
   * Update property as a visitor (limited fields)
   */
  async updatePropertyAsVisitor(
    propertyId: number,
    visitorId: number,
    userId: number,
    data: {
      feedbackStatus?: string
      dateOfVisit?: DateTime
      visitNotes?: string
      visitOutcome?: string
    }
  ): Promise<Property> {
    const property = await Property.find(propertyId)
    if (!property) {
      throw new Error('Property not found')
    }

    // Verify this property is assigned to the visitor
    const visitorProperties = await this.getPropertiesForVisitor(visitorId)
    const isAssigned = visitorProperties.some(
      (p) => p.id === propertyId || p.id === Number(propertyId)
    )

    if (!isAssigned) {
      throw new Error('You do not have permission to update this property')
    }

    // Update allowed fields
    if (data.feedbackStatus !== undefined) {
      property.feedbackStatus = data.feedbackStatus
      property.dateOfStatusChange = DateTime.now()
    }

    if (data.dateOfVisit !== undefined) {
      property.dateOfVisit = data.dateOfVisit
    }

    if (data.visitNotes !== undefined) {
      property.visitNotes = data.visitNotes
    }

    if (data.visitOutcome !== undefined) {
      property.visitOutcome = data.visitOutcome
    }

    property.lastUpdatedBy = userId
    await property.save()

    return property
  }

  /**
   * Get tracked (active) rentals that haven't been delisted yet
   * This is for testing purposes to see what rentals are being tracked
   */
  async getTrackedRentalsForUser(userId: number): Promise<any[]> {
    const church = await Church.query().where('user_id', userId).first()
    if (!church) {
      return []
    }

    // Get rental properties that are being tracked but haven't been delisted yet
    const trackedRentals = await db
      .from('properties')
      .where('church_id', church.id)
      .where('listing_type', 'rent')
      .whereNull('date_delisted')
      .whereNotNull('last_seen_at')
      .orderBy('last_seen_at', 'desc')

    return trackedRentals.map((rental: any) => ({
      ...rental,
      uid: rental.id,
      feedbackStatus: rental.feedback_status || 'pending',
      listing_type: rental.listing_type,
      rental_price: rental.rental_price,
      streetName: rental.street_name,
      postcode: rental.postcode,
      latitude: rental.latitude,
      longitude: rental.longitude,
      last_seen_at: rental.last_seen_at,
    }))
  }

  /**
   * Get visitor dashboard statistics
   */
  async getVisitorStats(visitorId: number): Promise<{
    totalProperties: number
    visitedProperties: number
    pendingProperties: number
    recentActivity: Property[]
  }> {
    const properties = await this.getPropertiesForVisitor(visitorId)

    const totalProperties = properties.length
    const visitedProperties = properties.filter(
      (p) => p.feedbackStatus !== 'pending' && p.feedbackStatus !== 'No Answer'
    ).length
    const pendingProperties = properties.filter((p) => p.feedbackStatus === 'pending').length

    // Get recent activity (last 10 updated properties)
    const recentActivity = properties
      .filter((p) => p.updatedAt)
      .sort((a, b) => {
        const dateA = a.updatedAt ? a.updatedAt.toMillis() : 0
        const dateB = b.updatedAt ? b.updatedAt.toMillis() : 0
        return dateB - dateA
      })
      .slice(0, 10)

    return {
      totalProperties,
      visitedProperties,
      pendingProperties,
      recentActivity,
    }
  }
}
