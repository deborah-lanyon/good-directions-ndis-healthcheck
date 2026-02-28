import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add visit outcome field for multi-select options (stored as comma-separated values)
      // Options: 'Welcomed', 'Pack left', 'Reschedule', 'Not Interested'
      table.string('visit_outcome', 255).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('visit_outcome')
    })
  }
}
