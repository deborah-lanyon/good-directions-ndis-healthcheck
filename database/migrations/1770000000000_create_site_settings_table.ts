import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('hero_title').notNullable().defaultTo('Reach those in your community')
      table.text('hero_paragraph_1').nullable()
      table.text('hero_paragraph_2').nullable()
      table.text('hero_paragraph_3').nullable()
      table.string('cta_title').notNullable().defaultTo('Ready to welcome your community?')
      table.string('cta_button_text').notNullable().defaultTo('Submit')
      table.string('hero_image_url').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
