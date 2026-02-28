import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Track when a rental property was last seen in the API listings
      // Used to detect when a rental has been removed (likely leased)
      table.timestamp('last_seen_at').nullable()

      // Date when rental was detected as removed from listings
      // This is when we consider the property "ready to welcome" (likely new tenant)
      table.date('date_delisted').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_seen_at')
      table.dropColumn('date_delisted')
    })
  }
}
