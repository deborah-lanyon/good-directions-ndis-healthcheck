import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StreetGroup from '#models/street_group'

export default class StreetAssignment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare streetGroupId: number

  @column()
  declare streetName: string

  @column()
  declare streetNumberStart: number | null

  @column()
  declare streetNumberEnd: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => StreetGroup)
  declare streetGroup: BelongsTo<typeof StreetGroup>
}
