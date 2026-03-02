import axios from 'axios'
import env from '#start/env'
import Property from '#models/property'
import Church from '#models/church'

export interface RouteWaypoint {
  propertyId: number
  address: string
  streetName?: string
  postcode?: string
  latitude: number
  longitude: number
  distanceFromPrevious?: number
  durationFromPrevious?: number
}

export interface RouteResult {
  churchId: number
  churchName: string
  churchAddress: string
  churchLatitude: number
  churchLongitude: number
  waypoints: RouteWaypoint[]
  totalDistance: number // in kilometers
  totalDuration: number // in minutes
  optimizedOrder: number[] // property IDs in optimized order
  googleMapsUrl: string
}

export default class RouteService {
  /**
   * Optimize route for property visits using Google Maps Directions API
   * @param churchId - Starting point (church)
   * @param propertyIds - Properties to visit
   * @returns Optimized route with waypoints
   */
  async optimizeRoute(churchId: number, propertyIds: number[]): Promise<RouteResult> {
    if (propertyIds.length === 0) {
      throw new Error('At least one property is required for route planning')
    }

    // Fetch church details
    const church = await Church.findOrFail(churchId)

    if (!church.latitude || !church.longitude) {
      throw new Error('Territory location coordinates are not set. Please update your territory.')
    }

    // Fetch properties
    const properties = await Property.query()
      .whereIn('id', propertyIds)
      .where('church_id', churchId)

    if (properties.length === 0) {
      throw new Error('No valid properties found for the selected IDs')
    }

    // Check if properties have coordinates
    const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude)

    if (propertiesWithCoords.length === 0) {
      throw new Error('Selected properties do not have valid coordinates')
    }

    // If we have Google Maps API key, use it for optimization
    const apiKey = env.get('GOOGLE_MAPS_API_KEY', '')

