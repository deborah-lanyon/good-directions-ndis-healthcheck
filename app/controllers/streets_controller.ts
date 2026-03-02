import type { HttpContext } from '@adonisjs/core/http'
import Church from '#models/church'

export default class StreetsController {
  /**
   * Fetch streets near a church using OpenStreetMap Overpass API
   * GET /api/churches/:id/streets
   */
  async nearChurch({ params, response, auth }: HttpContext) {
    const churchId = params.id
    const user = auth.user!

    // Get the church
    const church = await Church.query()
      .where('id', churchId)
      .where('user_id', user.id)
      .firstOrFail()

    if (!church.latitude || !church.longitude) {
      return response.badRequest({
        error: 'Territory location not set. Please add latitude/longitude to your territory.',
      })
    }

    // Use church radius or default to 2km
    const radiusInMeters = (church.radius || 2) * 1000

    // Build Overpass API query for roads/streets within radius
    // Simplified query with shorter timeout for faster response
    const overpassQuery = `
      [out:json][timeout:15];
      way["highway"]["name"](around:${radiusInMeters},${church.latitude},${church.longitude});
      out geom;
    `

    try {
      const overpassUrl = 'https://overpass-api.de/api/interpreter'
      const fetchResponse = await fetch(overpassUrl, {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (!fetchResponse.ok) {
        return response.status(502).json({
          error: 'Failed to fetch street data from OpenStreetMap',
        })
      }

      const data = (await fetchResponse.json()) as any

      // Transform OSM data to simpler format for frontend
      const streets = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any) => ({
          id: element.id,
          name: element.tags.name,
          type: element.tags.highway,
          geometry: element.geometry || [], // Array of {lat, lon} points
        }))

      // Remove duplicates by name (keep first occurrence)
      const uniqueStreets = streets.reduce((acc: any[], street: any) => {
        if (!acc.find((s) => s.name === street.name)) {
          acc.push(street)
        }
        return acc
      }, [])

      // Cache for 1 hour since street data doesn't change frequently
      response.header('Cache-Control', 'public, max-age=3600')

      return response.json({
        streets: uniqueStreets,
        center: {
          lat: church.latitude,
          lng: church.longitude,
        },
        radius: radiusInMeters,
      })
    } catch (error) {
      console.error('Error fetching streets from Overpass API:', error)
      return response.status(500).json({
        error: 'Failed to fetch street data',
      })
    }
  }

  /**
   * Get list of streets from actual properties in database
   * GET /api/churches/:id/property-streets
   */
  async propertyStreets({ params, response, auth }: HttpContext) {
    const { default: Property } = await import('#models/property')
    const churchId = params.id
    const user = auth.user!

    // Verify church belongs to user
    const church = await Church.query()
      .where('id', churchId)
      .where('user_id', user.id)
      .firstOrFail()

    // Get unique street names from properties
    const streets = await Property.query()
      .where('church_id', church.id)
      .select('street_name')
      .groupBy('street_name')
      .orderBy('street_name', 'asc')

    const streetNames = streets
      .map((p) => p.streetName)
      .filter((name) => name && name.trim().length > 0)

    return response.json({
      streets: streetNames,
      count: streetNames.length,
    })
  }

