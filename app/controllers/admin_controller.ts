import type { HttpContext } from '@adonisjs/core/http'
import Church from '#models/church'
import Property from '#models/property'
import StreetGroup from '#models/street_group'
import WelcomePackTemplate from '#models/welcome_pack_template'
import User from '#models/user'
import type { UserRole } from '#models/user'
import { UserService } from '#services/user_service'
import { SiteSettingsService } from '#services/site_settings_service'
import { MailService } from '#services/mail_service'
import { AnalyticsService } from '#services/analytics_service'

export default class AdminController {
  /**
   * Get list of approved users (for assignment dropdown)
   */
  async getApprovedUsers({ response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const users = await User.query()
        .where('admin_approval_status', 'approved')
        .orderBy('email', 'asc')
        .select('id', 'email', 'full_name')

      return response.ok(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
        }))
      )
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.internalServerError({ error: 'Failed to fetch users' })
    }
  }

  /**
   * Super admin dashboard
   */
  async dashboard({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }
    return inertia.render('admin/dashboard', {})
  }

  /**
   * Display all church profiles for admin users
   */
  async churches({ inertia, auth, response }: HttpContext) {
    // Check if user is super admin
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      // Get all churches with their users (exclude demo churches)
      const churches = await Church.query()
        .where((q) => {
          q.where('is_demo', false).orWhereNull('is_demo')
        })
        .preload('user')
        .orderBy('church_name', 'asc')

      // Get counts for each church
      const churchesData = await Promise.all(
        churches.map(async (church) => {
          const [propertyCount, streetGroupCount, welcomePackTemplate] = await Promise.all([
            Property.query().where('church_id', church.id).count('* as total'),
            StreetGroup.query().where('church_id', church.id).count('* as total'),
            WelcomePackTemplate.query().where('church_id', church.id).first(),
          ])

          const data = {
            id: church.id,
            churchName: church.churchName,
            address: church.address,
            suburb: church.suburb,
            postcode: church.postcode,
            url: church.url,
            latitude: church.latitude,
            longitude: church.longitude,
            radius: church.radius,
            logoUrl: welcomePackTemplate?.logoUrl || null,
            bannerUrl: welcomePackTemplate?.bannerUrl || null,
            user: church.user
              ? {
                  id: church.user.id,
                  fullName: church.user.fullName,
                  email: church.user.email,
                  adminApprovalStatus: church.user.adminApprovalStatus,
                }
              : null,
            propertyCount: Number(propertyCount[0].$extras.total),
            streetGroupCount: Number(streetGroupCount[0].$extras.total),
            hasWelcomePack: !!welcomePackTemplate && welcomePackTemplate.enabled,
            createdAt: church.createdAt?.toISO(),
            updatedAt: church.updatedAt?.toISO(),
            // If sync has been 'syncing' for more than 10 minutes, treat as stale
            syncStatus: church.syncStatus === 'syncing' &&
              church.updatedAt &&
              church.updatedAt.diffNow().as('minutes') < -10
                ? 'completed'
                : church.syncStatus,
            lastSyncAt: church.lastSyncAt?.toISO() || null,
            syncErrorMessage: church.syncErrorMessage,
          }
          return data
        })
      )

      return inertia.render('admin/churches', {
        churches: churchesData,
      })
    } catch (error) {
      console.error('Error loading churches:', error)
      return inertia.render('admin/churches', {
        churches: [],
      })
    }
  }

  /**
   * Lightweight sync status endpoint for polling from admin/churches page
   */
  async churchesSyncStatus({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied.')
    }

    const churches = await Church.query()
      .where((q) => {
        q.where('is_demo', false).orWhereNull('is_demo')
      })
      .select('id', 'sync_status', 'last_sync_at', 'sync_error_message', 'updated_at')

    return response.json(
      churches.map((church) => {
        const isStaleSyncing =
          church.syncStatus === 'syncing' &&
          church.updatedAt &&
          church.updatedAt.diffNow().as('minutes') < -10

        return {
          id: church.id,
          syncStatus: isStaleSyncing ? 'completed' : church.syncStatus,
          lastSyncAt: church.lastSyncAt?.toISO() || null,
          syncErrorMessage: church.syncErrorMessage,
        }
      })
    )
  }

  /**
   * Bulk approve churches
   */
  async bulkApprove({ request, response, auth }: HttpContext) {
    // Check if user is super admin
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchIds } = request.only(['churchIds'])

      if (!Array.isArray(churchIds) || churchIds.length === 0) {
        return response.badRequest({ error: 'Invalid church IDs' })
      }

      // Get all churches and their users
      const churches = await Church.query().whereIn('id', churchIds).preload('user')

      // Update each user's approval status and send setup emails
      const mailService = new MailService()
      await Promise.all(
        churches.map(async (church) => {
          const wasNotApproved = church.user.adminApprovalStatus !== 'approved'
          church.user.adminApprovalStatus = 'approved'
          await church.user.save()

          // Send password setup email for newly approved users
          if (wasNotApproved) {
            await church.user.generateForgotPasswordToken()
            mailService.sendUserApprovedNotification(church.user).catch((error) => {
              console.error(`Failed to send approval email to ${church.user.email}:`, error)
            })
          }
        })
      )

      return response.ok({ message: 'Churches approved successfully', count: churches.length })
    } catch (error) {
      console.error('Error bulk approving churches:', error)
      return response.internalServerError({ error: 'Failed to approve churches' })
    }
  }

  /**
   * Bulk reject churches
   */
  async bulkReject({ request, response, auth }: HttpContext) {
    // Check if user is super admin
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchIds } = request.only(['churchIds'])

      if (!Array.isArray(churchIds) || churchIds.length === 0) {
        return response.badRequest({ error: 'Invalid church IDs' })
      }

      // Get all churches and their users
      const churches = await Church.query().whereIn('id', churchIds).preload('user')

      // Update each user's approval status
      await Promise.all(
        churches.map(async (church) => {
          church.user.adminApprovalStatus = 'rejected'
          await church.user.save()
        })
      )

      return response.ok({ message: 'Churches rejected successfully', count: churches.length })
    } catch (error) {
      console.error('Error bulk rejecting churches:', error)
      return response.internalServerError({ error: 'Failed to reject churches' })
    }
  }

  /**
   * Create a new church (super admin only)
   */
  async createChurch({ request, response, auth }: HttpContext) {
    // Check if user is super admin
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const data = request.only(['churchName', 'address', 'suburb', 'postcode', 'url', 'assignToSelf'])

      let ownerUserId: number

      if (data.assignToSelf) {
        // Check if superadmin already owns a church
        const existingChurch = await Church.query().where('user_id', user.id).first()
        if (existingChurch) {
          return response.conflict({
            error: `You already manage "${existingChurch.churchName}". Unassign yourself first, or create without "Manage this church myself".`,
          })
        }
        ownerUserId = user.id
      } else {
        // Generate a temporary user for this church
        const urlSlug = data.url
          ? data.url.replace(/[^a-z0-9]/gi, '-').toLowerCase()
          : data.churchName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
        const tempEmail = `temp-${Date.now()}@${urlSlug}.temp`
        const User = (await import('#models/user')).default
        const tempUser = await User.create({
          email: tempEmail,
          password: Math.random().toString(36).substring(2, 15), // Random password
          fullName: `Temp User for ${data.churchName}`,
          adminApprovalStatus: 'approved',
          isSuperAdmin: false,
        })
        ownerUserId = tempUser.id
      }

      // Geocode the address if suburb/address provided but no coordinates
      let latitude: number | undefined
      let longitude: number | undefined
      if (data.suburb || data.address) {
        try {
          const { GeocodingService } = await import('#services/geocoding_service')
          const geocodingService = new GeocodingService()
          const addressParts = [data.address, data.suburb, data.postcode, 'Australia']
            .filter(Boolean)
            .join(', ')
          const geo = await geocodingService.geocodeAddress(addressParts)
          latitude = geo.lat
          longitude = geo.lon
          console.log(`[CREATE CHURCH] Geocoded "${addressParts}" to ${latitude}, ${longitude}`)
        } catch (err) {
          console.error('[CREATE CHURCH] Geocoding failed (continuing without coordinates):', err)
        }
      }

      const church = await Church.create({
        churchName: data.churchName,
        address: data.address,
        suburb: data.suburb,
        postcode: data.postcode,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        url: data.url || `church-${Date.now()}.example.com`,
        userId: ownerUserId,
      })

      // Trigger initial property sync after a delay to avoid API rate limits
      // 30s delay gives time for any other in-progress syncs to finish
      const { PropertySyncOnLoginService } = await import('#services/property_sync_on_login_service')
      const createSyncService = new PropertySyncOnLoginService()
      console.log(`[CREATE CHURCH] Scheduling initial sync for church ${church.id} (${church.churchName}) in 30s`)
      setTimeout(() => {
        createSyncService.triggerSyncForChurch(church.id).catch((error) => {
          console.error(`[CREATE CHURCH] Failed to trigger sync for church ${church.id}:`, error)
        })
      }, 30000)

      return response.created({
        message: 'Church created successfully',
        church: church.serialize(),
      })
    } catch (error) {
      console.error('Error creating church:', error)
      return response.internalServerError({ error: 'Failed to create church' })
    }
  }

  /**
   * Assign a church to a user (super admin only)
   */
  async assignChurch({ request, response, auth, params }: HttpContext) {
    // Check if user is super admin
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchId } = params
      const { userId, userEmail } = request.only(['userId', 'userEmail'])

      const church = await Church.findOrFail(churchId)

      // Find user by email if provided, otherwise use userId
      let targetUser
      if (userEmail) {
        targetUser = await User.query().whereRaw('LOWER(email) = LOWER(?)', [userEmail]).first()
        if (!targetUser) {
          return response.badRequest({ error: 'User not found with that email' })
        }
      } else if (userId) {
        targetUser = await User.findOrFail(userId)
      } else {
        return response.badRequest({ error: 'Either userId or userEmail must be provided' })
      }

      // Update the church's user_id
      church.userId = targetUser.id
      await church.save()

      return response.ok({
        message: 'Church assigned successfully',
        church: church.serialize(),
        user: {
          id: targetUser.id,
          email: targetUser.email,
          fullName: targetUser.fullName,
        },
      })
    } catch (error) {
      console.error('Error assigning church:', error)
      return response.internalServerError({ error: 'Failed to assign church' })
    }
  }

  /**
   * Impersonate a user (login as them) - super admin only
   */
  async impersonateUser({ params, response, auth, session }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { userId } = params
      const targetUser = await User.findOrFail(userId)

      // Store the original admin user ID FIRST
      const adminId = currentUser.id
      session.put('impersonating_from', adminId)

      // Clear any active demo mode so the banner doesn't bleed into impersonation
      session.forget('demo_mode')
      session.forget('demo_church_id')
      session.forget('demo_visitor_id')

      // Complete logout and login sequence
      await auth.use('web').logout()
      await auth.use('web').login(targetUser)

      // Trigger property sync for the impersonated user's church
      const { PropertySyncOnLoginService } = await import('#services/property_sync_on_login_service')
      const impersonateSyncService = new PropertySyncOnLoginService()
      const impersonatedChurch = await Church.query().where('user_id', targetUser.id).first()
      if (impersonatedChurch) {
        console.log(`[IMPERSONATE] Triggering sync for church ${impersonatedChurch.id} (${impersonatedChurch.churchName})`)
        impersonateSyncService.triggerSyncForChurch(impersonatedChurch.id).catch((error) => {
          console.error(`[IMPERSONATE] Failed to trigger sync for church ${impersonatedChurch.id}:`, error)
        })
      }

      // Use status 302 redirect to force a fresh page load
      return response.redirect().status(302).toPath('/dashboard')
    } catch (error) {
      console.error('Error impersonating user:', error)
      return response.internalServerError({ error: 'Failed to impersonate user' })
    }
  }

  /**
   * Stop impersonating and return to admin account
   */
  async stopImpersonating({ response, auth, session }: HttpContext) {
    const originalAdminId = session.get('impersonating_from')

    if (!originalAdminId) {
      return response.badRequest({ error: 'Not currently impersonating anyone' })
    }

    try {
      const adminUser = await User.findOrFail(originalAdminId)

      // Clear the impersonation session
      session.forget('impersonating_from')

      // Log out current user first
      await auth.use('web').logout()

      // Log back in as admin
      await auth.use('web').login(adminUser)

      return response.redirect('/admin/churches')
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      return response.internalServerError({ error: 'Failed to stop impersonation' })
    }
  }

  /**
   * Switch view mode for super admins with churches
   */
  async switchView({ request, response, auth, session }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    const { viewMode } = request.only(['viewMode'])

    if (!viewMode || !['admin', 'church'].includes(viewMode)) {
      return response.badRequest({ error: 'Invalid view mode. Must be "admin" or "church"' })
    }

    // Store view mode in session
    session.put('view_mode', viewMode)

    // Redirect based on view mode
    if (viewMode === 'admin') {
      return response.redirect('/admin/churches')
    } else {
      return response.redirect('/church-profile')
    }
  }

  /**
   * Delete a church and its associated user account
   */
  async deleteChurch({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchId } = params
      const church = await Church.query().where('id', churchId).preload('user').firstOrFail()

      // Prevent deletion if the associated user is a super admin
      if (church.user && church.user.isSuperAdminRole()) {
        return response.badRequest({ error: 'Cannot delete a church owned by a super admin' })
      }

      // Delete the church (this will cascade delete related data)
      await church.delete()

      // Delete the associated user if it exists
      if (church.user) {
        await church.user.delete()
      }

      return response.ok({ message: 'Church and associated account deleted successfully' })
    } catch (error) {
      console.error('Error deleting church:', error)
      return response.internalServerError({ error: 'Failed to delete church' })
    }
  }

  /**
   * USER MANAGEMENT METHODS
   */

  /**
   * Create a new user account manually - super admin only
   */
  async createUser({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { fullName, email, role } = request.only(['fullName', 'email', 'role'])

      if (!fullName || !email) {
        return response.badRequest({ error: 'Full name and email are required' })
      }

      const userService = new UserService()
      const newUser = await userService.createUserManually({ fullName, email, role })

      return response.ok({
        message: 'User created successfully. A password setup email has been sent.',
        user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user'
      return response.badRequest({ error: message })
    }
  }

  /**
   * Display all users page
   */
  async users({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const userService = new UserService()
      const [users, stats] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserStats(),
      ])

      return inertia.render('admin/users', {
        users: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          adminApprovalStatus: u.adminApprovalStatus,
          createdAt: u.createdAt.toISO(),
          church: u.church
            ? {
                id: u.church.id,
                churchName: u.church.churchName,
              }
            : null,
          visitor: u.visitor
            ? {
                id: u.visitor.id,
                name: u.visitor.name,
                church: u.visitor.church
                  ? {
                      churchName: u.visitor.church.churchName,
                    }
                  : null,
                streetGroups:
                  u.visitor.streetGroups?.map((sg) => ({
                    id: sg.id,
                    name: sg.name,
                  })) || [],
              }
            : null,
        })),
        stats,
      })
    } catch (error) {
      console.error('Error loading users:', error)
      return inertia.render('admin/users', {
        users: [],
        stats: { total: 0, byRole: {}, byStatus: {}, recentUsers: [] },
      })
    }
  }

  /**
   * Get filtered users (API endpoint)
   */
  async getUsers({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { role, status, search } = request.qs()
      const userService = new UserService()
      const users = await userService.getAllUsers({
        role,
        status,
        search,
        excludeTemp: true, // Exclude temporary users when fetching for assignment
      })

      return response.ok({
        users: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          adminApprovalStatus: u.adminApprovalStatus,
          createdAt: u.createdAt.toISO(),
          church: u.church
            ? {
                id: u.church.id,
                churchName: u.church.churchName,
              }
            : null,
          visitor: u.visitor
            ? {
                id: u.visitor.id,
                name: u.visitor.name,
              }
            : null,
        })),
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      return response.internalServerError({ error: 'Failed to fetch users' })
    }
  }

  /**
   * Update user details
   */
  async updateUser({ params, request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { userId } = params
      const data = request.only(['fullName', 'email', 'adminApprovalStatus'])
      const userService = new UserService()
      const updatedUser = await userService.updateUserAsAdmin(userId, data)

      return response.ok({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          adminApprovalStatus: updatedUser.adminApprovalStatus,
        },
      })
    } catch (error) {
      console.error('Error updating user:', error)
      if (error instanceof Error) {
        return response.badRequest({ error: error.message })
      }
      return response.internalServerError({ error: 'Failed to update user' })
    }
  }

  /**
   * Change user role
   */
  async changeUserRole({ params, request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { userId } = params
      const { role } = request.only(['role']) as { role: UserRole }

      if (!['super_admin', 'church_admin', 'visitor'].includes(role)) {
        return response.badRequest({ error: 'Invalid role' })
      }

      const userService = new UserService()
      const updatedUser = await userService.changeUserRole(userId, role)

      return response.ok({
        message: 'User role changed successfully',
        user: {
          id: updatedUser.id,
          role: updatedUser.role,
        },
      })
    } catch (error) {
      console.error('Error changing user role:', error)
      if (error instanceof Error) {
        return response.badRequest({ error: error.message })
      }
      return response.internalServerError({ error: 'Failed to change user role' })
    }
  }

  /**
   * Reset user password (send email)
   */
  async resetUserPassword({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { userId } = params
      const userService = new UserService()
      await userService.resetUserPassword(userId)

      return response.ok({ message: 'Password reset email sent successfully' })
    } catch (error) {
      console.error('Error resetting user password:', error)
      if (error instanceof Error) {
        return response.badRequest({ error: error.message })
      }
      return response.internalServerError({ error: 'Failed to reset password' })
    }
  }

  /**
   * Delete user account
   */
  async deleteUser({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { userId } = params
      const userService = new UserService()
      await userService.deleteUser(Number(userId), user.id)

      return response.ok({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error deleting user:', error)
      if (error instanceof Error) {
        return response.badRequest({ error: error.message })
      }
      return response.internalServerError({ error: 'Failed to delete user' })
    }
  }

  /**
   * SITE SETTINGS METHODS
   */

  /**
   * Display site settings page
   */
  async siteSettings({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const siteSettingsService = new SiteSettingsService()
      const settings = await siteSettingsService.getOrCreateSettings()

      return inertia.render('admin/site-settings', {
        settings: {
          id: settings.id,
          heroTitle: settings.heroTitle,
          heroParagraph1: settings.heroParagraph1,
          heroParagraph2: settings.heroParagraph2,
          heroParagraph3: settings.heroParagraph3,
          ctaTitle: settings.ctaTitle,
          ctaButtonText: settings.ctaButtonText,
          heroImageUrl: settings.heroImageUrl,
          // How To Use fields
          howToUseTitle: settings.howToUseTitle,
          howToUseIntro: settings.howToUseIntro,
          howToUseStep1Title: settings.howToUseStep1Title,
          howToUseStep1Content: settings.howToUseStep1Content,
          howToUseStep2Title: settings.howToUseStep2Title,
          howToUseStep2Content: settings.howToUseStep2Content,
          howToUseStep3Title: settings.howToUseStep3Title,
          howToUseStep3Content: settings.howToUseStep3Content,
          howToUseStep4Title: settings.howToUseStep4Title,
          howToUseStep4Content: settings.howToUseStep4Content,
          // About Us fields
          aboutUsTitle: settings.aboutUsTitle,
          aboutUsIntro: settings.aboutUsIntro,
          aboutUsMission: settings.aboutUsMission,
          aboutUsVision: settings.aboutUsVision,
          aboutUsContact: settings.aboutUsContact,
          aboutUsParagraph1: settings.aboutUsParagraph1,
          aboutUsParagraph2: settings.aboutUsParagraph2,
          aboutUsParagraph3: settings.aboutUsParagraph3,
        },
      })
    } catch (error) {
      console.error('Error loading site settings:', error)
      return inertia.render('admin/site-settings', {
        settings: null,
        error: 'Failed to load site settings',
      })
    }
  }

  /**
   * Get site settings (API endpoint)
   */
  async getSiteSettingsApi({ response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const siteSettingsService = new SiteSettingsService()
      const settings = await siteSettingsService.getOrCreateSettings()

      return response.ok({
        settings: {
          id: settings.id,
          heroTitle: settings.heroTitle,
          heroParagraph1: settings.heroParagraph1,
          heroParagraph2: settings.heroParagraph2,
          heroParagraph3: settings.heroParagraph3,
          ctaTitle: settings.ctaTitle,
          ctaButtonText: settings.ctaButtonText,
          heroImageUrl: settings.heroImageUrl,
        },
      })
    } catch (error) {
      console.error('Error fetching site settings:', error)
      return response.internalServerError({ error: 'Failed to fetch site settings' })
    }
  }

  /**
   * Update site settings (API endpoint)
   */
  async updateSiteSettings({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const data = request.only([
        'heroTitle',
        'heroParagraph1',
        'heroParagraph2',
        'heroParagraph3',
        'ctaTitle',
        'ctaButtonText',
        'heroImageUrl',
        // How To Use fields
        'howToUseTitle',
        'howToUseIntro',
        'howToUseStep1Title',
        'howToUseStep1Content',
        'howToUseStep2Title',
        'howToUseStep2Content',
        'howToUseStep3Title',
        'howToUseStep3Content',
        'howToUseStep4Title',
        'howToUseStep4Content',
        // About Us fields
        'aboutUsTitle',
        'aboutUsIntro',
        'aboutUsMission',
        'aboutUsVision',
        'aboutUsContact',
        'aboutUsParagraph1',
        'aboutUsParagraph2',
        'aboutUsParagraph3',
      ])

      const siteSettingsService = new SiteSettingsService()
      const settings = await siteSettingsService.updateSettings(data)

      return response.ok({
        message: 'Site settings updated successfully',
        settings: {
          id: settings.id,
          heroTitle: settings.heroTitle,
          heroParagraph1: settings.heroParagraph1,
          heroParagraph2: settings.heroParagraph2,
          heroParagraph3: settings.heroParagraph3,
          ctaTitle: settings.ctaTitle,
          ctaButtonText: settings.ctaButtonText,
          heroImageUrl: settings.heroImageUrl,
          // How To Use fields
          howToUseTitle: settings.howToUseTitle,
          howToUseIntro: settings.howToUseIntro,
          howToUseStep1Title: settings.howToUseStep1Title,
          howToUseStep1Content: settings.howToUseStep1Content,
          howToUseStep2Title: settings.howToUseStep2Title,
          howToUseStep2Content: settings.howToUseStep2Content,
          howToUseStep3Title: settings.howToUseStep3Title,
          howToUseStep3Content: settings.howToUseStep3Content,
          howToUseStep4Title: settings.howToUseStep4Title,
          howToUseStep4Content: settings.howToUseStep4Content,
          // About Us fields
          aboutUsTitle: settings.aboutUsTitle,
          aboutUsIntro: settings.aboutUsIntro,
          aboutUsMission: settings.aboutUsMission,
          aboutUsVision: settings.aboutUsVision,
          aboutUsContact: settings.aboutUsContact,
          aboutUsParagraph1: settings.aboutUsParagraph1,
          aboutUsParagraph2: settings.aboutUsParagraph2,
          aboutUsParagraph3: settings.aboutUsParagraph3,
        },
      })
    } catch (error) {
      console.error('Error updating site settings:', error)
      return response.internalServerError({ error: 'Failed to update site settings' })
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Display super admin analytics page
   */
  async analytics({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const analyticsService = new AnalyticsService()
      const analytics = await analyticsService.getSuperAdminAnalytics({})

      return inertia.render('admin/analytics', {
        analytics,
        error: null,
      })
    } catch (error) {
      console.error('Error loading admin analytics:', error)
      return inertia.render('admin/analytics', {
        analytics: null,
        error: error instanceof Error ? error.message : 'Failed to load analytics',
      })
    }
  }

  /**
   * API endpoint for filtered super admin analytics
   */
  async analyticsStats({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const analyticsService = new AnalyticsService()

      // Get filter params from query string
      const monthParam = request.input('month')
      const yearParam = request.input('year')

      const filter: { month?: number; year?: number } = {}

      if (monthParam && monthParam !== 'all') {
        const month = parseInt(monthParam, 10)
        if (!isNaN(month) && month >= 1 && month <= 12) {
          filter.month = month
        }
      }

      if (yearParam && yearParam !== 'all') {
        const year = parseInt(yearParam, 10)
        if (!isNaN(year) && year >= 2000 && year <= 2100) {
          filter.year = year
        }
      }

      const analytics = await analyticsService.getSuperAdminAnalytics(filter)

      return response.json(analytics)
    } catch (error) {
      console.error('Error fetching admin analytics:', error)
      return response.internalServerError({
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      })
    }
  }

  // ==================== ALL RECORDS ====================

  /**
   * Display all records page (spreadsheet-style view)
   */
  async records({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      // Get all properties with their church info (excluding demo churches)
      const properties = await Property.query()
        .preload('church')
        .whereHas('church', (churchQuery) => {
          churchQuery.where('is_demo', false).orWhereNull('is_demo')
        })
        .orderBy('properties.created_at', 'desc')
        .limit(500) // Initial load limit

      // Get churches for filter dropdown (excluding demo churches)
      const churches = await Church.query()
        .where('is_demo', false)
        .orWhereNull('is_demo')
        .orderBy('church_name', 'asc')

      // Get available years from created_at (when the record was added)
      const yearSet = new Set<number>()
      for (const p of properties) {
        if (p.createdAt) yearSet.add(p.createdAt.year)
      }
      const availableYears = Array.from(yearSet).sort((a, b) => b - a)

      return inertia.render('admin/records', {
        properties: properties.map((p) => ({
          id: p.id,
          address: p.address,
          streetName: p.streetName,
          streetNumber: p.streetNumber,
          postcode: p.postcode,
          listingType: p.listingType,
          dateSold: p.dateSold?.toISODate() || null,
          dateListed: p.dateListed?.toISODate() || null,
          dateDelisted: p.dateDelisted?.toISODate() || null,
          feedbackStatus: p.feedbackStatus,
          visitOutcome: p.visitOutcome,
          visitor: p.visitor,
          dateOfVisit: p.dateOfVisit?.toISODate() || null,
          visitNotes: p.visitNotes,
          distanceFromChurch: p.distanceFromChurch,
          churchId: p.churchId,
          churchName: p.church?.churchName || 'Unknown',
          createdAt: p.createdAt?.toISO() || null,
          updatedAt: p.updatedAt?.toISO() || null,
        })),
        churches: churches.map((c) => ({
          id: c.id,
          churchName: c.churchName,
        })),
        totalCount: properties.length,
        availableYears,
      })
    } catch (error) {
      console.error('Error loading records:', error)
      return inertia.render('admin/records', {
        properties: [],
        churches: [],
        totalCount: 0,
        error: 'Failed to load records',
      })
    }
  }

  /**
   * API endpoint for filtered records
   */
  async getRecords({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchId, listingType, feedbackStatus, search, year, month, page = 1, limit = 100 } = request.qs()

      let query = Property.query().preload('church')

      // Exclude demo church properties from All Records
      query = query.whereHas('church', (churchQuery) => {
        churchQuery.where('is_demo', false).orWhereNull('is_demo')
      })

      // Apply filters
      if (churchId && churchId !== 'all') {
        query = query.where('church_id', churchId)
      }

      if (listingType && listingType !== 'all') {
        query = query.where('listing_type', listingType)
      }

      if (feedbackStatus && feedbackStatus !== 'all') {
        query = query.where('feedback_status', feedbackStatus)
      }

      if (search) {
        const searchTerm = `%${search}%`
        query = query.where((q) => {
          q.whereLike('address', searchTerm)
            .orWhereLike('street_name', searchTerm)
            .orWhereLike('visitor', searchTerm)
            .orWhereLike('postcode', searchTerm)
        })
      }

      // Year/month filter on created_at (when the record was added)
      if (year && year !== 'all') {
        const yearNum = parseInt(year, 10)
        query = query.whereRaw('EXTRACT(YEAR FROM properties.created_at) = ?', [yearNum])

        if (month && month !== 'all') {
          const monthNum = parseInt(month, 10)
          query = query.whereRaw('EXTRACT(MONTH FROM properties.created_at) = ?', [monthNum])
        }
      }

      // Get total count before pagination
      const countQuery = query.clone()
      const totalResult = await countQuery.count('* as total')
      const total = Number(totalResult[0].$extras.total)

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit)
      const properties = await query
        .orderBy('properties.created_at', 'desc')
        .offset(offset)
        .limit(Number(limit))

      return response.ok({
        properties: properties.map((p) => ({
          id: p.id,
          address: p.address,
          streetName: p.streetName,
          streetNumber: p.streetNumber,
          postcode: p.postcode,
          listingType: p.listingType,
          dateSold: p.dateSold?.toISODate() || null,
          dateListed: p.dateListed?.toISODate() || null,
          dateDelisted: p.dateDelisted?.toISODate() || null,
          feedbackStatus: p.feedbackStatus,
          visitOutcome: p.visitOutcome,
          visitor: p.visitor,
          dateOfVisit: p.dateOfVisit?.toISODate() || null,
          visitNotes: p.visitNotes,
          distanceFromChurch: p.distanceFromChurch,
          churchId: p.churchId,
          churchName: p.church?.churchName || 'Unknown',
          createdAt: p.createdAt?.toISO() || null,
          updatedAt: p.updatedAt?.toISO() || null,
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      })
    } catch (error) {
      console.error('Error fetching records:', error)
      return response.internalServerError({ error: 'Failed to fetch records' })
    }
  }

  /**
   * Export all records as CSV
   */
  async exportRecords({ request, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { churchId, listingType, feedbackStatus, year, month } = request.qs()

      let query = Property.query().preload('church')

      // Exclude demo church properties from exports
      query = query.whereHas('church', (churchQuery) => {
        churchQuery.where('is_demo', false).orWhereNull('is_demo')
      })

      if (churchId && churchId !== 'all') {
        query = query.where('church_id', churchId)
      }

      if (listingType && listingType !== 'all') {
        query = query.where('listing_type', listingType)
      }

      if (feedbackStatus && feedbackStatus !== 'all') {
        query = query.where('feedback_status', feedbackStatus)
      }

      // Year/month filter on created_at (when the record was added)
      if (year && year !== 'all') {
        const yearNum = parseInt(year, 10)
        query = query.whereRaw('EXTRACT(YEAR FROM properties.created_at) = ?', [yearNum])

        if (month && month !== 'all') {
          const monthNum = parseInt(month, 10)
          query = query.whereRaw('EXTRACT(MONTH FROM properties.created_at) = ?', [monthNum])
        }
      }

      const properties = await query.orderBy('properties.created_at', 'desc')

      // Build CSV
      const headers = [
        'ID',
        'Church',
        'Address',
        'Street',
        'Postcode',
        'Type',
        'Date Added',
        'Status',
        'Outcome',
        'Visitor',
        'Visit Date',
        'Notes',
      ]

      const rows = properties.map((p) => [
        p.id,
        p.church?.churchName || '',
        p.address,
        p.streetName || '',
        p.postcode || '',
        p.listingType,
        p.createdAt?.toISODate() || '',
        p.feedbackStatus || '',
        p.visitOutcome || '',
        p.visitor || '',
        p.dateOfVisit?.toISODate() || '',
        (p.visitNotes || '').replace(/"/g, '""'),
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', 'attachment; filename="all-records.csv"')
      return response.send(csv)
    } catch (error) {
      console.error('Error exporting records:', error)
      return response.internalServerError({ error: 'Failed to export records' })
    }
  }

  // ==================== DEMO MODE ====================

  /**
   * Toggle demo mode for super admins
   * Allows viewing the demo church as either church admin or visitor
   */
  async toggleDemoMode({ request, response, auth, session }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { mode, churchId } = request.only(['mode', 'churchId'])

      if (!['church_admin', 'off'].includes(mode)) {
        return response.badRequest({ error: 'Invalid mode. Must be "church_admin" or "off"' })
      }

      if (mode === 'off') {
        session.forget('demo_mode')
        session.forget('demo_church_id')
        session.forget('demo_visitor_id')
        return response.ok({ message: 'Demo mode disabled', mode: 'off' })
      }

      // Find the demo church - by explicit ID, existing session, or first available
      let demoChurch: Church | null = null
      const targetId = churchId || session.get('demo_church_id')
      if (targetId) {
        demoChurch = await Church.query().where('id', targetId).where('is_demo', true).first()
      }
      if (!demoChurch) {
        demoChurch = await Church.query().where('is_demo', true).first()
      }

      if (!demoChurch) {
        return response.badRequest({ error: 'Demo church not found. Run `node ace setup:demo` first.' })
      }

      // Store demo mode in session
      session.put('demo_mode', mode)
      session.put('demo_church_id', demoChurch.id)

      // Trigger property sync for the demo church
      const { PropertySyncOnLoginService } = await import('#services/property_sync_on_login_service')
      const syncService = new PropertySyncOnLoginService()
      syncService.triggerSyncForChurch(demoChurch.id).catch((error) => {
        console.error(`[DEMO] Failed to trigger sync for demo church ${demoChurch!.id}:`, error)
      })

      session.forget('demo_visitor_id')

      return response.ok({
        message: `Demo mode set to ${mode}`,
        mode,
        churchId: demoChurch.id,
        churchName: demoChurch.churchName,
      })
    } catch (error) {
      console.error('Error toggling demo mode:', error)
      return response.internalServerError({ error: 'Failed to toggle demo mode' })
    }
  }

  /**
   * Get current demo mode status
   */
  async getDemoStatus({ response, auth, session }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const demoMode = session.get('demo_mode')
      const demoChurchId = session.get('demo_church_id')
      const demoVisitorId = session.get('demo_visitor_id')

      // Get all demo churches
      const demoChurches = await Church.query().where('is_demo', true).orderBy('church_name', 'asc')

      if (demoChurches.length === 0) {
        return response.ok({
          available: false,
          message: 'Demo church not set up. Run `node ace setup:demo` to create it.',
        })
      }

      return response.ok({
        available: true,
        active: !!demoMode,
        mode: demoMode || 'off',
        churches: demoChurches.map((c) => ({
          id: c.id,
          name: c.churchName,
        })),
        session: {
          demoChurchId,
          demoVisitorId,
        },
      })
    } catch (error) {
      console.error('Error getting demo status:', error)
      return response.internalServerError({ error: 'Failed to get demo status' })
    }
  }

  /**
   * Diagnostic: test Zyla API directly for a given suburb (super admin only)
   */
  async testZylaApi({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user?.isSuperAdminRole()) {
      return response.forbidden('Access denied. Super admin privileges required.')
    }

    try {
      const { suburb } = params
      const { ZylaPropertyService } = await import('#services/zyla_property_service')
      const zylaService = new ZylaPropertyService()
      const result = await zylaService.testApiForSuburb(decodeURIComponent(suburb))
      return response.ok(result)
    } catch (error) {
      console.error('Error testing Zyla API:', error)
      return response.internalServerError({
        error: error instanceof Error ? error.message : 'Failed to test Zyla API',
      })
    }
  }
}
