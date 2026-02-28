import Amenity from '#models/amenity'
import AmenityType from '#models/amenity_type'

export interface NearbyAmenity {
  id: number
  name: string
  type: string
  subcategory: string | null
  address: string
  distance: number
  phone: string | null
  website: string | null
}

export default class AmenityService {
  /**
   * Find amenities near a specific location
   * @param latitude - Property latitude
   * @param longitude - Property longitude
   * @param radiusKm - Search radius in kilometers
   * @returns Array of nearby amenities with distances
   */
  async findNearbyAmenities(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<NearbyAmenity[]> {
    // Fetch all amenities with coordinates
    const amenities = await Amenity.query()
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .preload('amenityType')

    // Calculate distances and filter by radius
    const nearby: NearbyAmenity[] = []

    for (const amenity of amenities) {
      if (!amenity.latitude || !amenity.longitude) continue

      const distance = this.calculateDistance(
        latitude,
        longitude,
        amenity.latitude,
        amenity.longitude
      )

      if (distance <= radiusKm) {
        nearby.push({
          id: amenity.id,
          name: amenity.name,
          type: amenity.amenityType.name,
          subcategory: amenity.amenityType.subcategory,
          address: amenity.address,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          phone: amenity.phone,
          website: amenity.website,
        })
      }
    }

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance)

    return nearby
  }

  /**
   * Get amenities grouped by type for a location
   * @param latitude - Property latitude
   * @param longitude - Property longitude
   * @param radiusKm - Search radius in kilometers
   * @returns Amenities grouped by type
   */
  async getAmenitiesByType(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Record<string, NearbyAmenity[]>> {
    const amenities = await this.findNearbyAmenities(latitude, longitude, radiusKm)

    const grouped: Record<string, NearbyAmenity[]> = {}

    for (const amenity of amenities) {
      if (!grouped[amenity.type]) {
        grouped[amenity.type] = []
      }
      grouped[amenity.type].push(amenity)
    }

    return grouped
  }

  /**
   * Get all amenities grouped by type (without distance filtering)
   * @param churchId - Optional church ID to filter amenities by church
   * @returns Amenities grouped by type
   */
  async getAllAmenitiesByType(churchId?: number): Promise<Record<string, NearbyAmenity[]>> {
    let query = Amenity.query().preload('amenityType')

    // Filter by church if churchId is provided
    if (churchId) {
      query = query.where('church_id', churchId)
    }

    const amenities = await query

    const grouped: Record<string, NearbyAmenity[]> = {}

    for (const amenity of amenities) {
      const typeName = amenity.amenityType.name

      if (!grouped[typeName]) {
        grouped[typeName] = []
      }

      grouped[typeName].push({
        id: amenity.id,
        name: amenity.name,
        type: typeName,
        subcategory: amenity.amenityType.subcategory,
        address: amenity.address,
        distance: 0, // No distance when coordinates aren't available
        phone: amenity.phone,
        website: amenity.website,
      })
    }

    return grouped
  }

  /**
   * Create a new amenity
   */
  async create(data: {
    name: string
    amenityTypeId: number
    churchId: number
    address: string
    description?: string
    latitude?: number
    longitude?: number
    phone?: string
    website?: string
    suburb?: string
    postcode?: string
  }): Promise<Amenity> {
    const amenity = await Amenity.create(data)
    return amenity
  }

  /**
   * Update an amenity
   */
  async update(id: number, data: Partial<Amenity>): Promise<Amenity> {
    const amenity = await Amenity.findOrFail(id)
    amenity.merge(data)
    await amenity.save()
    return amenity
  }

  /**
   * Delete an amenity
   */
  async delete(id: number): Promise<void> {
    const amenity = await Amenity.findOrFail(id)
    await amenity.delete()
  }

  /**
   * Get all amenity types
   */
  async getAmenityTypes(): Promise<AmenityType[]> {
    return await AmenityType.query().orderBy('priority', 'desc').orderBy('name', 'asc')
  }

  /**
   * Create an amenity type
   */
  async createAmenityType(data: {
    name: string
    icon?: string
    priority?: number
  }): Promise<AmenityType> {
    return await AmenityType.create(data)
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
}
