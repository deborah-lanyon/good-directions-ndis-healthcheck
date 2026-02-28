import factory from '@adonisjs/lucid/factories'
import Church from '#models/church'
import { UserFactory } from './user_factory.js'

export const ChurchFactory = factory
  .define(Church, ({ faker }) => {
    return {
      churchName: faker.company.name(),
      url: faker.internet.url(),
      address: faker.location.streetAddress(),
      latitude: Number.parseFloat(faker.location.latitude().toString()),
      longitude: Number.parseFloat(faker.location.longitude().toString()),
      suburb: faker.location.city(),
      postcode: faker.location.zipCode(),
      radius: Number.parseFloat(
        faker.number.float({ min: 1, max: 50, fractionDigits: 2 }).toString()
      ),
      mapBounds: {
        ne: {
          lat: Number.parseFloat(faker.location.latitude().toString()),
          lng: Number.parseFloat(faker.location.longitude().toString()),
        },
        sw: {
          lat: Number.parseFloat(faker.location.latitude().toString()),
          lng: Number.parseFloat(faker.location.longitude().toString()),
        },
      },
      mapZoom: faker.number.int({ min: 5, max: 18 }),
    }
  })
  .relation('user', () => UserFactory)
  .build()
