import { DateTime } from 'luxon'
import Church from '#models/church'
import User from '#models/user'
import { PropertyService } from '#services/property_service'
import { MailService } from '#services/mail_service'

export class PropertySyncService {
  private propertyService: PropertyService
  private mailService: MailService

  constructor(propertyService?: PropertyService, mailService?: MailService) {
    this.propertyService = propertyService ?? new PropertyService()
    this.mailService = mailService ?? new MailService()
  }

  async findChurchesNeedingSync(): Promise<Church[]> {
    return await Church.query()
      .where('last_sync_date', '<=', DateTime.now().minus({ weeks: 1 }).toFormat('yyyy-MM-dd'))
      .orWhereNull('last_sync_date')
  }

  async syncAllChurches(): Promise<{
    message: string
    totalSynced: number
    churchesProcessed: number
  }> {
    const churchesToSync = await this.findChurchesNeedingSync()
    let totalSynced = 0

    for (const church of churchesToSync) {
      try {
        const result = await this.propertyService.syncPropertiesForChurchById(
          church.id,
          DateTime.now().minus({ weeks: 1 })
        )

        totalSynced += result.propertiesCreated

        // Update sync tracking fields so this church isn't re-synced unnecessarily
        const nowAustralia = DateTime.now().setZone('Australia/Sydney')
        church.lastSyncAt = nowAustralia
        church.lastSyncDate = nowAustralia
        church.syncStatus = 'completed'
        church.syncRetryCount = 0
        church.syncErrorMessage = null
        await church.save()

        // Send notifications in separate try/catch so failures don't affect sync reporting
        try {
          // Send email to church owner if properties were created
          if (result.propertiesCreated > 0 && church.userId) {
            const user = await User.find(church.userId)
            if (user) {
              await this.mailService.sendPropertySyncNotification(user)
            }
          }

          // Send emails to visitors who have properties assigned to them
          if (result.visitorAssignments && result.visitorAssignments.size > 0) {
            for (const [visitorId, assignmentData] of result.visitorAssignments) {
              console.log(
                `[SYNC] Sending notification to visitor ${visitorId} (${assignmentData.visitor.name}) for ${assignmentData.properties.length} properties`
              )
              await this.mailService.sendVisitorPropertyNotification(
                assignmentData.visitor,
                assignmentData.properties,
                assignmentData.streetGroupName
              )
            }
          }
        } catch (notificationError) {
          console.error(`[SYNC] Notification error for church ${church.id} (sync was successful):`, notificationError)
        }
      } catch (error) {
        console.error(`Failed to sync church ${church.id}:`, error)
        // Continue with next church even if one fails
      }
    }

    return {
      message: 'Properties synced successfully',
      totalSynced,
      churchesProcessed: churchesToSync.length,
    }
  }
}
