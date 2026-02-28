import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'
import StreetGroup from '#models/street_group'
import User from '#models/user'

export default class Visitor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare churchId: number

  @column()
  declare name: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare userId: number | null

  @column({ serializeAs: 'isAdminVisitor' })
  declare isAdminVisitor: boolean

  @column()
  declare invitationToken: string | null

  @column.dateTime()
  declare invitationSentAt: DateTime | null

  @column.dateTime()
  declare invitationAcceptedAt: DateTime | null

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>

  @manyToMany(() => StreetGroup, {
    pivotTable: 'street_group_visitor',
  })
  declare streetGroups: ManyToMany<typeof StreetGroup>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  /**
   * Check if visitor has an active user account
   */
  hasAccount(): boolean {
    return this.userId !== null
  }

  /**
   * Check if visitor has portal access (has accepted invitation)
   */
  hasAccess(): boolean {
    return this.invitationAcceptedAt !== null && this.userId !== null
  }

  /**
   * Check if invitation is pending
   */
  hasPendingInvitation(): boolean {
    return this.invitationToken !== null && this.invitationAcceptedAt === null
  }

  /**
   * Serialize visitor data including computed properties
   */
  serialize() {
    const data = super.serialize()
    return {
      ...data,
      hasAccess: this.hasAccess(),
      isAdminVisitor: this.isAdminVisitor || false,
    }
  }
}
