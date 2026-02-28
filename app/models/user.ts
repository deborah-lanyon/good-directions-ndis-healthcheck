import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { randomBytes } from 'node:crypto'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'
import Visitor from '#models/visitor'

export type UserRole = 'super_admin' | 'church_admin' | 'visitor'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @beforeSave()
  static normalizeEmail(user: User) {
    if (user.$dirty.email) {
      user.email = user.email.toLowerCase()
    }
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare forgotPasswordToken: string | null

  @column.dateTime()
  declare forgotPasswordTokenExpiresAt: DateTime | null

  @column()
  declare adminApprovalStatus: 'pending' | 'approved' | 'rejected'

  @column()
  declare adminApprovalToken: string | null

  @column.dateTime()
  declare adminApprovalTokenExpiresAt: DateTime | null

  @column()
  declare isSuperAdmin: boolean

  @column()
  declare role: UserRole

  @hasOne(() => Church)
  declare church: HasOne<typeof Church>

  @hasOne(() => Visitor, {
    foreignKey: 'userId',
  })
  declare visitor: HasOne<typeof Visitor>

  async generateForgotPasswordToken(): Promise<void> {
    const token = randomBytes(32).toString('hex')
    const expiresAt = DateTime.now().plus({ hours: 48 })

    this.forgotPasswordToken = token
    this.forgotPasswordTokenExpiresAt = expiresAt

    await this.save()
  }

  async clearForgotPasswordToken(): Promise<void> {
    this.forgotPasswordToken = null
    this.forgotPasswordTokenExpiresAt = null

    await this.save()
  }

  isForgotPasswordTokenValid(): boolean {
    if (!this.forgotPasswordToken || !this.forgotPasswordTokenExpiresAt) {
      return false
    }

    return DateTime.now() < this.forgotPasswordTokenExpiresAt
  }

  async generateAdminApprovalToken(): Promise<void> {
    const token = randomBytes(32).toString('hex')
    const expiresAt = DateTime.now().plus({ days: 7 })

    this.adminApprovalToken = token
    this.adminApprovalTokenExpiresAt = expiresAt

    await this.save()
  }

  async clearAdminApprovalToken(): Promise<void> {
    this.adminApprovalToken = null
    this.adminApprovalTokenExpiresAt = null

    await this.save()
  }

  isAdminApprovalTokenValid(): boolean {
    if (!this.adminApprovalToken || !this.adminApprovalTokenExpiresAt) {
      return false
    }

    return DateTime.now() < this.adminApprovalTokenExpiresAt
  }

  /**
   * Role helper methods
   */
  isSuperAdminRole(): boolean {
    return this.role === 'super_admin' || this.isSuperAdmin
  }

  isChurchAdmin(): boolean {
    return this.role === 'church_admin'
  }

  isVisitorRole(): boolean {
    return this.role === 'visitor'
  }

  canManageChurch(): boolean {
    return this.isSuperAdminRole() || this.isChurchAdmin()
  }
}
