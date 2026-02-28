import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_admin_visitor').defaultTo(false).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_admin_visitor')
    })
  }
}
