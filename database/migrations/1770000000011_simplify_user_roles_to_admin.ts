import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Drop the old role column and recreate with simplified enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', ['admin']).notNullable().defaultTo('admin')
    })

    // Drop the legacy is_super_admin column if it exists
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
