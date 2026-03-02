import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import StreetGroup from '#models/street_group'

export default class Church extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare churchName: string

  @column()
  declare url: string

  @column()
  declare address: string | null

  @column()
  declare addressLine1: string | null

  @column()
  declare addressLine2: string | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare suburb: string | null

  @column()
  declare postcode: string | null

  @column()
  declare radius: number | null

  @column()
  declare country: string | null

  @column()
  declare mapBounds: any | null

  @column()
  declare mapZoom: number | null

  @column.date()
  declare lastSyncDate: DateTime | null

  @column.dateTime()
  declare lastSyncAt: DateTime | null

  @column()
  declare syncStatus: 'syncing' | 'completed' | 'failed' | null

  @column()
  declare syncRetryCount: number

  @column()
  declare syncErrorMessage: string | null

  @column()
  declare states: string[] | null

  @column()
  declare isDemo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => StreetGroup)
  declare streetGroups: HasMany<typeof StreetGroup>
}
