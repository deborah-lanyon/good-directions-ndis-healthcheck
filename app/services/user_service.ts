import User from '#models/user'
import type { UserRole } from '#models/user'
import Church from '#models/church'
import { MailService } from '#services/mail_service'
import { randomBytes } from 'node:crypto'

export class UserService {
  private mailService: MailService

  constructor(mailService?: MailService) {
    this.mailService = mailService ?? new MailService()
  }

  async register(data: {
    name: string
    email: string
    churchName: string
    churchUrl: string
  }): Promise<{ user: User; church: Church }> {
    if (!data.email.includes('@')) {
      throw new Error('Please provide a valid email address')
    }

    const password = randomBytes(16).toString('hex')
    const user = await User.create({ fullName: data.name, email: data.email, password })
    await user.generateAdminApprovalToken()

    const church = await Church.create({
      userId: user.id,
      churchName: data.churchName,
      url: data.churchUrl,
    })

    // Send emails asynchronously without blocking registration
    // This prevents timeouts from delaying the registration response
    this.sendRegistrationEmails(user, data.churchName, data.churchUrl).catch((error) => {
      console.error('Failed to send registration emails:', error)
    })

    return { user, church }
  }

  private async sendRegistrationEmails(
    user: User,
    churchName: string,
    churchUrl: string
  ): Promise<void> {
    try {
      // Send both emails in parallel for faster delivery
      await Promise.all([
        this.mailService.sendUserRegistrationConfirmation(user),
        this.mailService.sendAdminApprovalNotification(user, {
          churchName,
          churchUrl,
        }),
      ])
    } catch (error) {
      console.error('Email sending error:', error)
    }
  }

  async updateProfile(userId: number, data: { fullName?: string; email?: string }): Promise<User> {
    const user = await User.findOrFail(userId)
    if (data.fullName !== undefined) {
      user.fullName = data.fullName
    }
    if (data.email !== undefined) {
      user.email = data.email
    }
    await user.save()
    return user
  }

  async initiatePasswordReset(email: string): Promise<{ token: string }> {
    console.log('[PASSWORD RESET] Looking for user with email:', email)
    const user = await User.query().whereRaw('LOWER(email) = LOWER(?)', [email]).first()
    if (!user) {
      console.log('[PASSWORD RESET] User not found:', email)
      throw new Error('User not found')
    }

    console.log('[PASSWORD RESET] User found, generating token for:', user.email)
    await user.generateForgotPasswordToken()

    try {
      console.log('[PASSWORD RESET] Calling mail service for:', user.email)
      await this.mailService.sendForgotPasswordEmail(user)
      console.log('[PASSWORD RESET] Mail service completed successfully')
    } catch (error) {
      console.error('[PASSWORD RESET ERROR] Failed to send password reset email:', error)
    }

    return { token: user.forgotPasswordToken! }
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await User.findBy('forgot_password_token', token)
    if (!user) {
      throw new Error('Invalid or expired token')
    }

    if (!user.isForgotPasswordTokenValid()) {
      throw new Error('Token has expired')
    }

    user.password = newPassword
    await user.clearForgotPasswordToken()
    await user.save()

    return user
  }

  async approveUser(token: string): Promise<User> {
    const user = await User.findBy('admin_approval_token', token)
    if (!user) {
      throw new Error('Invalid or expired approval token')
    }

    if (!user.isAdminApprovalTokenValid()) {
      throw new Error('Approval token has expired')
    }

    if (user.adminApprovalStatus !== 'pending') {
      throw new Error('User has already been processed')
    }

    user.adminApprovalStatus = 'approved'
    await user.clearAdminApprovalToken()
    await user.generateForgotPasswordToken()
    await user.save()

    try {
      await this.mailService.sendUserApprovedNotification(user)
    } catch (error) {
      console.error('Failed to send user approved notification:', error)
    }

    return user
  }

  async rejectUser(token: string): Promise<User> {
    const user = await User.findBy('admin_approval_token', token)
    if (!user) {
      throw new Error('Invalid or expired approval token')
    }

    if (!user.isAdminApprovalTokenValid()) {
      throw new Error('Approval token has expired')
    }

    if (user.adminApprovalStatus !== 'pending') {
      throw new Error('User has already been processed')
    }

    user.adminApprovalStatus = 'rejected'
    await user.clearAdminApprovalToken()
    await user.save()

    return user
  }

