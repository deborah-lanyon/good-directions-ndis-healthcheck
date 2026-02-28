import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('logo_url')
        .nullable()
        .comment('URL to church logo image (transparent PNG or SVG recommended)')
      table.string('banner_url').nullable().comment('URL to welcome pack banner image')
      table.string('primary_color').nullable().defaultTo('#0056c9').comment('Primary brand color')
      table
        .string('secondary_color')
        .nullable()
        .defaultTo('#059669')
        .comment('Secondary brand color')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('logo_url')
      table.dropColumn('banner_url')
      table.dropColumn('primary_color')
      table.dropColumn('secondary_color')
    })
  }
}
