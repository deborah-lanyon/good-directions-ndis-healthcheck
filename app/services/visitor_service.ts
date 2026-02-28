import Visitor from '#models/visitor'
import StreetGroup from '#models/street_group'
import Church from '#models/church'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import env from '#start/env'

export default class VisitorService {
  /**
   * Get all visitors for a street group
   */
  async getVisitorsForStreetGroup(streetGroupId: number): Promise<Visitor[]> {
    const streetGroup = await StreetGroup.query()
      .where('id', streetGroupId)
      .preload('visitors')
      .first()

    return streetGroup?.visitors || []
  }

  /**
   * Get all visitors for a church
   */
  async getVisitorsForChurch(churchId: number): Promise<Visitor[]> {
    return await Visitor.query().where('church_id', churchId).orderBy('name', 'asc')
  }

  /**
   * Get a single visitor by ID
   */
  async getVisitorById(visitorId: number): Promise<Visitor | null> {
    return await Visitor.query()
      .where('id', visitorId)
      .preload('church')
      .preload('streetGroups')
      .first()
  }

  /**
   * Create a new visitor (church-level)
   */
  async createVisitor(
    churchId: number,
    data: {
      name: string
      email?: string
      phone?: string
    }
  ): Promise<Visitor> {
    // Validate church exists
    const church = await Church.find(churchId)
    if (!church) {
      throw new Error('Church not found')
    }

    const visitor = await Visitor.create({
      churchId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    })

    return visitor
  }

  /**
   * Update a visitor
   */
  async updateVisitor(
    visitorId: number,
    data: {
      name?: string
      email?: string
      phone?: string
    }
  ): Promise<Visitor> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    if (data.name !== undefined) visitor.name = data.name
    if (data.email !== undefined) visitor.email = data.email
    if (data.phone !== undefined) visitor.phone = data.phone

