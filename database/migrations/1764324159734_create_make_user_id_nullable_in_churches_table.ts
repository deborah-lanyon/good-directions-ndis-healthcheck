import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'churches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Change user_id to nullable (constraint may not exist in production)
      table.integer('user_id').unsigned().nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
      table.integer('user_id').unsigned().notNullable().alter()
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }
}
