import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Property from '#models/property'

export default class PurgeProperties extends BaseCommand {
  static commandName = 'purge:properties'
  static description = 'Delete all properties from the database'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const prompt = await this.prompt.confirm(
      'Are you sure you want to delete ALL properties? This cannot be undone.'
    )

    if (!prompt) {
      this.logger.info('Operation cancelled')
      return
    }

    this.logger.info('Deleting all properties...')

    const count = await Property.query().count('* as total')
    const total = count[0].$extras.total

    await Property.query().delete()

    this.logger.success(`Deleted ${total} properties`)
  }
}
