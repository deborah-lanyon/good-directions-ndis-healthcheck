import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('admin_approval_status', ['pending', 'approved', 'rejected']).defaultTo('pending')
      table.string('admin_approval_token').nullable()
      table.timestamp('admin_approval_token_expires_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('admin_approval_status')
      table.dropColumn('admin_approval_token')
      table.dropColumn('admin_approval_token_expires_at')
    })
  }
}
