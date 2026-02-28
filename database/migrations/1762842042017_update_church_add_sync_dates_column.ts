import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'churches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('last_sync_date').notNullable().defaultTo(DateTime.now().toFormat('yyyy-MM-dd'))
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_sync_date')
    })
  }
}
