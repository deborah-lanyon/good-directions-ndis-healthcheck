import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'

export default class TestLogin extends BaseCommand {
  static commandName = 'test:login'
  static description = 'Test login and reset password'

  async run() {
    const email = 'lanyondeborah@gmail.com'
    const newPassword = 'password123'

    try {
      await app.boot()

      const user = await User.findByOrFail('email', email)

      this.logger.info('User found:')
      this.logger.info(`- ID: ${user.id}`)
      this.logger.info(`- Email: ${user.email}`)
      this.logger.info(`- Full Name: ${user.fullName}`)
      this.logger.info(`- Role: ${user.role}`)

      // Hash the new password
      const hashedPassword = await hash.make(newPassword)
      this.logger.info(`\nNew password hash: ${hashedPassword.substring(0, 20)}...`)

      // Update password directly (Lucid will NOT auto-hash if we assign the hash)
      user.password = newPassword // Let the model hash it
      await user.save()

      this.logger.success(`\n✅ Password reset to: ${newPassword}`)

      // Verify it works
      const canLogin = await hash.verify(user.password, newPassword)
      this.logger.info(`Can login with new password: ${canLogin}`)
    } catch (error) {
      this.logger.error('Error:')
      this.logger.error(error.message)
      this.logger.error(error.stack)
    }
  }
}
