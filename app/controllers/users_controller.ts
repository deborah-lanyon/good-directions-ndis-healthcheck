import type { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#services/auth_service'
import { UserService } from '#services/user_service'
import { PropertySyncOnLoginService } from '#services/property_sync_on_login_service'
import { inject } from '@adonisjs/core'
import Church from '#models/church'
import Visitor from '#models/visitor'

export default class UsersController {
  @inject()
  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const authService = new AuthService()
      const user = await authService.login(email, password)

      // Clear any stale session keys from previous impersonation/demo sessions
      session.forget('impersonating_from')
      session.forget('acting_as_visitor_id')
      session.forget('demo_mode')
      session.forget('demo_church_id')
      session.forget('demo_visitor_id')

      await auth.use('web').login(user)

      // Trigger property sync on login for any user who owns a church
      const syncService = new PropertySyncOnLoginService()
      const church = await Church.query().where('user_id', user.id).first()
      if (church) {
        console.log(`[LOGIN] Found church ${church.id} (${church.churchName}) for user ${user.id}, triggering sync`)
        syncService.triggerSyncForChurch(church.id).catch((error) => {
          console.error('[LOGIN] Failed to trigger sync:', error)
        })
      }

      return response.json({
        message: 'Login successful',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Account not approved yet. Please wait for admin approval.'
      ) {
        return response.status(403).json({
          message: 'Account not approved yet. Please wait for admin approval.',
        })
      }
      return response.status(401).json({
        message: 'Invalid credentials',
      })
    }
  }

  @inject()
  async logout({ response, auth, session }: HttpContext) {
    // Clear all special session keys to prevent stale state on next login
    session.forget('impersonating_from')
    session.forget('acting_as_visitor_id')
    session.forget('demo_mode')
    session.forget('demo_church_id')
    session.forget('demo_visitor_id')

    await auth.use('web').logout()
    return response.redirect('/login')
  }

  @inject()
  async checkAuth({ response, auth }: HttpContext) {
    try {
      const user = await auth.use('web').authenticate()
      return response.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      })
    } catch (error) {
      return response.status(401).json({ message: 'Not authenticated' })
    }
  }

  async store({ request, response }: HttpContext) {
    const { name, email } = request.only(['name', 'email'])

    if (!name || !email) {
      return response.status(400).json({
        message: 'Name and email are required',
      })
    }

    try {
      const userService = new UserService()
      await userService.register({ name, email })
      return response.json({ message: 'Registration successful' })
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        if (error.message === 'Please provide a valid email address') {
          return response.status(400).json({
            message: 'Please provide a valid email address',
          })
        }
        // Check for duplicate email error message
        if (
          error.message.includes('unique constraint') ||
          error.message.includes('users_email_unique')
        ) {
          return response.status(400).json({
            message: 'An account with this email already exists',
          })
        }
      }
      // PostgreSQL duplicate key error code
      if ((error as any).code === '23505' || (error as any).code === 'ER_DUP_ENTRY') {
        return response.status(400).json({
          message: 'An account with this email already exists',
        })
      }
      return response.status(500).json({
        message: 'Registration failed. Please try again.',
      })
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    try {
      const userService = new UserService()
      const { token } = await userService.initiatePasswordReset(email)
      return response.json({
        message: 'Password reset token generated successfully',
        token,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return response.status(404).json({ message: 'User not found' })
      }
      return response.status(500).json({
        message: 'Failed to initiate password reset',
      })
    }
  }

  async resetPassword({ request, response, auth }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])

    try {
      const userService = new UserService()
      const user = await userService.resetPassword(token, password)

      // Auto-login the user after successful password reset
      await auth.use('web').login(user)

      return response.json({ message: 'Password reset successfully', redirectTo: '/dashboard' })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired token' || error.message === 'Token has expired') {
          return response.status(400).json({ message: error.message })
        }
      }
      return response.status(500).json({
        message: 'Failed to reset password',
      })
    }
  }

  public async resetRequest({ request, inertia, response }: HttpContext) {
    const token = request.qs().token

    if (!token) {
      return response.redirect('/forgot-password')
    }

    // Look up the user by token to get their email
    const User = (await import('#models/user')).default
    const user = await User.findBy('forgot_password_token', token)

    if (!user) {
      return response.redirect('/forgot-password')
    }

    return inertia.render('reset-password', { token, email: user.email })
  }

  /**
   * GET: Show confirmation page for approving a user (safe from email link scanners)
   */
  async approveUser({ params, inertia, response }: HttpContext) {
    const { token } = params

    try {
      // Only validate the token exists — do NOT perform the approval yet
      const User = (await import('#models/user')).default
      const user = await User.findBy('admin_approval_token', token)

      if (!user) {
        return inertia.render('confirm-approval', {
          action: 'approve',
          token,
          error: 'Invalid or expired approval token. The user may have already been approved.',
        })
      }

      if (!user.isAdminApprovalTokenValid()) {
        return inertia.render('confirm-approval', {
          action: 'approve',
          token,
          error: 'Approval token has expired.',
        })
      }

      if (user.adminApprovalStatus !== 'pending') {
        return inertia.render('confirm-approval', {
          action: 'approve',
          token,
          error: 'User has already been processed.',
        })
      }

      return inertia.render('confirm-approval', {
        action: 'approve',
        token,
        userName: user.fullName,
        userEmail: user.email,
      })
    } catch (error) {
      console.error('Error loading approval confirmation:', error)
      return response.status(500).json({ message: 'Failed to load approval page' })
    }
  }

  /**
   * POST: Actually perform the approval (not triggered by email link scanners)
   */
  async confirmApproveUser({ request, inertia, response }: HttpContext) {
    const { token } = request.only(['token'])

    if (!token) {
      return response.status(400).json({ message: 'Token is required' })
    }

    try {
      const userService = new UserService()
      await userService.approveUser(token)
      return inertia.render('user-approved-notification')
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired approval token') {
          return inertia.render('confirm-approval', {
            action: 'approve',
            token,
            error: 'Invalid or expired approval token. The user may have already been approved.',
          })
        }
        if (
          error.message === 'Approval token has expired' ||
          error.message === 'User has already been processed'
        ) {
          return inertia.render('confirm-approval', {
            action: 'approve',
            token,
            error: error.message,
          })
        }
      }
      return response.status(500).json({ message: 'Failed to approve user' })
    }
  }

  /**
   * GET: Show confirmation page for rejecting a user (safe from email link scanners)
   */
  async rejectUser({ params, inertia, response }: HttpContext) {
    const { token } = params

    try {
      const User = (await import('#models/user')).default
      const user = await User.findBy('admin_approval_token', token)

      if (!user) {
        return inertia.render('confirm-approval', {
          action: 'reject',
          token,
          error: 'Invalid or expired approval token. The user may have already been processed.',
        })
      }

      if (!user.isAdminApprovalTokenValid()) {
        return inertia.render('confirm-approval', {
          action: 'reject',
          token,
          error: 'Approval token has expired.',
        })
      }

      if (user.adminApprovalStatus !== 'pending') {
        return inertia.render('confirm-approval', {
          action: 'reject',
          token,
          error: 'User has already been processed.',
        })
      }

      return inertia.render('confirm-approval', {
        action: 'reject',
        token,
        userName: user.fullName,
        userEmail: user.email,
      })
    } catch (error) {
      console.error('Error loading rejection confirmation:', error)
      return response.status(500).json({ message: 'Failed to load rejection page' })
    }
  }

  /**
   * POST: Actually perform the rejection (not triggered by email link scanners)
   */
  async confirmRejectUser({ request, inertia, response }: HttpContext) {
    const { token } = request.only(['token'])

    if (!token) {
      return response.status(400).json({ message: 'Token is required' })
    }

    try {
      const userService = new UserService()
      await userService.rejectUser(token)
      return inertia.render('user-rejected-notification')
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired approval token') {
          return inertia.render('confirm-approval', {
            action: 'reject',
            token,
            error: 'Invalid or expired approval token. The user may have already been processed.',
          })
        }
        if (
          error.message === 'Approval token has expired' ||
          error.message === 'User has already been processed'
        ) {
          return inertia.render('confirm-approval', {
            action: 'reject',
            token,
            error: error.message,
          })
        }
      }
      return response.status(500).json({ message: 'Failed to reject user' })
    }
  }
  async update({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    try {
      const body = request.body()
      const userService = new UserService()
      await userService.updateProfile(user.id, {
        fullName: body.fullName,
        email: body.email,
      })

      // Sync changes to admin visitor record if one exists
      const church = await Church.query().where('user_id', user.id).first()
      if (church) {
        const adminVisitor = await Visitor.query()
          .where('church_id', church.id)
          .where('user_id', user.id)
          .where('is_admin_visitor', true)
          .first()

        if (adminVisitor) {
          if (body.fullName) adminVisitor.name = body.fullName
          if (body.email) adminVisitor.email = body.email
          await adminVisitor.save()
        }
      }

      return response.redirect('/church-profile')
    } catch (error) {
      return response.status(500).json({
        message: 'Failed to update user profile',
      })
    }
  }
}
