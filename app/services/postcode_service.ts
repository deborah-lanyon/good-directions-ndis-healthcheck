/**
 * Service for Australian postcode validation, state derivation, and suburb resolution.
 */
export class PostcodeService {
  /**
   * Australian postcode-to-state mapping ranges
   */
  private static readonly STATE_RANGES: Array<{
    min: number
    max: number
    state: string
  }> = [
    { min: 800, max: 899, state: 'NT' },
    { min: 900, max: 999, state: 'NT' },
    { min: 1000, max: 1999, state: 'NSW' },
    { min: 2000, max: 2599, state: 'NSW' },
    { min: 2600, max: 2618, state: 'ACT' },
    { min: 2619, max: 2899, state: 'NSW' },
    { min: 2900, max: 2920, state: 'ACT' },
    { min: 2921, max: 2999, state: 'NSW' },
    { min: 3000, max: 3999, state: 'VIC' },
    { min: 4000, max: 4999, state: 'QLD' },
    { min: 5000, max: 5799, state: 'SA' },
    { min: 5800, max: 5999, state: 'SA' },
    { min: 6000, max: 6797, state: 'WA' },
    { min: 6800, max: 6999, state: 'WA' },
    { min: 7000, max: 7799, state: 'TAS' },
    { min: 7800, max: 7999, state: 'TAS' },
  ]

  static readonly AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']

  /**
   * Derive the Australian state from a postcode
   */
  getStateForPostcode(postcode: string): string | null {
    const num = Number.parseInt(postcode, 10)
    if (Number.isNaN(num)) return null

    for (const range of PostcodeService.STATE_RANGES) {
      if (num >= range.min && num <= range.max) {
        return range.state
      }
    }
    return null
  }

  /**
   * Validate that postcodes belong to the given states
   */
  validatePostcodesForStates(
    postcodes: string[],
    states: string[]
  ): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    for (const postcode of postcodes) {
      const state = this.getStateForPostcode(postcode)
      if (state && states.includes(state)) {
        valid.push(postcode)
      } else {
        invalid.push(postcode)
      }
    }

    return { valid, invalid }
  }

  /**
   * Check if a string is a valid Australian postcode format (3-4 digits)
   */
  isValidPostcodeFormat(postcode: string): boolean {
    return /^\d{3,4}$/.test(postcode)
  }

  /**
   * Resolve a postcode to suburb name(s) for Zyla API search.
   * Uses the geocoding service to get a locality name from the postcode.
   * Falls back to using the postcode itself as the search term.
   */
  async getSuburbForPostcode(postcode: string): Promise<string> {
    try {
      const { GeocodingService } = await import('#services/geocoding_service')
      const geocodingService = new GeocodingService()
      const result = await geocodingService.geocodeAddress(`${postcode}, Australia`)

      // Parse the display_name to extract the suburb/locality
      // Nominatim returns: "Suburb, LGA, State, Postcode, Australia"
      if (result.display_name) {
        const parts = result.display_name.split(',').map((p: string) => p.trim())
        // The first part is usually the suburb/locality name
        if (parts.length > 0 && parts[0]) {
          // Filter out parts that are just the postcode or state abbreviation
          const suburb = parts[0]
          if (suburb !== postcode && suburb.length > 1) {
            console.log(
              `[POSTCODE] Resolved postcode ${postcode} to suburb "${suburb}" via geocoding`
            )
            return suburb
          }
        }
      }
    } catch (error) {
      console.warn(`[POSTCODE] Geocoding failed for postcode ${postcode}, using postcode as search term:`, error)
    }

    // Fallback: use the postcode itself as the search location
    // The Zyla API with surroundingSuburbs=true may still return results
    return postcode
  }
}
