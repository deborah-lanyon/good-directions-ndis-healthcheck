import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import Church from '#models/church'

export default class CheckChurchProperties extends BaseCommand {
  static commandName = 'check:church-properties'
  static description = 'Check property counts for a church'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Church name or ID to check' })
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
      this.logger.info('')
      this.logger.info('Available churches:')
      const allChurches = await Church.query().orderBy('church_name')
      for (const c of allChurches) {
        this.logger.info(`  - ${c.churchName} (ID: ${c.id})`)
      }
      return
    }

    this.logger.info(`Checking properties for: ${church.churchName} (ID: ${church.id})`)

    // Get all property counts
    const allProperties = await db
      .from('properties')
      .where('church_id', church.id)
      .count('* as count')
      .first()

    const soldProperties = await db
      .from('properties')
      .where('church_id', church.id)
      .where('listing_type', 'sold')
      .count('* as count')
      .first()

    const delistedRentals = await db
      .from('properties')
      .where('church_id', church.id)
      .where('listing_type', 'rent')
      .whereNotNull('date_delisted')
      .count('* as count')
      .first()

    const activeRentals = await db
      .from('properties')
      .where('church_id', church.id)
      .where('listing_type', 'rent')
      .whereNull('date_delisted')
      .count('* as count')
      .first()

    // Get properties shown in analytics (sold + delisted rentals)
    const analyticsProperties = await db
      .from('properties')
      .where('church_id', church.id)
      .where((query) => {
        query.where('listing_type', 'sold').orWhere((sub) => {
          sub.where('listing_type', 'rent').whereNotNull('date_delisted')
        })
      })
      .count('* as count')
      .first()

    this.logger.info('')
    this.logger.info('=== Property Counts ===')
    this.logger.info(`Total properties in database: ${allProperties?.count || 0}`)
    this.logger.info(`  - Sold properties: ${soldProperties?.count || 0}`)
    this.logger.info(`  - Delisted rentals (leased): ${delistedRentals?.count || 0}`)
    this.logger.info(`  - Active rentals (still on market): ${activeRentals?.count || 0}`)
    this.logger.info('')
    this.logger.info(`Properties shown in analytics: ${analyticsProperties?.count || 0}`)
    this.logger.info('  (sold + delisted rentals only)')

    // Show sample of active rentals if any
    if (Number(activeRentals?.count) > 0) {
      const sampleRentals = await db
        .from('properties')
        .where('church_id', church.id)
        .where('listing_type', 'rent')
        .whereNull('date_delisted')
        .select('address', 'last_seen_at', 'date_listed')
        .limit(5)

      this.logger.info('')
      this.logger.info('Sample active rentals (still on market):')
      for (const rental of sampleRentals) {
        this.logger.info(`  - ${rental.address} (last seen: ${rental.last_seen_at})`)
      }
    }
  }
}
