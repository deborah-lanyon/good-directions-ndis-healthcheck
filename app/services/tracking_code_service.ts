import Property from '#models/property'
import { customAlphabet } from 'nanoid'

// Uppercase alphanumeric, excluding ambiguous chars (0/O, 1/I/L) for printability
const generateCode = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 8)

export class TrackingCodeService {
  /**
   * Generate and assign tracking codes to properties that don't have them
   */
  async assignTrackingCodes(propertyIds: number[]): Promise<Property[]> {
    const properties = await Property.query().whereIn('id', propertyIds).whereNull('tracking_code')

    for (const property of properties) {
      property.trackingCode = await this.generateUniqueCode()
      await property.save()
    }

    return properties
  }

  /**
   * Generate a unique 8-char tracking code
   */
  async generateUniqueCode(): Promise<string> {
    let code: string
    let exists: boolean

    do {
      code = generateCode()
      const existing = await Property.findBy('tracking_code', code)
      exists = existing !== null
    } while (exists)

    return code
  }

  /**
   * Look up a property by tracking code
   */
  async findPropertyByCode(code: string): Promise<Property | null> {
    return Property.query()
      .where('tracking_code', code.toUpperCase())
      .preload('church')
      .first()
  }
}
