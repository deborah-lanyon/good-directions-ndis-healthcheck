import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'territories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('church_id').unsigned().references('id').inTable('churches').onDelete('CASCADE')
      table.string('name').notNullable()
      table.json('postcodes').notNullable() // Array of postcodes like ["2219", "2220"]
      table.string('lead_person_name').nullable()
      table.string('lead_person_email').nullable()
      table.string('lead_person_phone').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
