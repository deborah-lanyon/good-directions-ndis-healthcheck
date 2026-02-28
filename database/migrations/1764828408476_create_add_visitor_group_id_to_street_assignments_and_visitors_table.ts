import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add visitor_group_id to street_assignments table
    this.schema.alterTable('street_assignments', (table) => {
      table
        .integer('visitor_group_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('visitor_groups')
        .onDelete('CASCADE')
    })

    // Add visitor_group_id to visitors table
    this.schema.alterTable('visitors', (table) => {
      table
        .integer('visitor_group_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('visitor_groups')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable('street_assignments', (table) => {
      table.dropColumn('visitor_group_id')
    })

    this.schema.alterTable('visitors', (table) => {
      table.dropColumn('visitor_group_id')
    })
  }
}
