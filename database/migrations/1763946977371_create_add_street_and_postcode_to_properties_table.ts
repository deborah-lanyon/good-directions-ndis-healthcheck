import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('street_name').nullable().index() // Extracted street name for grouping
      table.string('postcode').nullable().index() // Postcode for territory filtering
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('street_name')
      table.dropColumn('postcode')
    })
  }
}
