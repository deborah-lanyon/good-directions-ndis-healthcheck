import { DateTime } from 'luxon'
import Church from '#models/church'
import User from '#models/user'
import { PropertyService } from '#services/property_service'
import { MailService } from '#services/mail_service'

const MAX_RETRY_ATTEMPTS = 3

export class PropertySyncOnLoginService {
  private propertyService: PropertyService
  private mailService: MailService

  constructor(propertyService?: PropertyService, mailService?: MailService) {
    this.propertyService = propertyService ?? new PropertyService()
    this.mailService = mailService ?? new MailService()
  }

  /**
   * Trigger a sync for a specific church (called on login)
   * Runs asynchronously - returns immediately
   * Only syncs once per day per church
   * @param churchId - The church ID to sync
   */
  async triggerSyncForChurch(churchId: number): Promise<void> {
    const church = await Church.find(churchId)
    if (!church) {
      console.error(`[SYNC ON LOGIN] Church ${churchId} not found`)
      return
    }

    // Check if already syncing (prevent overlapping syncs)
    // Allow restart if stuck in 'syncing' for more than 10 minutes
    if (church.syncStatus === 'syncing') {
      const minutesSinceUpdate = church.updatedAt ? Math.abs(church.updatedAt.diffNow().as('minutes')) : 0
      if (minutesSinceUpdate < 10) {
        console.log(`[SYNC ON LOGIN] Church ${churchId} is already syncing, skipping`)
        return
      }
      console.log(`[SYNC ON LOGIN] Church ${churchId} sync appears stale (${Math.round(minutesSinceUpdate)}m), restarting`)
    }

    // Sync every time the account owner logs in (no daily limit)

    // Skip sync if church is missing required configuration (don't count as retry)
    if (!church.suburb || !church.postcode) {
      console.log(`[SYNC ON LOGIN] Church ${churchId} missing suburb or postcode, skipping sync`)
      church.syncStatus = 'failed'
      church.syncErrorMessage = 'Territory is missing suburb or postcode. Please update your territory.'
      // Don't increment retry count for configuration issues
      await church.save()
      return
    }

    // Auto-reset retry count if last failure was more than 24 hours ago (transient errors recover)
    if (church.syncRetryCount >= MAX_RETRY_ATTEMPTS && church.updatedAt) {
      const hoursSinceLastAttempt = Math.abs(church.updatedAt.diffNow().as('hours'))
      if (hoursSinceLastAttempt >= 24) {
        console.log(`[SYNC ON LOGIN] Resetting retry count for church ${churchId} (last attempt was ${Math.round(hoursSinceLastAttempt)}h ago)`)
        church.syncRetryCount = 0
        church.syncErrorMessage = null
      }
    }

    // Start sync asynchronously (don't await)
    this.performSyncWithRetry(church).catch(async (error) => {
      console.error(`[SYNC ON LOGIN] Unhandled error for church ${churchId}:`, error)
      // Ensure sync status doesn't stay stuck at 'syncing'
      // Re-fetch church to avoid racing with performSyncWithRetry's own error handler
      try {
        const freshChurch = await Church.find(churchId)
        if (freshChurch && freshChurch.syncStatus === 'syncing') {
          freshChurch.syncStatus = 'failed'
          freshChurch.syncErrorMessage = error instanceof Error ? error.message : 'Unhandled sync error'
          await freshChurch.save()
        }
      } catch (_) {
        // Best effort
      }
    })
  }

