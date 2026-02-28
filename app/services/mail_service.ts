import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import Visitor from '#models/visitor'
import env from '#start/env'

export class MailService {
  private getFromAddress(): { email: string; name: string } {
    return {
      email: env.get('MAIL_FROM_ADDRESS', 'noreply@welcomers-portal.com'),
      name: env.get('MAIL_FROM_NAME', 'Community Welcome Portal'),
    }
  }

  /**
   * Get admin email addresses from ADMIN_EMAIL env var (supports comma-separated)
   */
  private getAdminEmails(): string[] {
    const adminEmail = env.get('ADMIN_EMAIL')
    if (!adminEmail) {
      console.warn('[MAIL SERVICE] ADMIN_EMAIL is not configured - admin notifications will not be sent')
      return []
    }
    const emails = adminEmail
      .split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0)

    if (emails.length === 0) {
      console.warn('[MAIL SERVICE] ADMIN_EMAIL is empty - admin notifications will not be sent')
    }
    return emails
  }

  async sendPropertySyncNotification(user: User): Promise<void> {
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const from = this.getFromAddress()

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from(from.email, from.name)
          .subject('New Properties Notification - Welcomers Portal')
          .htmlView('mail/property_sync_notification', { user, baseUrl })
      })
    } catch (error) {
      console.error('Error sending property sync notification email:', error)
    }
  }
  async sendForgotPasswordEmail(user: User): Promise<void> {
    console.log('MAIL SERVICE CALLED')
    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const resetPasswordUrl = `${baseUrl}/reset-password?token=${user.forgotPasswordToken}&email=${encodeURIComponent(user.email)}`
    const from = this.getFromAddress()

    // Log SMTP config for debugging
    console.log('[SMTP DEBUG]', {
      SMTP_HOST: env.get('SMTP_HOST'),
      SMTP_PORT: env.get('SMTP_PORT'),
      SMTP_USERNAME: env.get('SMTP_USERNAME'),
      SMTP_PASSWORD: env.get('SMTP_PASSWORD') ? '***' : '(empty)',
      MAIL_FROM_ADDRESS: env.get('MAIL_FROM_ADDRESS'),
      MAIL_FROM_NAME: env.get('MAIL_FROM_NAME'),
    })

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from(from.email, from.name)
          .subject('Reset Password Request - Welcomers Portal')
          .htmlView('mail/forgot_password_email', {
            user,
            resetPasswordUrl,
          })
      })
      console.log('[SMTP DEBUG] Sent forgot password email to', user.email)
    } catch (error) {
      console.error('[SMTP ERROR] Error sending forgot password email:', error)
      if (error && error.stack) {
        console.error('[SMTP ERROR STACK]', error.stack)
      }
    }
  }

  async sendUserRegistrationConfirmation(user: User): Promise<void> {
    console.log('[REGISTRATION EMAIL] Starting sendUserRegistrationConfirmation for:', user.email)
    const from = this.getFromAddress()

    console.log('[REGISTRATION EMAIL] Config:', {
      to: user.email,
      from: from.email,
      SMTP_HOST: env.get('SMTP_HOST'),
      SMTP_PORT: env.get('SMTP_PORT'),
    })

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from(from.email, from.name)
          .subject('Registration Confirmation - Welcomers Portal')
          .htmlView('mail/user_registration_confirmation', { user })
      })
      console.log('[REGISTRATION EMAIL] Successfully sent registration confirmation to:', user.email)
    } catch (error) {
      console.error('[REGISTRATION EMAIL ERROR] Error sending user registration confirmation email:', error)
      if (error && (error as Error).stack) {
        console.error('[REGISTRATION EMAIL ERROR STACK]', (error as Error).stack)
      }
    }
  }

  async sendAdminApprovalNotification(
    user: User,
    churchInfo?: { churchName: string; churchUrl: string }
  ): Promise<void> {
    console.log('[ADMIN APPROVAL EMAIL] Starting sendAdminApprovalNotification for:', user.email)

    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const approveUrl = `${baseUrl}/api/admin/approve-user/${user.adminApprovalToken}`
    const rejectUrl = `${baseUrl}/api/admin/reject-user/${user.adminApprovalToken}`
    const from = this.getFromAddress()

    const adminEmails = this.getAdminEmails()
    console.log('[ADMIN APPROVAL EMAIL] Config:', {
      registeredUser: user.email,
      adminEmails,
      from: from.email,
      hasApprovalToken: !!user.adminApprovalToken,
      SMTP_HOST: env.get('SMTP_HOST'),
      SMTP_PORT: env.get('SMTP_PORT'),
    })

    if (adminEmails.length === 0) {
      console.warn('[ADMIN APPROVAL EMAIL] No admin emails configured - skipping notification')
      return
    }

    try {
      await mail.send((message) => {
        const msg = message
          .from(from.email, from.name)
          .subject(`New User Registration - ${user.fullName} (${user.email})`)
          .htmlView('mail/admin_approval_notification', {
            user,
            approveUrl,
            rejectUrl,
            churchInfo,
          })
        for (const email of adminEmails) {
          msg.to(email)
        }
      })
      console.log('[ADMIN APPROVAL EMAIL] Successfully sent admin approval notification for:', user.email)
    } catch (error) {
      console.error('[ADMIN APPROVAL EMAIL ERROR] Error sending admin approval notification email:', error)
      if (error && (error as Error).stack) {
        console.error('[ADMIN APPROVAL EMAIL ERROR STACK]', (error as Error).stack)
      }
    }
  }

  async sendUserApprovedNotification(user: User): Promise<void> {
    console.log('[APPROVAL EMAIL] Starting sendUserApprovedNotification for:', user.email)

    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const resetPasswordUrl = `${baseUrl}/reset-password?token=${user.forgotPasswordToken}&email=${encodeURIComponent(user.email)}&new=true`
    const from = this.getFromAddress()

    console.log('[APPROVAL EMAIL] Config:', {
      to: user.email,
      from: from.email,
      fromName: from.name,
      baseUrl,
      hasToken: !!user.forgotPasswordToken,
      tokenLength: user.forgotPasswordToken?.length || 0,
      SMTP_HOST: env.get('SMTP_HOST'),
      SMTP_PORT: env.get('SMTP_PORT'),
    })

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from(from.email, from.name)
          .subject('Account Approved - Set Your Password')
          .htmlView('mail/user_approved_notification', {
            user,
            resetPasswordUrl,
          })
      })
      console.log('[APPROVAL EMAIL] Successfully sent approval email to:', user.email)
    } catch (error) {
      console.error('[APPROVAL EMAIL ERROR] Error sending user approved notification email:', error)
      if (error && (error as Error).stack) {
        console.error('[APPROVAL EMAIL ERROR STACK]', (error as Error).stack)
      }
    }
  }

  async sendVisitorPropertyNotification(
    visitor: Visitor,
    properties: Array<{ address: string; dateSold: string; listingType?: 'sold' | 'rent' }>,
    streetGroupName: string
  ): Promise<void> {
    if (!visitor.email) {
      console.log(`Skipping notification for visitor ${visitor.name} - no email address`)
      return
    }

    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const from = this.getFromAddress()

    try {
      await mail.send((message) => {
        message
          .to(visitor.email!)
          .from(from.email, from.name)
          .subject(
            properties.length === 1
              ? 'New Property Assigned to You'
              : `${properties.length} New Properties Assigned to You`
          )
          .htmlView('mail/visitor_property_notification', {
            visitor,
            properties,
            propertyCount: properties.length,
            streetGroupName,
            baseUrl,
          })
      })
      console.log(`Sent property notification to visitor ${visitor.name} (${visitor.email})`)
    } catch (error) {
      console.error(`Error sending visitor property notification to ${visitor.email}:`, error)
    }
  }

  /**
   * Send notification to visitor when they are assigned to a street group
   */
  async sendVisitorStreetGroupAssignment(
    visitor: Visitor,
    streetGroupName: string,
    streets: string[],
    properties: Array<{ address: string; dateSold: string }>
  ): Promise<void> {
    if (!visitor.email) {
      console.log(`Skipping street group assignment notification for visitor ${visitor.name} - no email address`)
      return
    }

    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const from = this.getFromAddress()

    try {
      await mail.send((message) => {
        message
          .to(visitor.email!)
          .from(from.email, from.name)
          .subject(`You've been assigned to ${streetGroupName}`)
          .htmlView('mail/visitor_street_group_assignment', {
            visitor,
            streetGroupName,
            streets,
            properties,
            propertyCount: properties.length,
            baseUrl,
          })
      })
      console.log(`Sent street group assignment notification to visitor ${visitor.name} (${visitor.email})`)
    } catch (error) {
      console.error(`Error sending street group assignment notification to ${visitor.email}:`, error)
    }
  }

  /**
   * Send notification to visitors when a new street is added to their street group
   */
  async sendVisitorNewStreetNotification(
    visitor: Visitor,
    streetGroupName: string,
    newStreetName: string,
    properties: Array<{ address: string; dateSold: string }>
  ): Promise<void> {
    if (!visitor.email) {
      console.log(`Skipping new street notification for visitor ${visitor.name} - no email address`)
      return
    }

    const baseUrl = env.get('APP_URL', 'http://localhost:3333')
    const from = this.getFromAddress()

    try {
      await mail.send((message) => {
        message
          .to(visitor.email!)
          .from(from.email, from.name)
          .subject(`New street added to ${streetGroupName}`)
          .htmlView('mail/visitor_new_street_notification', {
            visitor,
            streetGroupName,
            newStreetName,
            properties,
            propertyCount: properties.length,
            baseUrl,
          })
      })
      console.log(`Sent new street notification to visitor ${visitor.name} (${visitor.email})`)
    } catch (error) {
      console.error(`Error sending new street notification to ${visitor.email}:`, error)
    }
  }
}