  /**
   * Fetch streets within church's postcode using OpenStreetMap
   * GET /api/churches/:id/postcode-streets
   */
  async postcodeStreets({ params, response, auth, request }: HttpContext) {
    const { default: Property } = await import('#models/property')
    const churchId = params.id
    const user = auth.user!

    // Get church with ownership check
    const church = await Church.query()
      .where('id', churchId)
      .where('user_id', user.id)
      .firstOrFail()

    // Get postcodes from query parameter or use church postcode
    const requestPostcodes = request.qs().postcodes
    let postcodes: string[] = []

    if (requestPostcodes) {
      // Parse postcodes from query string (comma-separated)
      postcodes = Array.isArray(requestPostcodes)
        ? requestPostcodes
        : requestPostcodes.split(',').map((p: string) => p.trim())
    } else if (church.postcode) {
      // Fall back to church's postcode
      postcodes = [church.postcode]
    } else {
      return response.json({
        streets: [],
        postcodes: [],
        boundaries: [],
      })
    }

    try {
      // Get streets from actual properties in the database with these postcodes
      // This is more accurate than OpenStreetMap street tagging
      const properties = await Property.query()
        .where('church_id', church.id)
        .whereIn('postcode', postcodes)
        .select('street_name', 'latitude', 'longitude', 'postcode')
        .groupBy('street_name', 'latitude', 'longitude', 'postcode')
        .orderBy('street_name', 'asc')

      // Get unique streets with their approximate locations
      const streetMap = new Map<
        string,
        { name: string; coords: [number, number][]; postcode: string }
      >()

      properties.forEach((prop) => {
        if (prop.streetName && prop.latitude && prop.longitude) {
          if (!streetMap.has(prop.streetName)) {
            streetMap.set(prop.streetName, {
              name: prop.streetName,
              coords: [],
              postcode: prop.postcode || postcodes[0],
            })
          }
          streetMap.get(prop.streetName)!.coords.push([prop.latitude, prop.longitude])
        }
      })

      // Convert to street format (simple line between points)
      const streets = Array.from(streetMap.values()).map((street) => ({
        id: street.name,
        name: street.name,
        type: 'residential',
        geometry: street.coords.map((coord) => ({ lat: coord[0], lon: coord[1] })),
      }))

      // Fetch postcode boundaries
      const boundaries = await Promise.all(
        postcodes.map(async (postcode: string) => {
          return this.fetchPostcodeBoundary(postcode, church.id)
        })
      )

      const validBoundaries = boundaries.filter((b: any) => b !== null)

      response.header('Cache-Control', 'public, max-age=3600')

      return response.json({
        streets: streets,
        postcodes: postcodes,
        boundaries: validBoundaries,
      })
    } catch (error) {
      console.error('Error fetching postcode street data:', error)
      return response.status(500).json({
        error: 'Failed to fetch postcode street data',
      })
    }
  }

  /**
   * Fetch just the boundary for a postcode (no streets)
   * Now uses actual property locations to create a more accurate boundary
   */
  private async fetchPostcodeBoundary(postcode: string, churchId: number) {
    try {
      const { default: Property } = await import('#models/property')

      // Get all properties in this postcode to create a boundary from actual data
      const properties = await Property.query()
        .where('church_id', churchId)
        .where('postcode', postcode)
        .whereNotNull('latitude')
        .whereNotNull('longitude')
        .select('latitude', 'longitude')

      if (properties.length === 0) {
        console.log(`No properties found for postcode ${postcode}`)
        return null
      }

      // Calculate bounding box from actual properties
      const lats = properties.map((p) => p.latitude!)
      const lons = properties.map((p) => p.longitude!)

      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)

      console.log(`Postcode ${postcode}: ${properties.length} properties`)
      console.log(`Lat range: ${minLat} to ${maxLat} (diff: ${maxLat - minLat})`)
      console.log(`Lon range: ${minLon} to ${maxLon} (diff: ${maxLon - minLon})`)

      // Add a small buffer (about 100m in degrees, roughly 0.001)
      const buffer = 0.001

      // Create a polygon from the bounding box of actual properties
      const boundaryGeojson = {
        type: 'Polygon',
        coordinates: [
          [
            [minLon - buffer, minLat - buffer], // west, south
            [maxLon + buffer, minLat - buffer], // east, south
            [maxLon + buffer, maxLat + buffer], // east, north
            [minLon - buffer, maxLat + buffer], // west, north
            [minLon - buffer, minLat - buffer], // close polygon
          ],
        ],
      }

      return {
        postcode,
        geojson: boundaryGeojson,
        displayName: `Postcode ${postcode} (${properties.length} properties)`,
      }
    } catch (error) {
      console.error(`Error fetching boundary for postcode ${postcode}:`, error)
      return null
    }
  }
}
