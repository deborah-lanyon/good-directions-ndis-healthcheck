import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add street_number to properties table
    this.schema.alterTable('properties', (table) => {
      table.integer('street_number').nullable().after('street_name')
    })

    // Add number range fields to street_assignments table
    this.schema.alterTable('street_assignments', (table) => {
      table.integer('street_number_start').nullable().after('street_name')
      table.integer('street_number_end').nullable().after('street_number_start')
    })
  }

  async down() {
    this.schema.alterTable('properties', (table) => {
      table.dropColumn('street_number')
    })

    this.schema.alterTable('street_assignments', (table) => {
      table.dropColumn('street_number_start')
      table.dropColumn('street_number_end')
    })
  }
}
