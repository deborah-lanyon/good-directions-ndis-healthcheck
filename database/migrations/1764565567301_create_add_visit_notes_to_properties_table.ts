import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add visit notes field for visitors to add comments
      table.text('visit_notes').nullable()

      // Add field to track who last updated the property
      table.integer('last_updated_by').unsigned().nullable()
      table.foreign('last_updated_by').references('id').inTable('users').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['last_updated_by'])
      table.dropColumn('visit_notes')
      table.dropColumn('last_updated_by')
    })
  }
}
