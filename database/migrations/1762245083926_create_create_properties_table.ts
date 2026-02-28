import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('church_id').unsigned().notNullable()
      table.text('address').notNullable()
      table.date('date_sold').notNullable()
      table.string('feedback_status').notNullable().defaultTo('pending')
      table.decimal('distance_from_church', 10, 2).nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.timestamp('date_of_status_change').nullable()
      table.date('date_of_visit').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.foreign('church_id').references('id').inTable('churches').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
