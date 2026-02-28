import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: await hash.use('scrypt').make('password123'),
      adminApprovalStatus: 'approved' as const,
      role: 'church_admin' as const,
    }
  })
  .build()
