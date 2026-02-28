import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('contact_address').nullable().comment('Contact address for church')
      table.string('contact_email').nullable().comment('Contact email for church')
      table.string('contact_phone').nullable().comment('Contact phone for church')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('contact_address')
      table.dropColumn('contact_email')
      table.dropColumn('contact_phone')
    })
  }
}
