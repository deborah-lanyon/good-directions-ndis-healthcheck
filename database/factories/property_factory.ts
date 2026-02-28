import factory from '@adonisjs/lucid/factories'
import Property from '#models/property'
import { DateTime } from 'luxon'
import { ChurchFactory } from './church_factory.js'

export const PropertyFactory = factory
  .define(Property, ({ faker }) => {
    const dateSold = faker.date.past({ years: 2 })
    return {
      address: faker.location.streetAddress(),
      dateSold: DateTime.fromJSDate(dateSold),
      feedbackStatus: 'pending',
      distanceFromChurch: Number.parseFloat(
        faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }).toString()
      ),
      latitude: Number.parseFloat(faker.location.latitude().toString()),
      longitude: Number.parseFloat(faker.location.longitude().toString()),
    }
  })
  .relation('church', () => ChurchFactory)
  .build()
