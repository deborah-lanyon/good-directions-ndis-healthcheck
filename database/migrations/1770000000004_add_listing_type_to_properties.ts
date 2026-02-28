import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add listing_type column to distinguish between sold and rental properties
      // Default to 'sold' for existing records
      table.string('listing_type', 10).notNullable().defaultTo('sold')

      // Add date_listed column for rental properties (when they were listed)
      // For sold properties, this will be null (they use date_sold)
      table.date('date_listed').nullable()

      // Add rental_price column for rental properties
      table.string('rental_price').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('listing_type')
      table.dropColumn('date_listed')
      table.dropColumn('rental_price')
    })
  }
}
