import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'
import Respondent from '#models/respondent'

export type ListingType = 'sold' | 'rent'

export default class Property extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare churchId: number

  @column()
  declare address: string

  @column()
  declare listingType: ListingType

  @column.date()
  declare dateSold: DateTime | null

  @column.date()
  declare dateListed: DateTime | null

  @column()
  declare rentalPrice: string | null

  @column()
  declare feedbackStatus: string

  @column()
  declare visitor: string | null

  @column()
  declare distanceFromChurch: number | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare streetName: string | null

  @column()
  declare streetNumber: number | null

  @column()
  declare postcode: string | null

  @column.dateTime()
  declare dateOfStatusChange: DateTime | null

  @column.date()
  declare dateOfVisit: DateTime | null

  @column()
  declare visitNotes: string | null

  @column()
  declare visitOutcome: string | null

  @column()
  declare lastUpdatedBy: number | null

  // For rental properties: when the listing was last seen in the API
  @column.dateTime()
  declare lastSeenAt: DateTime | null

  // For rental properties: when the listing was detected as removed (likely leased)
  @column.date()
  declare dateDelisted: DateTime | null

  @column()
  declare trackingCode: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>

  @hasMany(() => Respondent)
  declare respondents: HasMany<typeof Respondent>
}
