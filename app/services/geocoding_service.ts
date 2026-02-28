import env from '#start/env'

export class GeocodingService {
  private apiKey: string

  constructor() {
    this.apiKey = env.get('GEOCODE_API_KEY') || ''
  }

  async geocodeAddress(address: string): Promise<{
    lat: number
    lon: number
    display_name: string
  }> {
    if (!address || typeof address !== 'string') {
      throw new Error('Address parameter is required')
    }

    const encodedAddress = encodeURIComponent(address.trim())

    // Use Nominatim as fallback if no API key, otherwise use geocode.maps.co
    let url: string
    let headers: Record<string, string> = {}

    if (!this.apiKey) {
      // Fallback to free Nominatim service (OpenStreetMap)
      url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
      headers = {
        'User-Agent': 'Community-Welcome-Portal/1.0',
      }
    } else {
      url = `https://geocode.maps.co/search?q=${encodedAddress}&api_key=${this.apiKey}`
    }

    const geocodeResponse = await fetch(url, { headers })

    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text()
      console.error('Geocoding API error:', geocodeResponse.status, errorText)

      // If API key is invalid, try Nominatim as fallback
      if (geocodeResponse.status === 401 && this.apiKey) {
        console.log('Falling back to Nominatim due to invalid API key')
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: { 'User-Agent': 'Community-Welcome-Portal/1.0' },
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData && Array.isArray(fallbackData) && fallbackData.length > 0) {
            const result = fallbackData[0]
            return {
              lat: Number.parseFloat(result.lat),
              lon: Number.parseFloat(result.lon),
              display_name: result.display_name,
            }
          }
        }
      }

      throw new Error(`Failed to geocode address: ${geocodeResponse.status}`)
    }

    const data = await geocodeResponse.json()

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error(
        'No results found. Try including: street, suburb, state/city, and country (e.g., "123 Main St, Sydney, NSW, Australia")'
      )
    }

    const result = Array.isArray(data) ? data[0] : data
    return {
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
      display_name: result.display_name,
    }
  }
}
