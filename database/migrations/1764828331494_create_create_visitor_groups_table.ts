import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitor_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('church_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('churches')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('postcode').notNullable()
      table.text('description').nullable()

      // Lead person details
      table.string('lead_person_name').nullable()
      table.string('lead_person_email').nullable()
      table.string('lead_person_phone').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
