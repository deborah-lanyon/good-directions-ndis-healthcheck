import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class MakeSuperAdmin extends BaseCommand {
  static commandName = 'make:super-admin'
  static description = 'Make a user a super admin by email'

  @args.string({ description: 'Email address of the user to make super admin' })
  declare email: string

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    if (!this.email || !this.email.includes('@')) {
      this.logger.error('Please provide a valid email address')
      return
    }

    try {
      const user = await User.findBy('email', this.email)

      if (!user) {
        this.logger.error(`User with email ${this.email} not found`)
        return
      }

      user.role = 'super_admin'
      user.isSuperAdmin = true
      await user.save()

      this.logger.success(`Successfully made ${user.fullName} (${user.email}) a super admin!`)
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`)
    }
  }
}
