import { test } from '@japa/runner'
import { MailService } from '#services/mail_service'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import mail from '@adonisjs/mail/services/main'

test.group('MailService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should instantiate MailService', async ({ assert }) => {
    const mailService = new MailService()
    assert.exists(mailService)
  })

  test('should send property sync notification', async ({ assert }) => {
    const mailService = new MailService()
    const user = await UserFactory.create()

    const mailSendSpy = {
      called: false,
      toValue: '',
    }

    const originalSend = mail.send
    mail.send = async (callback: any) => {
      mailSendSpy.called = true
      const message = {
        to: (email: string) => {
          mailSendSpy.toValue = email
          return message
        },
        from: () => message,
        subject: () => message,
        htmlView: () => message,
      }
      callback(message)
      return { messageId: 'test-message-id', response: 'OK' } as any
    }

    await mailService.sendPropertySyncNotification(user)

    assert.isTrue(mailSendSpy.called)
    assert.equal(mailSendSpy.toValue, user.email)

    mail.send = originalSend
  })

  test('should send forgot password email', async ({ assert }) => {
    const mailService = new MailService()
    const user = await UserFactory.create()
    await user.generateForgotPasswordToken()

    const mailSendSpy = {
      called: false,
      toValue: '',
    }

    const originalSend = mail.send
    mail.send = async (callback: any) => {
      mailSendSpy.called = true
      const message = {
        to: (email: string) => {
          mailSendSpy.toValue = email
          return message
        },
        from: () => message,
        subject: () => message,
        htmlView: () => message,
      }
      callback(message)
      return { messageId: 'test-message-id', response: 'OK' } as any
    }

    await mailService.sendForgotPasswordEmail(user)

    assert.isTrue(mailSendSpy.called)
    assert.equal(mailSendSpy.toValue, user.email)

    mail.send = originalSend
  })

  test('should send user registration confirmation', async ({ assert }) => {
    const mailService = new MailService()
    const user = await UserFactory.create()

    const mailSendSpy = {
      called: false,
      toValue: '',
    }

    const originalSend = mail.send
    mail.send = async (callback: any) => {
      mailSendSpy.called = true
      const message = {
        to: (email: string) => {
          mailSendSpy.toValue = email
          return message
        },
        from: () => message,
        subject: () => message,
        htmlView: () => message,
      }
      callback(message)
      return { messageId: 'test-message-id', response: 'OK' } as any
    }

    await mailService.sendUserRegistrationConfirmation(user)

    assert.isTrue(mailSendSpy.called)
    assert.equal(mailSendSpy.toValue, user.email)

    mail.send = originalSend
  })

  test('should send admin approval notification', async ({ assert }) => {
    const mailService = new MailService()
    const user = await UserFactory.create()

    const mailSendSpy = {
      called: false,
    }

    const originalSend = mail.send
    mail.send = async (callback: any) => {
      mailSendSpy.called = true
      const message = {
        to: () => message,
        from: () => message,
        subject: () => message,
        htmlView: () => message,
      }
      callback(message)
      return { messageId: 'test-message-id', response: 'OK' } as any
    }

    await mailService.sendAdminApprovalNotification(user)

    assert.isTrue(mailSendSpy.called)

    mail.send = originalSend
  })

  test('should send user approved notification', async ({ assert }) => {
    const mailService = new MailService()
    const user = await UserFactory.create()
    await user.generateForgotPasswordToken()

    const mailSendSpy = {
      called: false,
      toValue: '',
    }

    const originalSend = mail.send
    mail.send = async (callback: any) => {
      mailSendSpy.called = true
      const message = {
        to: (email: string) => {
          mailSendSpy.toValue = email
          return message
        },
        from: () => message,
        subject: () => message,
        htmlView: () => message,
      }
      callback(message)
      return { messageId: 'test-message-id', response: 'OK' } as any
    }

    await mailService.sendUserApprovedNotification(user)

    assert.isTrue(mailSendSpy.called)
    assert.equal(mailSendSpy.toValue, user.email)

    mail.send = originalSend
  })
})
