import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'visitors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add optional foreign key to users table
      table.integer('user_id').unsigned().nullable()
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')

      // Add invitation token fields
      table.string('invitation_token', 64).nullable()
      table.timestamp('invitation_sent_at').nullable()
      table.timestamp('invitation_accepted_at').nullable()

      // Add last login tracking
      table.timestamp('last_login_at').nullable()

      // Ensure email is unique if provided (for visitor accounts)
      table.unique(['email'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
      table.dropColumn('user_id')
      table.dropColumn('invitation_token')
      table.dropColumn('invitation_sent_at')
      table.dropColumn('invitation_accepted_at')
      table.dropColumn('last_login_at')
      table.dropUnique(['email'])
    })
  }
}
