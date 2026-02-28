import factory from '@adonisjs/lucid/factories'
import Visitor from '#models/visitor'

export const VisitorFactory = factory
  .define(Visitor, async ({ faker }) => {
    return {
      churchId: 1, // Will be overridden in tests
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    }
  })
  .build()
