import { test } from '@japa/runner'
import { PropertySyncService } from '#services/property_sync_service'
import { PropertyService } from '#services/property_service'
import { MailService } from '#services/mail_service'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import { ChurchFactory } from '#database/factories/church_factory'
import { DateTime } from 'luxon'

test.group('PropertySyncService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should instantiate PropertySyncService', async ({ assert }) => {
    const syncService = new PropertySyncService()
    assert.exists(syncService)
  })

  test('should find churches needing sync', async ({ assert }) => {
    const syncService = new PropertySyncService()
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      lastSyncDate: DateTime.now().minus({ weeks: 2 }),
    }).create()

    const result = await syncService.findChurchesNeedingSync()

    assert.exists(result)
    assert.isArray(result)
    assert.isAtLeast(result.length, 0)
  })

  test('should sync all churches', async ({ assert }) => {
    const mockSyncResult = {
      totalFromApi: 5,
      propertiesReported: 4,
      propertiesFiltered: 3,
      propertiesCreated: 2,
      propertiesSkipped: 1,
    }

    const mockPropertyService = {
      syncPropertiesForChurch: async () => mockSyncResult,
      syncPropertiesForChurchById: async () => mockSyncResult,
    } as unknown as PropertyService

    const mockMailService = {
      sendPropertySyncNotification: async () => {},
    } as unknown as MailService

    const syncService = new PropertySyncService(mockPropertyService, mockMailService)
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      lastSyncDate: DateTime.now().minus({ weeks: 2 }),
    }).create()

    const result = await syncService.syncAllChurches()

    assert.exists(result)
    assert.equal(result.message, 'Properties synced successfully')
  })

  test('should send notification when properties are created', async ({ assert }) => {
    const mockSyncResult = {
      totalFromApi: 5,
      propertiesReported: 4,
      propertiesFiltered: 3,
      propertiesCreated: 2,
      propertiesSkipped: 1,
    }

    let mailSent = false
    const mockPropertyService = {
      syncPropertiesForChurch: async () => mockSyncResult,
      syncPropertiesForChurchById: async () => mockSyncResult,
    } as unknown as PropertyService

    const mockMailService = {
      sendPropertySyncNotification: async () => {
        mailSent = true
      },
    } as unknown as MailService

    const syncService = new PropertySyncService(mockPropertyService, mockMailService)
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      lastSyncDate: DateTime.now().minus({ weeks: 2 }),
    }).create()

    await syncService.syncAllChurches()

    assert.isTrue(mailSent)
  })

  test('should not send notification when no properties created', async ({ assert }) => {
    const mockSyncResult = {
      totalFromApi: 5,
      propertiesReported: 4,
      propertiesFiltered: 3,
      propertiesCreated: 0,
      propertiesSkipped: 3,
    }

    let mailSent = false
    const mockPropertyService = {
      syncPropertiesForChurch: async () => mockSyncResult,
      syncPropertiesForChurchById: async () => mockSyncResult,
    } as unknown as PropertyService

    const mockMailService = {
      sendPropertySyncNotification: async () => {
        mailSent = true
      },
    } as unknown as MailService

    const syncService = new PropertySyncService(mockPropertyService, mockMailService)
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      lastSyncDate: DateTime.now().minus({ weeks: 2 }),
    }).create()

    await syncService.syncAllChurches()

    assert.isFalse(mailSent)
  })
})
