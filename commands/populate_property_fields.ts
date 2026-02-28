import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Property from '#models/property'

export default class PopulatePropertyFields extends BaseCommand {
  static commandName = 'populate:property-fields'
  static description = 'Populate street_name and postcode fields from existing property addresses'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting to populate property fields...')

    const properties = await Property.query().whereNull('street_name').orWhereNull('postcode')

    this.logger.info(`Found ${properties.length} properties to update`)

    let updated = 0
    let failed = 0

    for (const property of properties) {
      try {
        const { streetName, postcode } = this.extractAddressParts(property.address)

        property.streetName = streetName
        property.postcode = postcode
        await property.save()

        updated++

        if (updated % 10 === 0) {
          this.logger.info(`Updated ${updated}/${properties.length} properties...`)
        }
      } catch (error) {
        failed++
        this.logger.warning(`Failed to parse address: ${property.address}`)
      }
    }

    this.logger.success(`Completed! Updated: ${updated}, Failed: ${failed}`)
  }

  /**
   * Extract street name and postcode from address
   * Example: "1/123 Smith Street, Sydney NSW 2000" -> { streetName: "Smith Street", postcode: "2000" }
   */
  private extractAddressParts(address: string): { streetName: string; postcode: string } {
    // Extract postcode (4 digits at the end)
    const postcodeMatch = address.match(/\b(\d{4})\b\s*$/)
    const postcode = postcodeMatch ? postcodeMatch[1] : ''

    // Extract street name
    // Pattern: after unit/number, get the street name before the comma
    // e.g., "1/123 Smith Street, Sydney NSW 2000" -> "Smith Street"
    let streetName = ''

    // Split by comma to get the first part (street part)
    const parts = address.split(',')
    if (parts.length > 0) {
      const streetPart = parts[0].trim()

      // Remove leading numbers, units, and slashes to get just the street name
      // Match pattern: optional unit + number + street name
      const streetMatch = streetPart.match(/^(?:\d+\/)*\d+\s+(.+)$/)
      if (streetMatch) {
        streetName = streetMatch[1].trim()
      } else {
        // If no number found, use the whole part
        streetName = streetPart
      }
    }

    return { streetName, postcode }
  }
}
