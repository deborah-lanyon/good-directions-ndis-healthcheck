import { test } from '@japa/runner'
import { PropertyService } from '#services/property_service'
import { ZylaPropertyService } from '#services/zyla_property_service'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import { ChurchFactory } from '#database/factories/church_factory'
import { PropertyFactory } from '#database/factories/property_factory'
import { DateTime } from 'luxon'
import type { ZylaProperty } from '../../app/types/property.js'

test.group('PropertyService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should instantiate PropertyService', async ({ assert }) => {
    const propertyService = new PropertyService()
    assert.exists(propertyService)
  })

  test('should get properties for user', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id }).create()
    const property = await PropertyFactory.merge({
      churchId: church.id,
      feedbackStatus: 'pending',
    }).create()

    const result = await propertyService.getPropertiesForUser(user.id)

    assert.exists(result)
    assert.isArray(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].id, property.id)
  })

  test('should return empty array when no properties found', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user = await UserFactory.create()

    const result = await propertyService.getPropertiesForUser(user.id)

    assert.exists(result)
    assert.isArray(result)
    assert.equal(result.length, 0)
  })

  test('should format properties for notification', async ({ assert }) => {
    const propertyService = new PropertyService()
    const properties = [
      {
        address: {
          singleLineAddress: '123 Test St, Test Suburb 4000',
        },
        propertyType: 'HOUSE',
        propertySubType: 'House: Standard',
        settlementDate: '2024-01-15',
        saleType: 'Sale',
      },
    ]

    const result = propertyService.formatPropertiesForNotification(properties)

    assert.exists(result)
    assert.include(result, 'New Property Settlement')
    assert.include(result, '123 Test St')
  })

  test('should return message when no properties', async ({ assert }) => {
    const propertyService = new PropertyService()
    const result = propertyService.formatPropertiesForNotification([])

    assert.equal(result, 'No new property settlements found.')
  })

  test('should update property feedback status', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id }).create()
    const property = await PropertyFactory.merge({
      churchId: church.id,
      feedbackStatus: 'pending',
    }).create()

    const updatedProperty = await propertyService.updateProperty(property.id, user.id, {
      feedbackStatus: 'visited',
    })

    assert.equal(updatedProperty.feedbackStatus, 'visited')
    assert.isNotNull(updatedProperty.dateOfStatusChange)
    assert.isNotNull(updatedProperty.dateOfVisit)
  })

  test('should update property visitor', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id }).create()
    const property = await PropertyFactory.merge({
      churchId: church.id,
      feedbackStatus: 'pending',
    }).create()

    const updatedProperty = await propertyService.updateProperty(property.id, user.id, {
      visitor: 'John Doe',
    })

    assert.equal(updatedProperty.visitor, 'John Doe')
  })

  test('should throw error when updating property without permission', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user1.id }).create()
    const property = await PropertyFactory.merge({
      churchId: church.id,
    }).create()

    await assert.rejects(
      () => propertyService.updateProperty(property.id, user2.id, { feedbackStatus: 'visited' }),
      'You do not have permission to update this property'
    )
  })

  test('should throw error when no fields provided for update', async ({ assert }) => {
    const propertyService = new PropertyService()
    const user = await UserFactory.create()
    const church = await ChurchFactory.merge({ userId: user.id }).create()
    const property = await PropertyFactory.merge({
      churchId: church.id,
    }).create()

    await assert.rejects(
      () => propertyService.updateProperty(property.id, user.id, {}),
      'At least one field must be provided to update'
    )
  })

  test('should sync properties for church with mocked zyla service', async ({ assert }) => {
    const mockZylaProperties: ZylaProperty[] = [
      {
        address: {
          streetAddress: '123 Test St',
          suburb: 'Test Suburb',
          postcode: '4000',
          location: {
            latitude: -28.0,
            longitude: 153.0,
          },
        },
        dateSold: {
          value: DateTime.now().minus({ days: 5 }).toISO()!,
        },
        propertyType: 'HOUSE',
        propertyTypeDisplay: 'House: Standard',
      } as ZylaProperty,
    ]

    const mockZylaService = {
      fetchProperties: async () => ({
        properties: mockZylaProperties,
        totalFromApi: 1,
        propertiesReported: 1,
      }),
    } as unknown as ZylaPropertyService

    const propertyService = new PropertyService(mockZylaService)
    const user = await UserFactory.create()
    await ChurchFactory.merge({
      userId: user.id,
      suburb: 'Test Suburb',
      latitude: -28.0,
      longitude: 153.0,
      radius: 10.0,
    }).create()

    const result = await propertyService.syncPropertiesForChurch(
      user.id,
      DateTime.now().minus({ months: 1 })
    )

    assert.exists(result)
    assert.equal(result.totalFromApi, 1)
    assert.equal(result.propertiesReported, 1)
    assert.isAtLeast(result.propertiesCreated, 0)
  })

  test('should throw error when church not found for sync', async ({ assert }) => {
    const mockZylaService = {
      fetchProperties: async () => ({
        properties: [],
        totalFromApi: 0,
        propertiesReported: 0,
      }),
    } as unknown as ZylaPropertyService

    const propertyService = new PropertyService(mockZylaService)
    const user = await UserFactory.create()

    await assert.rejects(
      async () => {
        await propertyService.syncPropertiesForChurch(user.id, DateTime.now().minus({ months: 1 }))
      },
      Error,
      'Church profile not found'
    )
  })
})
