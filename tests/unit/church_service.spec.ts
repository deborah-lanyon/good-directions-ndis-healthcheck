import { test } from '@japa/runner'
import { ChurchService } from '#services/church_service'
import { PropertyService } from '#services/property_service'
import db from '@adonisjs/lucid/services/db'
import { ChurchFactory } from '#database/factories/church_factory'
import { UserFactory } from '#database/factories/user_factory'

test.group('ChurchService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should instantiate ChurchService', async ({ assert }) => {
    const churchService = new ChurchService()
    assert.exists(churchService)
  })

  test('should detect location changes when suburb changes', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id, suburb: 'Old Suburb' }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      suburb: 'New Suburb',
    })

    assert.isTrue(hasChanges)
  })

  test('should detect location changes when latitude changes', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id, latitude: -28.0 }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      latitude: -29.0,
    })

    assert.isTrue(hasChanges)
  })

  test('should detect location changes when longitude changes', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id, longitude: 153.0 }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      longitude: 154.0,
    })

    assert.isTrue(hasChanges)
  })

  test('should detect location changes when radius changes', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id, radius: 10.0 }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      radius: 20.0,
    })

    assert.isTrue(hasChanges)
  })

  test('should detect location changes when address changes', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id, address: 'Old Address' }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      address: 'New Address',
    })

    assert.isTrue(hasChanges)
  })

  test('should not detect location changes when values are the same', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Test Suburb',
      latitude: -28.0,
      longitude: 153.0,
      radius: 10.0,
      address: 'Test Address',
    }).create()

    const hasChanges = churchService.detectLocationChanges(church, {
      suburb: 'Test Suburb',
      latitude: -28.0,
      longitude: 153.0,
      radius: 10.0,
      address: 'Test Address',
    })

    assert.isFalse(hasChanges)
  })

  test('should not detect location changes when no location fields are provided', async ({
    assert,
  }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Test Suburb',
      churchName: 'Old Name',
    }).create()

    const hasChanges = churchService.detectLocationChanges(church, {})

    assert.isFalse(hasChanges)
  })

  test('should get church by user id', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id }).create()

    const result = await churchService.getChurchByUserId(user.id)

    assert.exists(result)
    assert.equal(result!.id, church.id)
    assert.equal(result!.userId, user.id)
  })

  test('should return null when church not found for user', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()

    const result = await churchService.getChurchByUserId(user.id)

    assert.isNull(result)
  })

  test('should throw error when updating profile for non-existent church', async ({ assert }) => {
    const churchService = new ChurchService()
    const user = await UserFactory.create()

    await assert.rejects(
      () => churchService.updateProfile(user.id, { churchName: 'New Name' }),
      'Church not found'
    )
  })

  test('should update profile without location changes', async ({ assert }) => {
    const mockPropertyService = {
      syncPropertiesForChurch: async () => {
        throw new Error('Should not be called')
      },
    } as unknown as PropertyService

    const churchService = new ChurchService(mockPropertyService)
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({
      userId: user.id,
      churchName: 'Old Name',
      url: 'https://old-url.com',
    }).create()

    const result = await churchService.updateProfile(user.id, {
      churchName: 'New Name',
      url: 'https://new-url.com',
    })

    assert.exists(result)
    assert.equal(result.church.id, church.id)
    assert.equal(result.church.churchName, 'New Name')
    assert.equal(result.church.url, 'https://new-url.com')
    assert.isNull(result.syncResult)
  })

  test('should update profile with location changes and sync properties', async ({ assert }) => {
    const mockSyncResult = {
      totalFromApi: 10,
      propertiesReported: 8,
      propertiesFiltered: 5,
      propertiesCreated: 3,
      propertiesSkipped: 2,
    }

    const mockPropertyService = {
      syncPropertiesForChurch: async () => mockSyncResult,
    } as unknown as PropertyService

    const churchService = new ChurchService(mockPropertyService)
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Old Suburb',
      latitude: -28.0,
      longitude: 153.0,
    }).create()

    const result = await churchService.updateProfile(user.id, {
      suburb: 'New Suburb',
      latitude: -29.0,
      longitude: 154.0,
    })

    assert.exists(result)
    assert.equal(result.church.id, church.id)
    assert.equal(result.church.suburb, 'New Suburb')
    assert.equal(result.church.latitude, -29.0)
    assert.equal(result.church.longitude, 154.0)
    assert.exists(result.syncResult)
    assert.equal(result.syncResult.totalFromApi, mockSyncResult.totalFromApi)
    assert.equal(result.syncResult.propertiesCreated, mockSyncResult.propertiesCreated)
  })

  test('should handle sync error gracefully when location changes', async ({ assert }) => {
    const mockPropertyService = {
      syncPropertiesForChurch: async () => {
        throw new Error('Sync failed')
      },
    } as unknown as PropertyService

    const churchService = new ChurchService(mockPropertyService)
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Old Suburb',
    }).create()

    const result = await churchService.updateProfile(user.id, {
      suburb: 'New Suburb',
    })

    assert.exists(result)
    assert.equal(result.church.id, church.id)
    assert.equal(result.church.suburb, 'New Suburb')
    assert.exists(result.syncResult)
    assert.exists(result.syncResult.error)
    assert.equal(result.syncResult.error, 'Sync failed')
  })

  test('should update profile with partial location changes', async ({ assert }) => {
    const mockSyncResult = {
      totalFromApi: 5,
      propertiesReported: 4,
      propertiesFiltered: 3,
      propertiesCreated: 2,
      propertiesSkipped: 1,
    }

    const mockPropertyService = {
      syncPropertiesForChurch: async () => mockSyncResult,
    } as unknown as PropertyService

    const churchService = new ChurchService(mockPropertyService)
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Old Suburb',
      radius: 10.0,
    }).create()

    const result = await churchService.updateProfile(user.id, {
      suburb: 'New Suburb',
      radius: 20.0,
    })

    assert.exists(result)
    assert.equal(result.church.suburb, 'New Suburb')
    assert.equal(result.church.radius, 20.0)
    assert.exists(result.syncResult)
  })
})
