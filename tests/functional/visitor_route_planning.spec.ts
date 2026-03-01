import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { ChurchFactory } from '#database/factories/church_factory'
import { VisitorFactory } from '#database/factories/visitor_factory'
import { PropertyFactory } from '#database/factories/property_factory'
import db from '@adonisjs/lucid/services/db'

test.group('Visitor Route Planning', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('visitor can access route planning endpoint', async ({ client, assert }) => {
    // Create church with location
    const church = await ChurchFactory.merge({
      churchName: 'Test Church',
      latitude: -33.8688,
      longitude: 151.2093,
      address: '123 Test St, Sydney NSW 2000',
    }).create()

    // Create visitor user
    const visitorUser = await UserFactory.merge({
      role: 'admin',
      adminApprovalStatus: 'approved',
    }).create()

    // Create visitor record linked to user and church
    await VisitorFactory.merge({
      userId: visitorUser.id,
      churchId: church.id,
    }).create()

    // Create test properties for the church
    const properties = await Promise.all([
      PropertyFactory.merge({
        churchId: church.id,
        address: '1 George St, Sydney NSW 2000',
        latitude: -33.867,
        longitude: 151.207,
        feedbackStatus: 'pending',
      }).create(),
      PropertyFactory.merge({
        churchId: church.id,
        address: '200 George St, Sydney NSW 2000',
        latitude: -33.869,
        longitude: 151.208,
        feedbackStatus: 'pending',
      }).create(),
    ])

    // Authenticate as visitor
    const response = await client
      .post('/api/routes/plan')
      .loginAs(visitorUser)
      .json({
        propertyIds: properties.map((p) => p.id),
      })

    response.assertStatus(200)
    assert.exists(response.body().route)
    assert.equal(response.body().route.waypoints.length, 2)
    assert.exists(response.body().route.googleMapsUrl)
  })

  test('visitor cannot plan route for properties not assigned to them', async ({ client }) => {
    // Create two churches
    const church1 = await ChurchFactory.merge({
      churchName: 'Church 1',
      latitude: -33.8688,
      longitude: 151.2093,
    }).create()

    const church2 = await ChurchFactory.merge({
      churchName: 'Church 2',
      latitude: -34.9285,
      longitude: 138.6007,
    }).create()

    // Create visitor for church 1
    const visitorUser = await UserFactory.merge({
      role: 'admin',
      adminApprovalStatus: 'approved',
    }).create()

    await VisitorFactory.merge({
      userId: visitorUser.id,
      churchId: church1.id,
    }).create()

    // Create property for church 2
    const property = await PropertyFactory.merge({
      churchId: church2.id,
      latitude: -34.9285,
      longitude: 138.6007,
    }).create()

    // Try to plan route with church 2's property
    const response = await client
      .post('/api/routes/plan')
      .loginAs(visitorUser)
      .json({
        propertyIds: [property.id],
      })

    // Should fail - visitor shouldn't have access to other church's properties
    response.assertStatus(400)
  })

  test('route planning returns optimized order', async ({ client, assert }) => {
    const church = await ChurchFactory.merge({
      latitude: -33.8688,
      longitude: 151.2093,
      address: '123 Test St, Sydney NSW 2000',
    }).create()

    const visitorUser = await UserFactory.merge({
      role: 'admin',
      adminApprovalStatus: 'approved',
    }).create()

    await VisitorFactory.merge({
      userId: visitorUser.id,
      churchId: church.id,
    }).create()

    // Create properties in non-optimal order
    const properties = await Promise.all([
      PropertyFactory.merge({
        churchId: church.id,
        address: '1 George St, Sydney NSW 2000',
        latitude: -33.867,
        longitude: 151.207,
      }).create(),
      PropertyFactory.merge({
        churchId: church.id,
        address: '100 George St, Sydney NSW 2000',
        latitude: -33.868,
        longitude: 151.2075,
      }).create(),
      PropertyFactory.merge({
        churchId: church.id,
        address: '200 George St, Sydney NSW 2000',
        latitude: -33.869,
        longitude: 151.208,
      }).create(),
    ])

    const response = await client
      .post('/api/routes/plan')
      .loginAs(visitorUser)
      .json({
        propertyIds: properties.map((p) => p.id),
      })

    response.assertStatus(200)

    const { route } = response.body()
    assert.equal(route.waypoints.length, 3)
    assert.exists(route.totalDistance)
    assert.exists(route.totalDuration)
    assert.exists(route.optimizedOrder)

    // Each waypoint should have distance and duration from previous
    route.waypoints.forEach((waypoint: any, index: number) => {
      if (index > 0) {
        assert.exists(waypoint.distanceFromPrevious)
        assert.exists(waypoint.durationFromPrevious)
      }
    })
  })

  test('route planning requires at least one property', async ({ client }) => {
    const church = await ChurchFactory.create()
    const visitorUser = await UserFactory.merge({
      role: 'admin',
      adminApprovalStatus: 'approved',
    }).create()

    await VisitorFactory.merge({
      userId: visitorUser.id,
      churchId: church.id,
    }).create()

    const response = await client.post('/api/routes/plan').loginAs(visitorUser).json({
      propertyIds: [],
    })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Please select at least one property to plan a route',
    })
  })

  test('unauthenticated user cannot access route planning', async ({ client }) => {
    const response = await client.post('/api/routes/plan').json({
      propertyIds: [1, 2, 3],
    })

    response.assertStatus(401)
  })
})
