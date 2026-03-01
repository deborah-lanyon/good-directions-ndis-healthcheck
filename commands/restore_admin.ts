import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import app from '@adonisjs/core/services/app'

export default class RestoreAdmin extends BaseCommand {
  static commandName = 'restore:admin'
  static description = 'Restore super admin account'

  async run() {
    const email = 'lanyondeborah@gmail.com'
    const password = 'password123'
    const fullName = 'Deborah Lanyon'

    try {
      // Ensure app is booted
      await app.boot()

      const existing = await User.findBy('email', email)
      if (existing) {
        this.logger.info(`User already exists with ID: ${existing.id}`)
        return
      }

      const user = await User.create({
        email,
        password,
        fullName,
        role: 'admin',
        adminApprovalStatus: 'approved',
      })

      this.logger.success('✅ Admin account restored!')
      this.logger.info(`Email: ${email}`)
      this.logger.info(`Temporary Password: ${password}`)
      this.logger.info(`User ID: ${user.id}`)
      this.logger.warning('⚠️  IMPORTANT: Please change your password after logging in!')
    } catch (error) {
      this.logger.error('Error restoring admin account:')
      this.logger.error(error.message)
      this.logger.error(error.stack)
    }
  }
}
