import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'churches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Timestamp for precise 24-hour tracking (replaces date-only last_sync_date for sync-on-login)
      table.timestamp('last_sync_at').nullable()
      // Status: null (never synced), 'syncing', 'completed', 'failed'
      table.string('sync_status', 20).nullable()
      // Retry tracking
      table.integer('sync_retry_count').notNullable().defaultTo(0)
      // Error message for debugging failed syncs
      table.text('sync_error_message').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_sync_at')
      table.dropColumn('sync_status')
      table.dropColumn('sync_retry_count')
      table.dropColumn('sync_error_message')
    })
  }
}
