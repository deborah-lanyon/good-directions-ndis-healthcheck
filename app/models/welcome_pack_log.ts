import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Property from '#models/property'
import WelcomePackTemplate from '#models/welcome_pack_template'

export default class WelcomePackLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare propertyId: number

  @column()
  declare welcomePackTemplateId: number | null

  @column()
  declare sentToEmail: string | null

  @column()
  declare sentBy: string | null

  @column()
  declare deliveryMethod: 'email' | 'print'

  @column.dateTime()
  declare sentAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Property)
  declare property: BelongsTo<typeof Property>

  @belongsTo(() => WelcomePackTemplate)
  declare welcomePackTemplate: BelongsTo<typeof WelcomePackTemplate>
}
