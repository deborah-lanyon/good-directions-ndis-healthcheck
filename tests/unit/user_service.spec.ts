import { test } from '@japa/runner'
import { UserService } from '#services/user_service'
import { MailService } from '#services/mail_service'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'

test.group('UserService', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should instantiate UserService', async ({ assert }) => {
    const userService = new UserService()
    assert.exists(userService)
  })

  test('should register new user', async ({ assert }) => {
    const mockMailService = {
      sendUserRegistrationConfirmation: async () => {},
      sendAdminApprovalNotification: async () => {},
    } as unknown as MailService

    const userService = new UserService(mockMailService)

    const result = await userService.register({
      name: 'Test User',
      email: 'test@example.com',
      churchName: 'Test Church',
      churchUrl: 'https://test.com',
    })

    assert.exists(result.user)
    assert.exists(result.church)
    assert.equal(result.user.email, 'test@example.com')
    assert.equal(result.church.churchName, 'Test Church')
  })

  test('should throw error when email is invalid', async ({ assert }) => {
    const userService = new UserService()
    await assert.rejects(
      () =>
        userService.register({
          name: 'Test User',
          email: 'invalid-email',
          churchName: 'Test Church',
          churchUrl: 'https://test.com',
        }),
      'Please provide a valid email address'
    )
  })

  test('should update user profile', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.create()

    const updatedUser = await userService.updateProfile(user.id, {
      fullName: 'Updated Name',
      email: 'updated@example.com',
    })

    assert.equal(updatedUser.fullName, 'Updated Name')
    assert.equal(updatedUser.email, 'updated@example.com')
  })

  test('should update only fullName when provided', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.create()
    const originalEmail = user.email

    const updatedUser = await userService.updateProfile(user.id, {
      fullName: 'Updated Name',
    })

    assert.equal(updatedUser.fullName, 'Updated Name')
    assert.equal(updatedUser.email, originalEmail)
  })

  test('should update only email when provided', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.create()
    const originalName = user.fullName

    const updatedUser = await userService.updateProfile(user.id, {
      email: 'updated@example.com',
    })

    assert.equal(updatedUser.email, 'updated@example.com')
    assert.equal(updatedUser.fullName, originalName)
  })

  test('should initiate password reset', async ({ assert }) => {
    const mockMailService = {
      sendForgotPasswordEmail: async () => {},
    } as unknown as MailService

    const userService = new UserService(mockMailService)
    const user = await UserFactory.create()

    const result = await userService.initiatePasswordReset(user.email)

    assert.exists(result.token)
    await user.refresh()
    assert.exists(user.forgotPasswordToken)
  })

  test('should throw error when user not found for password reset', async ({ assert }) => {
    const userService = new UserService()
    await assert.rejects(
      () => userService.initiatePasswordReset('nonexistent@example.com'),
      'User not found'
    )
  })

  test('should reset password with valid token', async ({ assert }) => {
    const userService = new UserService()
    const password = 'oldpassword123'
    const hashedPassword = await hash.use('scrypt').make(password)
    const user = await UserFactory.merge({ password: hashedPassword }).create()
    await user.generateForgotPasswordToken()

    const newPassword = 'newpassword123'
    await userService.resetPassword(user.forgotPasswordToken!, newPassword)

    await user.refresh()
    assert.isNull(user.forgotPasswordToken)
  })

  test('should throw error when token is invalid', async ({ assert }) => {
    const userService = new UserService()
    await assert.rejects(
      () => userService.resetPassword('invalid-token', 'newpassword123'),
      'Invalid or expired token'
    )
  })

  test('should throw error when token is expired', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.create()
    await user.generateForgotPasswordToken()

    const expiredDate = DateTime.now().minus({ days: 3 })
    user.forgotPasswordTokenExpiresAt = expiredDate
    await user.save()

    await assert.rejects(
      () => userService.resetPassword(user.forgotPasswordToken!, 'newpassword123'),
      'Token has expired'
    )
  })

  test('should approve user', async ({ assert }) => {
    const mockMailService = {
      sendUserApprovedNotification: async () => {},
    } as unknown as MailService

    const userService = new UserService(mockMailService)
    const user = await UserFactory.merge({ adminApprovalStatus: 'pending' }).create()
    await user.generateAdminApprovalToken()

    const approvedUser = await userService.approveUser(user.adminApprovalToken!)

    assert.equal(approvedUser.adminApprovalStatus, 'approved')
    assert.isNull(approvedUser.adminApprovalToken)
    assert.exists(approvedUser.forgotPasswordToken)
  })

  test('should throw error when approval token is invalid', async ({ assert }) => {
    const userService = new UserService()
    await assert.rejects(
      () => userService.approveUser('invalid-token'),
      'Invalid or expired approval token'
    )
  })

  test('should throw error when approval token is expired', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.merge({ adminApprovalStatus: 'pending' }).create()
    await user.generateAdminApprovalToken()

    const expiredDate = DateTime.now().minus({ days: 8 })
    user.adminApprovalTokenExpiresAt = expiredDate
    await user.save()

    await assert.rejects(
      () => userService.approveUser(user.adminApprovalToken!),
      'Approval token has expired'
    )
  })

  test('should throw error when user already processed', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.merge({ adminApprovalStatus: 'approved' }).create()
    await user.generateAdminApprovalToken()

    await assert.rejects(
      () => userService.approveUser(user.adminApprovalToken!),
      'User has already been processed'
    )
  })

  test('should reject user', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.merge({ adminApprovalStatus: 'pending' }).create()
    await user.generateAdminApprovalToken()

    const rejectedUser = await userService.rejectUser(user.adminApprovalToken!)

    assert.equal(rejectedUser.adminApprovalStatus, 'rejected')
    assert.isNull(rejectedUser.adminApprovalToken)
  })

  test('should throw error when reject token is invalid', async ({ assert }) => {
    const userService = new UserService()
    await assert.rejects(
      () => userService.rejectUser('invalid-token'),
      'Invalid or expired approval token'
    )
  })

  test('should throw error when reject token is expired', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.merge({ adminApprovalStatus: 'pending' }).create()
    await user.generateAdminApprovalToken()

    const expiredDate = DateTime.now().minus({ days: 8 })
    user.adminApprovalTokenExpiresAt = expiredDate
    await user.save()

    await assert.rejects(
      () => userService.rejectUser(user.adminApprovalToken!),
      'Approval token has expired'
    )
  })

  test('should throw error when rejecting already processed user', async ({ assert }) => {
    const userService = new UserService()
    const user = await UserFactory.merge({ adminApprovalStatus: 'rejected' }).create()
    await user.generateAdminApprovalToken()

    await assert.rejects(
      () => userService.rejectUser(user.adminApprovalToken!),
      'User has already been processed'
    )
  })
})
