import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitor_groups'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('streets').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('streets')
    })
  }
}
