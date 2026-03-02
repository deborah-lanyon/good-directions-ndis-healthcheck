import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Property from '#models/property'
import Church from '#models/church'

export type RespondentStatus = 'new' | 'contacted' | 'healthcheck_scheduled' | 'healthcheck_completed'

export default class Respondent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare propertyId: number | null

  @column()
  declare churchId: number | null

  @column()
  declare trackingCode: string | null

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare status: RespondentStatus

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Property)
  declare property: BelongsTo<typeof Property>

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>
}
