import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mail_campaigns'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('postcodes').notNullable().defaultTo('[]')
      table.string('sync_status').nullable()
      table.text('sync_error_message').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('postcodes')
      table.dropColumn('sync_status')
      table.dropColumn('sync_error_message')
    })
  }
}
