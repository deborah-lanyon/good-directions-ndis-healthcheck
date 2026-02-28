import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'amenity_types'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('subcategory').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('subcategory')
    })
  }
}
