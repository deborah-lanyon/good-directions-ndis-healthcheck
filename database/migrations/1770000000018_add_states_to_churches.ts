import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'churches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('states').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('states')
    })
  }
}
