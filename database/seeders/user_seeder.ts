import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'

export default class extends BaseSeeder {
  async run() {
    // SECURITY: Only run in development environment
    const nodeEnv = env.get('NODE_ENV')
    if (nodeEnv === 'production') {
      console.warn('⚠️  Skipping user seeder in production environment')
      console.warn(
        '⚠️  Create super admin users manually via CLI: node ace make:super_admin <email>'
      )
      return
    }

    // For local development only - create a test super admin user
    // In production, use: node ace make:super_admin <email>
    const email = env.get('DEV_ADMIN_EMAIL', 'admin@example.com')
    const password = env.get('DEV_ADMIN_PASSWORD', 'password123')
    const fullName = env.get('DEV_ADMIN_NAME', 'Dev Admin')

    await User.updateOrCreate(
      { email },
      {
        email,
        fullName,
        password,
        role: 'admin',
        adminApprovalStatus: 'approved',
      }
    )

    console.log('✅ Created development admin user:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('⚠️  WARNING: This seeder only runs in development mode')
  }
}
