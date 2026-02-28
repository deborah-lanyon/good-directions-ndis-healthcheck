import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add role enum field with default 'church_admin'
      table
        .enum('role', ['super_admin', 'church_admin', 'visitor'])
        .notNullable()
        .defaultTo('church_admin')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
