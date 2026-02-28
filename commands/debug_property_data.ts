import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

export default class CheckPropertyData extends BaseCommand {
  static commandName = 'debug:property-data'
  static description = 'Check property street names and postcodes'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Checking first 10 properties...\n')

    const properties = await db
      .from('properties')
      .select('id', 'address', 'street_name', 'postcode')
      .limit(10)

    for (const prop of properties) {
      this.logger.info(`ID: ${prop.id}`)
      this.logger.info(`Address: ${prop.address}`)
      this.logger.info(`Street Name: ${prop.street_name}`)
      this.logger.info(`Postcode: ${prop.postcode}`)
      this.logger.info('---')
    }
  }
}
