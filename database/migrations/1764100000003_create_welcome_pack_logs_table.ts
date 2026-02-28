import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('property_id')
        .unsigned()
        .references('id')
        .inTable('properties')
        .onDelete('CASCADE')
      table
        .integer('welcome_pack_template_id')
        .unsigned()
        .references('id')
        .inTable('welcome_pack_templates')
        .onDelete('SET NULL')
      table.string('sent_to_email').nullable()
      table.string('sent_by').nullable()
      table.enum('delivery_method', ['email', 'print']).notNullable()
      table.timestamp('sent_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
