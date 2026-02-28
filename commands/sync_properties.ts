import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { PropertySyncService } from '#services/property_sync_service'

export default class SyncProperties extends BaseCommand {
  static commandName = 'sync:properties'
  static description = 'Sync properties for all churches from Zyla API'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const startTime = new Date()
    this.logger.info('=== PROPERTY SYNC STARTING ===')
    this.logger.info(`Start time: ${startTime.toISOString()}`)

    try {
      const propertySyncService = new PropertySyncService()
      const result = await propertySyncService.syncAllChurches()

      const endTime = new Date()
      const duration = (endTime.getTime() - startTime.getTime()) / 1000

      this.logger.info('=== PROPERTY SYNC COMPLETED SUCCESSFULLY ===')
      this.logger.info(`Duration: ${duration} seconds`)
      this.logger.info(`Sync results: ${JSON.stringify(result)}`)

      // Exit with success code
      process.exit(0)
    } catch (error) {
      const endTime = new Date()
      const duration = (endTime.getTime() - startTime.getTime()) / 1000

      this.logger.error('=== PROPERTY SYNC FAILED ===')
      this.logger.error(`Duration: ${duration} seconds`)
      this.logger.error(`Error: ${error.message}`)
      this.logger.error(`Stack: ${error.stack}`)

      // Exit with error code
      process.exit(1)
    }
  }
}
