import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'
import Property from '#models/property'

export default class MailCampaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare churchId: number

  @column()
  declare name: string

  @column()
  declare propertyCount: number

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string | string[]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare postcodes: string[]

  @column()
  declare syncStatus: 'pending' | 'syncing' | 'completed' | 'failed' | null

  @column()
  declare syncErrorMessage: string | null

  @column.dateTime()
  declare postedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>

  @manyToMany(() => Property, {
    pivotTable: 'campaign_properties',
    pivotForeignKey: 'campaign_id',
    pivotRelatedForeignKey: 'property_id',
    pivotColumns: ['label_generated', 'posted'],
    pivotTimestamps: true,
  })
  declare properties: ManyToMany<typeof Property>
}