    await visitor.save()
    return visitor
  }

  /**
   * Delete a visitor
   */
  async deleteVisitor(visitorId: number): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    // Detach from all street groups
    await visitor.related('streetGroups').detach()

    await visitor.delete()
  }

  /**
   * Attach visitor to street groups
   */
  async attachToStreetGroups(visitorId: number, streetGroupIds: number[]): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    await visitor.related('streetGroups').attach(streetGroupIds)
  }

  /**
   * Detach visitor from street groups
   */
  async detachFromStreetGroups(visitorId: number, streetGroupIds: number[]): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    await visitor.related('streetGroups').detach(streetGroupIds)
  }

  /**
   * Sync visitor's street groups (replaces all assignments)
   */
  async syncStreetGroups(visitorId: number, streetGroupIds: number[]): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    await visitor.related('streetGroups').sync(streetGroupIds)
  }

  /**
   * Send invitation email to visitor
   */
  async sendInvitation(visitorId: number): Promise<void> {
    const visitor = await Visitor.query().where('id', visitorId).preload('church').first()

    if (!visitor) {
      throw new Error('Visitor not found')
    }

    if (!visitor.email) {
      throw new Error('Visitor must have an email address to receive an invitation')
    }

    if (visitor.userId) {
      throw new Error('Visitor already has an account')
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    visitor.invitationToken = token
    visitor.invitationSentAt = DateTime.now()
    visitor.invitationAcceptedAt = null
    await visitor.save()

    // Send invitation email
    const invitationUrl = `${env.get('APP_URL')}/visitor/accept-invitation/${token}`
    const churchName = visitor.church?.churchName || 'Your Church'

    try {
      await mail.send((message) => {
        message
          .from(
            env.get('MAIL_FROM_ADDRESS', 'noreply@welcomers-portal.com'),
            env.get('MAIL_FROM_NAME', 'Welcomers Portal')
          )
          .to(visitor.email!)
          .subject(`You've been invited to access the ${churchName} Welcomers Portal`)
          .htmlView('emails/visitor_invitation', {
            visitorName: visitor.name,
            churchName,
            invitationUrl,
          })
      })
    } catch (error) {
      // Revert the invitation token if email fails
      visitor.invitationToken = null
      visitor.invitationSentAt = null
      await visitor.save()

      console.error('Failed to send visitor invitation email:', error)
      throw new Error('Failed to send invitation email. Please check your email configuration.')
    }
  }

  /**
   * Accept invitation and create user account
   */
  async acceptInvitation(
    token: string,
    password: string
  ): Promise<{ visitor: Visitor; user: User }> {
    const visitor = await Visitor.query().where('invitation_token', token).preload('church').first()

    if (!visitor) {
      throw new Error('Invalid invitation token')
    }

    if (visitor.userId) {
      throw new Error('Invitation already accepted')
    }

    if (!visitor.email) {
      throw new Error('Visitor must have an email')
    }

    // Check if user with this email already exists (case-insensitive)
    const existingUser = await User.query().whereRaw('LOWER(email) = LOWER(?)', [visitor.email]).first()
    if (existingUser) {
      throw new Error('An account with this email already exists')
    }

    // Create user account
    const user = await User.create({
      fullName: visitor.name,
      email: visitor.email,
      password: password,
      role: 'visitor',
      adminApprovalStatus: 'approved', // Visitors don't need admin approval
    })

    // Link visitor to user
    visitor.userId = user.id
    visitor.invitationAcceptedAt = DateTime.now()
    visitor.invitationToken = null // Clear token after use
    await visitor.save()

    return { visitor, user }
  }

  /**
   * Revoke visitor access (unlink user account)
   */
  async revokeAccess(visitorId: number): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    if (!visitor.userId) {
      throw new Error('Visitor does not have an account')
    }

    // Optionally delete the user account or just unlink
    // For now, we'll just unlink
    visitor.userId = null
    visitor.invitationToken = null
    visitor.invitationSentAt = null
    visitor.invitationAcceptedAt = null
    await visitor.save()
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(visitorId: number): Promise<void> {
    const visitor = await Visitor.find(visitorId)
    if (!visitor) {
      throw new Error('Visitor not found')
    }

    if (visitor.userId) {
      throw new Error('Visitor already has an account')
    }

    // Send new invitation
    await this.sendInvitation(visitorId)
  }

  /**
   * Create a pre-linked visitor record for a church admin (skips invitation flow)
   */
  async createVisitorForAdmin(user: User, churchId: number): Promise<Visitor> {
    const existing = await Visitor.query()
      .where('church_id', churchId)
      .where('user_id', user.id)
      .where('is_admin_visitor', true)
      .first()

    if (existing) {
      return existing
    }

    if (user.email) {
      const emailConflict = await Visitor.query()
        .whereRaw('LOWER(email) = LOWER(?)', [user.email])
        .first()

      if (emailConflict) {
        throw new Error(
          'Your email address is already in use by another visitor record. Please remove or update that visitor first.'
        )
      }
    }

    return await Visitor.create({
      churchId,
      name: user.fullName || user.email,
      email: user.email,
      userId: user.id,
      invitationAcceptedAt: DateTime.now(),
      isAdminVisitor: true,
    })
  }

  /**
   * Remove the admin's visitor record and all street group associations
   */
  async removeAdminVisitor(userId: number, churchId: number): Promise<void> {
    const visitor = await Visitor.query()
      .where('church_id', churchId)
      .where('user_id', userId)
      .where('is_admin_visitor', true)
      .first()

    if (!visitor) return

    await visitor.related('streetGroups').detach()
    await visitor.delete()
  }

  /**
   * Get the admin's visitor record for a church, if it exists
   */
  async getAdminVisitor(userId: number, churchId: number): Promise<Visitor | null> {
    return await Visitor.query()
      .where('church_id', churchId)
      .where('user_id', userId)
      .where('is_admin_visitor', true)
      .first()
  }

  /**
   * Get all visitors for a church
   */
  async getAllVisitorsForChurch(churchId: number): Promise<Visitor[]> {
    const visitors = await Visitor.query().where('church_id', churchId).preload('streetGroups')

    // Sort by surname (last word in name) then by first name
    visitors.sort((a, b) => {
      const aSurname = a.name.split(' ').pop()?.toLowerCase() || ''
      const bSurname = b.name.split(' ').pop()?.toLowerCase() || ''

      if (aSurname !== bSurname) {
        return aSurname.localeCompare(bSurname)
      }

      // If surnames are the same, sort by full name
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })

    return visitors
  }
}
