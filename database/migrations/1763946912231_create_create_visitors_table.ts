import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('street_group_id')
        .unsigned()
        .references('id')
        .inTable('street_groups')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('email').nullable()
      table.string('phone').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
