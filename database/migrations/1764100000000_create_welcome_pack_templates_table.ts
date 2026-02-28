import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('church_id').unsigned().references('id').inTable('churches').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('welcome_message').nullable()
      table.text('church_info').nullable()
      table.text('custom_content').nullable()
      table.boolean('include_amenities').defaultTo(true)
      table.boolean('enabled').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
