import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'respondents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('property_id').unsigned().nullable()
      table.integer('church_id').unsigned().nullable()
      table.string('tracking_code', 12).nullable()
      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.string('status').notNullable().defaultTo('new')
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.foreign('property_id').references('id').inTable('properties').onDelete('SET NULL')
      table.foreign('church_id').references('id').inTable('churches').onDelete('SET NULL')
      table.index('tracking_code')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
