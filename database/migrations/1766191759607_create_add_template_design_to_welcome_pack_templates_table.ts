import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('template_design').defaultTo('default').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('template_design')
    })
  }
}
