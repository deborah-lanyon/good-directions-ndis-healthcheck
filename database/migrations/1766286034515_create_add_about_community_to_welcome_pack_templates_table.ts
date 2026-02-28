import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('about_community').nullable().comment('About our community text for welcome page')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('about_community')
    })
  }
}
