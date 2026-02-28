import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Church from '#models/church'
import Property from '#models/property'
import { PropertyService } from '#services/property_service'
import { DateTime } from 'luxon'

export default class DebugSync extends BaseCommand {
  static commandName = 'debug:sync'
  static description = 'Debug property sync for a church - shows what API returns vs what exists'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Church name or ID' })
  declare churchIdentifier: string

  async run() {
    // Find church by name or ID
    let church: Church | null = null

    if (!isNaN(Number(this.churchIdentifier))) {
      church = await Church.find(Number(this.churchIdentifier))
    } else {
      church = await Church.query()
        .whereILike('church_name', `%${this.churchIdentifier}%`)
        .first()
    }

    if (!church) {
      this.logger.error(`Church not found: ${this.churchIdentifier}`)
      return
    }

    this.logger.info(`\n=== Debug Sync for ${church.churchName} ===`)
    this.logger.info(`Church ID: ${church.id}`)
    this.logger.info(`Suburb: ${church.suburb || 'Not set'}`)
    this.logger.info(`Postcode: ${church.postcode || 'Not set'}`)
    this.logger.info(`Last sync: ${church.lastSyncAt?.toISO() || 'Never'}`)
    this.logger.info(`Sync status: ${church.syncStatus || 'None'}`)

    if (!church.suburb || !church.postcode) {
      this.logger.error('Church must have suburb and postcode set to sync')
      return
    }

    // Get existing properties
    const existingSold = await Property.query()
      .where('church_id', church.id)
      .where('listing_type', 'sold')
      .orderBy('date_sold', 'desc')

    const existingRentals = await Property.query()
      .where('church_id', church.id)
      .where('listing_type', 'rent')

    const activeRentals = existingRentals.filter((r) => !r.dateDelisted)
    const delistedRentals = existingRentals.filter((r) => r.dateDelisted)

    this.logger.info(`\n=== Existing Properties ===`)
    this.logger.info(`Sold properties: ${existingSold.length}`)
    this.logger.info(`Active rentals (on market): ${activeRentals.length}`)
    this.logger.info(`Delisted rentals (leased): ${delistedRentals.length}`)

    // Show recent sold
    if (existingSold.length > 0) {
      this.logger.info(`\nRecent sold (last 5):`)
      for (const prop of existingSold.slice(0, 5)) {
        this.logger.info(`  - ${prop.address} (sold: ${prop.dateSold?.toISODate() || 'unknown'})`)
      }
    }

    // Show active rentals
    if (activeRentals.length > 0) {
      this.logger.info(`\nActive rentals (last 5):`)
      for (const prop of activeRentals.slice(0, 5)) {
        this.logger.info(`  - ${prop.address} (last seen: ${prop.lastSeenAt?.toISO() || 'unknown'})`)
      }
    }

    // Now run sync and show results
    this.logger.info(`\n=== Running Sync ===`)
    this.logger.info('Calling Zyla API...')

    try {
      const propertyService = new PropertyService()
      const result = await propertyService.syncPropertiesForChurchById(
        church.id,
        DateTime.now().minus({ weeks: 1 })
      )

      this.logger.info(`\n=== Sync Results ===`)
      this.logger.info(`API returned: ${result.totalFromApi} total properties`)
      this.logger.info(`Properties after filtering: ${result.propertiesFiltered}`)
      this.logger.info(`New properties created: ${result.propertiesCreated}`)
      this.logger.info(`Properties updated: ${result.propertiesUpdated}`)
      this.logger.info(`Properties skipped: ${result.propertiesSkipped}`)
      this.logger.info(`Rentals removed from market: ${result.propertiesRemoved}`)

      if (result.visitorAssignments && result.visitorAssignments.size > 0) {
        this.logger.info(`\nVisitor assignments:`)
        for (const [, data] of result.visitorAssignments) {
          this.logger.info(`  - ${data.visitor.name}: ${data.properties.length} new properties`)
        }
      }

      // Update church sync status
      church.lastSyncAt = DateTime.now()
      church.syncStatus = 'completed'
      await church.save()

      this.logger.success('\nSync completed successfully!')
    } catch (error) {
      this.logger.error(`\nSync failed: ${error}`)
    }
  }
}
