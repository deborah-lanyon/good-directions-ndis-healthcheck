import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'street_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('territory_id')
        .unsigned()
        .references('id')
        .inTable('territories')
        .onDelete('CASCADE')
      table.string('name').notNullable() // e.g., "North Area", "South Area"
      table.text('description').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
