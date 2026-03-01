import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Update all existing roles to 'admin'
    this.defer(async (db) => {
      await db.rawQuery(`UPDATE ${this.tableName} SET role = 'admin'`)
    })

    // Change the role column: drop the old enum type, add new one
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', ['admin']).notNullable().defaultTo('admin')
    })

    // Drop the legacy is_super_admin column
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_super_admin')
    })
  }

  async down() {
    // Re-add is_super_admin
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_super_admin').notNullable().defaultTo(false)
    })

    // Restore original role enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', ['super_admin', 'church_admin', 'visitor']).notNullable().defaultTo('church_admin')
    })
  }
}