    if (apiKey) {
      return await this.optimizeWithGoogleMaps(church, propertiesWithCoords, apiKey)
    } else {
      // Fallback: simple distance-based ordering
      return await this.optimizeByDistance(church, propertiesWithCoords)
    }
  }

  /**
   * Optimize route using Google Maps Directions API
   */
  private async optimizeWithGoogleMaps(
    church: Church,
    properties: Property[],
    apiKey: string
  ): Promise<RouteResult> {
    const origin = `${church.latitude},${church.longitude}`

    // For Google Maps, we can only optimize up to 25 waypoints
    // If more, we'll use our distance-based fallback
    if (properties.length > 25) {
      console.warn(
        'Too many properties for Google Maps optimization, using distance-based ordering'
      )
      return await this.optimizeByDistance(church, properties)
    }

    // Build waypoints string
    const waypoints = properties.map((p) => `${p.latitude},${p.longitude}`).join('|')

    // Use the last property as destination (Google will optimize the order)
    const destination = `${properties[properties.length - 1].latitude},${properties[properties.length - 1].longitude}`

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin,
          destination,
          waypoints: `optimize:true|${waypoints}`,
          key: apiKey,
        },
        timeout: 10000, // 10 second timeout
      })

      if (response.data.status !== 'OK') {
        console.error('Google Maps API error:', response.data.status, response.data.error_message)
        // Fallback to distance-based
        return await this.optimizeByDistance(church, properties)
      }

      const route = response.data.routes[0]
      const legs = route.legs
      const waypointOrder = route.waypoint_order || []

      // Build optimized waypoints
      const optimizedWaypoints: RouteWaypoint[] = []
      let totalDistance = 0
      let totalDuration = 0

      waypointOrder.forEach((index: number, i: number) => {
        const property = properties[index]
        const leg = legs[i]

        totalDistance += leg.distance.value // meters
        totalDuration += leg.duration.value // seconds

        optimizedWaypoints.push({
          propertyId: property.id,
          address: property.address || 'Unknown address',
          streetName: property.streetName || undefined,
          postcode: property.postcode || undefined,
          latitude: property.latitude!,
          longitude: property.longitude!,
          distanceFromPrevious: leg.distance.value / 1000, // convert to km
          durationFromPrevious: Math.round(leg.duration.value / 60), // convert to minutes
        })
      })

      const googleMapsUrl = this.generateGoogleMapsUrl(
        church,
        optimizedWaypoints.map((w) => ({ lat: w.latitude, lng: w.longitude }))
      )

      return {
        churchId: church.id,
        churchName: church.churchName || 'Your Church',
        churchAddress: this.getChurchAddress(church),
        churchLatitude: church.latitude!,
        churchLongitude: church.longitude!,
        waypoints: optimizedWaypoints,
        totalDistance: totalDistance / 1000, // convert to km
        totalDuration: Math.round(totalDuration / 60), // convert to minutes
        optimizedOrder: optimizedWaypoints.map((w) => w.propertyId),
        googleMapsUrl,
      }
    } catch (error) {
      console.error('Error calling Google Maps API:', error)
      // Fallback to distance-based optimization
      return await this.optimizeByDistance(church, properties)
    }
  }

  /**
   * Simple distance-based route optimization (greedy nearest neighbor algorithm)
   */
  private async optimizeByDistance(church: Church, properties: Property[]): Promise<RouteResult> {
    const unvisited = [...properties]
    const optimizedWaypoints: RouteWaypoint[] = []
    let currentLat = church.latitude!
    let currentLng = church.longitude!
    let totalDistance = 0

    // Greedy algorithm: always visit nearest unvisited property
    while (unvisited.length > 0) {
      let nearestIndex = 0
      let nearestDistance = this.calculateDistance(
        currentLat,
        currentLng,
        unvisited[0].latitude!,
        unvisited[0].longitude!
      )

      // Find nearest property
      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentLat,
          currentLng,
          unvisited[i].latitude!,
          unvisited[i].longitude!
        )

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      const property = unvisited[nearestIndex]
      totalDistance += nearestDistance

      optimizedWaypoints.push({
        propertyId: property.id,
        address: property.address || 'Unknown address',
        streetName: property.streetName || undefined,
        postcode: property.postcode || undefined,
        latitude: property.latitude!,
        longitude: property.longitude!,
        distanceFromPrevious: nearestDistance,
        durationFromPrevious: Math.round((nearestDistance / 40) * 60), // Estimate: 40 km/h average
      })

      currentLat = property.latitude!
      currentLng = property.longitude!
      unvisited.splice(nearestIndex, 1)
    }

    const googleMapsUrl = this.generateGoogleMapsUrl(
      church,
      optimizedWaypoints.map((w) => ({ lat: w.latitude, lng: w.longitude }))
    )

    return {
      churchId: church.id,
      churchName: church.churchName || 'Your Church',
      churchAddress: this.getChurchAddress(church),
      churchLatitude: church.latitude!,
      churchLongitude: church.longitude!,
      waypoints: optimizedWaypoints,
      totalDistance,
      totalDuration: Math.round((totalDistance / 40) * 60), // Estimate: 40 km/h average
      optimizedOrder: optimizedWaypoints.map((w) => w.propertyId),
      googleMapsUrl,
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  /**
   * Optimize route for a street group
   * @param churchId - Starting point (church)
   * @param streetGroupId - Street group containing properties to visit
   * @returns Optimized route with waypoints
   */
  async optimizeRouteForStreetGroup(churchId: number, streetGroupId: number): Promise<RouteResult> {
    const StreetGroup = (await import('#models/street_group')).default

    // Fetch street group with its street assignments
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('streetAssignments')
      .preload('church')
      .first()

    if (!streetGroup) {
      throw new Error('Street group not found')
    }

    // Verify the street group belongs to the church
    if (streetGroup.church.id !== churchId) {
      throw new Error('Street group does not belong to this church')
    }

    const streetNames = streetGroup.streetAssignments.map((assignment) => assignment.streetName)

    if (streetNames.length === 0) {
      throw new Error('Street group has no streets assigned')
    }

    console.log('Looking for properties on streets:', streetNames)

    // Get all properties for the streets in this group
    const properties = await Property.query()
      .where('church_id', churchId)
      .whereIn('street_name', streetNames)
      .whereNotNull('latitude')
      .whereNotNull('longitude')

    console.log(`Found ${properties.length} properties for ${streetNames.length} streets`)

    if (properties.length === 0) {
      // Get a sample of street names from the database to help with debugging
      const sampleStreets = await Property.query()
        .where('church_id', churchId)
        .select('street_name')
        .groupBy('street_name')
        .limit(10)

      const sampleNames = sampleStreets.map((p) => p.streetName).join(', ')
      console.log('Sample street names in database:', sampleNames)

      throw new Error(
        `No properties found for the streets in this group. Searched for: ${streetNames.join(', ')}. Sample streets in database: ${sampleNames}`
      )
    }

    // Use the existing optimizeRoute method with the property IDs
    const propertyIds = properties.map((p) => p.id)
    return await this.optimizeRoute(churchId, propertyIds)
  }

  /**
   * Generate Google Maps URL for mobile navigation
   */
  generateGoogleMapsUrl(church: Church, waypoints: Array<{ lat: number; lng: number }>): string {
    const origin = `${church.latitude},${church.longitude}`

    // Google Maps URL format
    // https://www.google.com/maps/dir/?api=1&origin=...&waypoints=...&destination=...
    const lastWaypoint = waypoints[waypoints.length - 1]
    const destination = `${lastWaypoint.lat},${lastWaypoint.lng}`

    const params = new URLSearchParams({
      api: '1',
      origin,
      destination,
      travelmode: 'driving',
    })

    if (waypoints.length > 1) {
      // Include all except the last one as waypoints
      const intermediateWaypoints = waypoints.slice(0, -1)
      params.append('waypoints', intermediateWaypoints.map((w) => `${w.lat},${w.lng}`).join('|'))
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`
  }

  /**
   * Get formatted church address
   */
  private getChurchAddress(church: Church): string {
    const parts = [
      church.address,
      church.addressLine1,
      church.addressLine2,
      church.suburb,
      church.postcode,
      church.country,
    ].filter(Boolean)

    return parts.join(', ') || 'Church Location'
  }
}