  /**
   * Perform the actual sync with retry logic
   */
  private async performSyncWithRetry(church: Church): Promise<void> {
    console.log(`[SYNC ON LOGIN] Starting sync for church ${church.id} (${church.churchName})`)

    // Mark as syncing
    church.syncStatus = 'syncing'
    church.syncErrorMessage = null
    await church.save()

    let result: Awaited<ReturnType<PropertyService['syncPropertiesForChurchById']>> | null = null

    try {
      // Perform the sync
      result = await this.propertyService.syncPropertiesForChurchById(
        church.id,
        DateTime.now().minus({ weeks: 1 })
      )

      // Success - update status
      // Use Australian timezone to ensure the date is correct for Australian users
      const nowAustralia = DateTime.now().setZone('Australia/Sydney')
      church.syncStatus = 'completed'
      church.lastSyncAt = nowAustralia
      church.lastSyncDate = nowAustralia // Also update the date field for backward compatibility
      church.syncRetryCount = 0
      church.syncErrorMessage = null
      await church.save()

      console.log(
        `[SYNC ON LOGIN] Sync completed for church ${church.id} (${church.churchName}):`,
        JSON.stringify({
          apiTotal: result.totalFromApi,
          filtered: result.propertiesFiltered,
          created: result.propertiesCreated,
          updated: result.propertiesUpdated,
          skipped: result.propertiesSkipped,
          rentalsDelisted: result.propertiesRemoved,
        })
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[SYNC ON LOGIN] Sync failed for church ${church.id}:`, errorMessage)

      // Don't increment retry count for configuration errors (user needs to fix their profile)
      const isConfigError = errorMessage.includes('must have a suburb') ||
        errorMessage.includes('must have a postcode')

      if (!isConfigError) {
        church.syncRetryCount = (church.syncRetryCount || 0) + 1
      }
      church.syncErrorMessage = errorMessage

      church.syncStatus = 'failed'
      await church.save()

      if (isConfigError) {
        console.log(
          `[SYNC ON LOGIN] Configuration error for church ${church.id} - user needs to update profile`
        )
      } else if (church.syncRetryCount < MAX_RETRY_ATTEMPTS) {
        console.log(
          `[SYNC ON LOGIN] Will retry on next login (attempt ${church.syncRetryCount}/${MAX_RETRY_ATTEMPTS})`
        )
      } else {
        console.error(
          `[SYNC ON LOGIN] Max retries (${MAX_RETRY_ATTEMPTS}) reached for church ${church.id}`
        )
      }

      return // Don't attempt notifications if sync failed
    }

    // Send notifications AFTER sync is fully committed as 'completed'
    // These are in a separate try/catch so failures here can never mark the sync as 'failed'
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
            `[SYNC ON LOGIN] Sending notification to visitor ${visitorId} for ${assignmentData.properties.length} properties`
          )
          await this.mailService.sendVisitorPropertyNotification(
            assignmentData.visitor,
            assignmentData.properties,
            assignmentData.streetGroupName
          )
        }
      }
    } catch (notificationError) {
      // Log but don't affect sync status - the sync itself succeeded
      console.error(
        `[SYNC ON LOGIN] Notification error for church ${church.id} (sync was successful):`,
        notificationError instanceof Error ? notificationError.message : notificationError
      )
    }
  }

  /**
   * Get the sync status for a church
   */
  async getSyncStatus(churchId: number): Promise<{
    status: 'syncing' | 'completed' | 'failed' | 'never_synced'
    lastSyncAt: string | null
    retryCount: number
    errorMessage: string | null
  }> {
    const church = await Church.find(churchId)
    if (!church) {
      return {
        status: 'never_synced',
        lastSyncAt: null,
        retryCount: 0,
        errorMessage: null,
      }
    }

    // Determine status
    let status: 'syncing' | 'completed' | 'failed' | 'never_synced'
    const isStaleSyncing =
      church.syncStatus === 'syncing' &&
      church.updatedAt &&
      church.updatedAt.diffNow().as('minutes') < -10

    if (church.syncStatus === 'syncing' && !isStaleSyncing) {
      status = 'syncing'
    } else if (isStaleSyncing) {
      // Sync stuck in 'syncing' for >10 minutes - report as failed so user knows something went wrong
      status = 'failed'
    } else if (!church.lastSyncAt) {
      status = 'never_synced'
    } else if (church.syncStatus === 'failed') {
      status = 'failed'
    } else {
      status = 'completed'
    }

    return {
      status,
      lastSyncAt: church.lastSyncAt?.toISO() || null,
      retryCount: church.syncRetryCount || 0,
      errorMessage: church.syncErrorMessage,
    }
  }

  /**
   * Reset retry count for a church (can be called manually if needed)
   */
  async resetRetryCount(churchId: number): Promise<void> {
    const church = await Church.find(churchId)
    if (church) {
      church.syncRetryCount = 0
      church.syncErrorMessage = null
      church.syncStatus = null
      await church.save()
    }
  }
}
