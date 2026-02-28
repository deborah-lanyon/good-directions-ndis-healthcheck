import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add new paragraph fields for About Us
      table.text('about_us_paragraph_1').nullable()
      table.text('about_us_paragraph_2').nullable()
      table.text('about_us_paragraph_3').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('about_us_paragraph_1')
      table.dropColumn('about_us_paragraph_2')
      table.dropColumn('about_us_paragraph_3')
    })
  }
}
