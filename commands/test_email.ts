import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export default class TestEmail extends BaseCommand {
  static commandName = 'test:email'
  static description = 'Send a test email to verify SMTP configuration'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const testEmail = this.prompt.ask('Enter email address to send test to:', {
      default: 'test@example.com',
    })

    const email = await testEmail

    this.logger.info('Sending test email...')

    try {
      await mail.send((message) => {
        message
          .to(email)
          .from(
            env.get('MAIL_FROM_ADDRESS', 'noreply@welcomers-portal.com'),
            env.get('MAIL_FROM_NAME', 'Community Welcome Portal')
          )
          .subject('Test Email from Welcomers Portal').html(`
            <h1>Test Email</h1>
            <p>This is a test email from the Welcomers Portal.</p>
            <p>If you're seeing this, your email configuration is working correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `)
      })

      this.logger.success('✅ Test email sent successfully!')
      this.logger.info('Check MailHog at http://localhost:8025 to see the email')
    } catch (error) {
      this.logger.error('❌ Failed to send test email')
      this.logger.error(error.message)
    }
  }
}
