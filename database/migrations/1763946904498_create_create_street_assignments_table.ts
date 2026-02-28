import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'street_assignments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('street_group_id')
        .unsigned()
        .references('id')
        .inTable('street_groups')
        .onDelete('CASCADE')
      table.string('street_name').notNullable() // e.g., "Smith Street"
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Prevent duplicate street assignments within the same group
      table.unique(['street_group_id', 'street_name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
