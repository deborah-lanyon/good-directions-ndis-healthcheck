import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Church from '#models/church'
import StreetAssignment from '#models/street_assignment'
import Visitor from '#models/visitor'

export default class StreetGroup extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare churchId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Church)
  declare church: BelongsTo<typeof Church>

  @hasMany(() => StreetAssignment)
  declare streetAssignments: HasMany<typeof StreetAssignment>

  @manyToMany(() => Visitor, {
    pivotTable: 'street_group_visitor',
  })
  declare visitors: ManyToMany<typeof Visitor>

  serialize() {
    const data = super.serialize()
    if (this.$extras.propertyCount !== undefined) {
      data.propertyCount = this.$extras.propertyCount
    }
    return data
  }
}