  /**
   * Create a user account manually (admin function)
   * Creates with approved status and sends password reset email
   */
  async createUserManually(data: {
    fullName: string
    email: string
    role?: UserRole
  }): Promise<User> {
    if (!data.email.includes('@')) {
      throw new Error('Please provide a valid email address')
    }

    const existing = await User.query().whereRaw('LOWER(email) = LOWER(?)', [data.email]).first()
    if (existing) {
      throw new Error('A user with this email already exists')
    }

    const password = randomBytes(16).toString('hex')
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password,
      role: data.role || 'church_admin',
      adminApprovalStatus: 'approved',
    })

    // Send password reset email so user can set their own password
    await user.generateForgotPasswordToken()
    this.mailService.sendForgotPasswordEmail(user).catch((error) => {
      console.error('Failed to send password setup email:', error)
    })

    return user
  }

  /**
   * Get all users with their relationships for admin management
   */
  async getAllUsers(filters?: {
    role?: UserRole
    status?: 'pending' | 'approved' | 'rejected'
    search?: string
    excludeTemp?: boolean
  }): Promise<User[]> {
    let query = User.query()
      .preload('church')
      .preload('visitor', (visitorQuery) => {
        visitorQuery.preload('church')
        visitorQuery.preload('streetGroups')
      })
      .orderBy('created_at', 'desc')

    if (filters?.role) {
      query = query.where('role', filters.role)
    }

    if (filters?.status) {
      query = query.where('admin_approval_status', filters.status)
    }

    if (filters?.excludeTemp) {
      query = query.whereNot('email', 'like', '%.temp')
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`
      query = query.where((searchQuery) => {
        searchQuery.whereLike('full_name', searchTerm).orWhereLike('email', searchTerm)
      })
    }

    return await query
  }

  /**
   * Update user details (admin function)
   */
  async updateUserAsAdmin(
    userId: number,
    data: {
      fullName?: string
      email?: string
      adminApprovalStatus?: 'pending' | 'approved' | 'rejected'
    }
  ): Promise<User> {
    const user = await User.findOrFail(userId)

    if (data.fullName !== undefined) {
      user.fullName = data.fullName
    }

    if (data.email !== undefined) {
      // Check for duplicate email
      const existingUser = await User.query()
        .whereRaw('LOWER(email) = LOWER(?)', [data.email])
        .whereNot('id', userId)
        .first()

      if (existingUser) {
        throw new Error('Email already in use by another user')
      }
      user.email = data.email
    }

    if (data.adminApprovalStatus !== undefined) {
      const wasNotApproved = user.adminApprovalStatus !== 'approved'
      user.adminApprovalStatus = data.adminApprovalStatus

      // Send password setup email when newly approving a user
      if (data.adminApprovalStatus === 'approved' && wasNotApproved) {
        await user.save()
        await user.generateForgotPasswordToken()
        this.mailService.sendUserApprovedNotification(user).catch((error) => {
          console.error(`Failed to send approval email to ${user.email}:`, error)
        })
        return user
      }
    }

    await user.save()
    return user
  }

  /**
   * Change user role (super admin only)
   */
  async changeUserRole(userId: number, newRole: UserRole): Promise<User> {
    const user = await User.findOrFail(userId)

    // Prevent changing the last super admin
    if (user.role === 'super_admin' && newRole !== 'super_admin') {
      const superAdminCount = await User.query().where('role', 'super_admin').count('* as total')

      if (Number(superAdminCount[0].$extras.total) <= 1) {
        throw new Error('Cannot change role of the last super admin')
      }
    }

    user.role = newRole
    await user.save()
    return user
  }

  /**
   * Reset user password and send email (admin function)
   */
  async resetUserPassword(userId: number): Promise<{ token: string }> {
    const user = await User.findOrFail(userId)
    await user.generateForgotPasswordToken()

    try {
      await this.mailService.sendForgotPasswordEmail(user)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }

    return { token: user.forgotPasswordToken! }
  }

  /**
   * Delete user account (admin function)
   */
  async deleteUser(userId: number, currentUserId: number): Promise<void> {
    if (userId === currentUserId) {
      throw new Error('Cannot delete your own account')
    }

    const user = await User.query().where('id', userId).preload('church').preload('visitor').first()

    if (!user) {
      throw new Error('User not found')
    }

    // Prevent deleting the last super admin
    if (user.role === 'super_admin') {
      const superAdminCount = await User.query().where('role', 'super_admin').count('* as total')

      if (Number(superAdminCount[0].$extras.total) <= 1) {
        throw new Error('Cannot delete the last super admin')
      }
    }

    // Delete related records
    if (user.church) {
      await user.church.delete()
    }

    if (user.visitor) {
      // Unlink visitor instead of deleting
      user.visitor.userId = null
      await user.visitor.save()
    }

    await user.delete()
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStats(): Promise<{
    total: number
    byRole: Record<UserRole, number>
    byStatus: Record<string, number>
    recentUsers: User[]
  }> {
    const [total, byRole, byStatus, recentUsers] = await Promise.all([
      User.query().count('* as total'),
      User.query().select('role').count('* as count').groupBy('role'),
      User.query()
        .select('admin_approval_status')
        .count('* as count')
        .groupBy('admin_approval_status'),
      User.query().orderBy('created_at', 'desc').limit(5).preload('church'),
    ])

    const roleStats = byRole.reduce(
      (acc, row) => {
        acc[row.role as UserRole] = Number(row.$extras.count)
        return acc
      },
      {} as Record<UserRole, number>
    )

    const statusStats = byStatus.reduce(
      (acc, row) => {
        acc[row.adminApprovalStatus] = Number(row.$extras.count)
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: Number(total[0].$extras.total),
      byRole: roleStats,
      byStatus: statusStats,
      recentUsers,
    }
  }
}
