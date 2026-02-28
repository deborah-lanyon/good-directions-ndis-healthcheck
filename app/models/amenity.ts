import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AmenityType from '#models/amenity_type'
import Church from '#models/church'

export default class Amenity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amenityTypeId: number

  @column()
  declare churchId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare address: string

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare phone: string | null

  @column()
  declare website: string | null

  @column()
  declare suburb: string | null

  @column()
  declare postcode: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AmenityType)
  declare amenityType: BelongsTo<typeof AmenityType>

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>
}
