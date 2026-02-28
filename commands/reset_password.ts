import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import app from '@adonisjs/core/services/app'

export default class ResetPassword extends BaseCommand {
  static commandName = 'reset:password'
  static description = 'Reset user password'

  async run() {
    const email = 'lanyondeborah@gmail.com'
    const newPassword = 'password123'

    try {
      await app.boot()

      const user = await User.findByOrFail('email', email)
      user.password = newPassword
      await user.save()

      this.logger.success('✅ Password reset successfully!')
      this.logger.info(`Email: ${email}`)
      this.logger.info(`New Password: ${newPassword}`)
    } catch (error) {
      this.logger.error('Error resetting password:')
      this.logger.error(error.message)
    }
  }
}
