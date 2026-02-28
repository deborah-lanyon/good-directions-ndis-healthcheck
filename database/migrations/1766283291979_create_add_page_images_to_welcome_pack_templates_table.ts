import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('getting_around_image_url').nullable().comment('Image for Getting Around page')
      table
        .string('community_services_image_url')
        .nullable()
        .comment('Image for Community Services page')
      table.string('things_to_do_image_url').nullable().comment('Image for Things to Do page')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('getting_around_image_url')
      table.dropColumn('community_services_image_url')
      table.dropColumn('things_to_do_image_url')
    })
  }
}
