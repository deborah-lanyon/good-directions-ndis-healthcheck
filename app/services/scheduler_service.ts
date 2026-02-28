import cron from 'node-cron'
import logger from '@adonisjs/core/services/logger'
import { PropertySyncService } from '#services/property_sync_service'

export class SchedulerService {
  private tasks: cron.ScheduledTask[] = []

  start() {
    logger.info('=== SCHEDULER SERVICE STARTING ===')
    logger.info(`Current server time: ${new Date().toISOString()}`)
    logger.info(`Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

    // Schedule daily property sync at 2 AM
    const dailySyncTask = cron.schedule(
      '0 2 * * *', // Run at 2:00 AM every day
      async () => {
        const startTime = new Date()
        logger.info('=== SCHEDULED PROPERTY SYNC STARTING ===')
        logger.info(`Start time: ${startTime.toISOString()}`)

        try {
          const propertySyncService = new PropertySyncService()
          const result = await propertySyncService.syncAllChurches()

          const endTime = new Date()
          const duration = (endTime.getTime() - startTime.getTime()) / 1000

          logger.info('=== SCHEDULED PROPERTY SYNC COMPLETED SUCCESSFULLY ===')
          logger.info(`Duration: ${duration} seconds`)
          logger.info('Sync results:', { result })
        } catch (error) {
          const endTime = new Date()
          const duration = (endTime.getTime() - startTime.getTime()) / 1000

          logger.error('=== SCHEDULED PROPERTY SYNC FAILED ===')
          logger.error(`Duration: ${duration} seconds`)
          logger.error('Error details:', {
            message: error.message,
            stack: error.stack,
            error,
          })
        }
      },
      {
        timezone: 'Australia/Sydney', // Adjust to your timezone
      }
    )

    this.tasks.push(dailySyncTask)
    logger.info('✓ Scheduler started successfully')
    logger.info('✓ Daily property sync scheduled for 2:00 AM (Australia/Sydney timezone)')
    logger.info(`✓ Next sync will run at approximately: ${this.getNextRunTime()}`)
  }

  private getNextRunTime(): string {
    const now = new Date()
    const next = new Date(now)
    next.setHours(2, 0, 0, 0)

    // If 2 AM has already passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }

    return next.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      dateStyle: 'full',
      timeStyle: 'long',
    })
  }

  stop() {
    logger.info('=== SCHEDULER SERVICE STOPPING ===')
    this.tasks.forEach((task) => task.stop())
    this.tasks = []
    logger.info('✓ Scheduler stopped successfully')
  }
}
