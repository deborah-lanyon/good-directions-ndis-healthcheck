import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // How To Use page content
      table.string('how_to_use_title').defaultTo('How To Use').notNullable()
      table.text('how_to_use_intro').nullable()
      table.text('how_to_use_step1_title').nullable()
      table.text('how_to_use_step1_content').nullable()
      table.text('how_to_use_step2_title').nullable()
      table.text('how_to_use_step2_content').nullable()
      table.text('how_to_use_step3_title').nullable()
      table.text('how_to_use_step3_content').nullable()
      table.text('how_to_use_step4_title').nullable()
      table.text('how_to_use_step4_content').nullable()

      // About Us page content
      table.string('about_us_title').defaultTo('About Us').notNullable()
      table.text('about_us_intro').nullable()
      table.text('about_us_mission').nullable()
      table.text('about_us_vision').nullable()
      table.text('about_us_contact').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('how_to_use_title')
      table.dropColumn('how_to_use_intro')
      table.dropColumn('how_to_use_step1_title')
      table.dropColumn('how_to_use_step1_content')
      table.dropColumn('how_to_use_step2_title')
      table.dropColumn('how_to_use_step2_content')
      table.dropColumn('how_to_use_step3_title')
      table.dropColumn('how_to_use_step3_content')
      table.dropColumn('how_to_use_step4_title')
      table.dropColumn('how_to_use_step4_content')
      table.dropColumn('about_us_title')
      table.dropColumn('about_us_intro')
      table.dropColumn('about_us_mission')
      table.dropColumn('about_us_vision')
      table.dropColumn('about_us_contact')
    })
  }
}
