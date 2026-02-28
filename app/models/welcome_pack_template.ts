import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'

export default class WelcomePackTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare churchId: number

  @column()
  declare name: string

  @column()
  declare welcomeMessage: string | null

  @column()
  declare churchInfo: string | null

  @column()
  declare customContent: string | null

  @column()
  declare aboutCommunity: string | null

  @column()
  declare additionalInfo: string | null

  @column()
  declare churchServices: string | null

  @column()
  declare logoUrl: string | null

  @column()
  declare bannerUrl: string | null

  @column()
  declare aboutUsImageUrl: string | null

  @column()
  declare gettingAroundImageUrl: string | null

  @column()
  declare communityServicesImageUrl: string | null

  @column()
  declare thingsToDoImageUrl: string | null

  @column()
  declare contactAddress: string | null

  @column()
  declare contactEmail: string | null

  @column()
  declare contactPhone: string | null

  @column()
  declare primaryColor: string

  @column()
  declare secondaryColor: string

  @column()
  declare templateDesign: string

  @column()
  declare includeAmenities: boolean

  @column()
  declare enabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>
}
