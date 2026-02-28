import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'welcome_pack_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Update default values for primary and secondary colors
      table.string('primary_color').nullable().defaultTo('#94b4af').alter()
      table.string('secondary_color').nullable().defaultTo('#566874').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert to old default values
      table.string('primary_color').nullable().defaultTo('#0056c9').alter()
      table.string('secondary_color').nullable().defaultTo('#059669').alter()
    })
  }
}
