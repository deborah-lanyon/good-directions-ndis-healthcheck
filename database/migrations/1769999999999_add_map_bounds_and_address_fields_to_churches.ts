import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddMapBoundsAndAddressFieldsToChurches extends BaseSchema {
  protected tableName = 'churches'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('address_line1').nullable()
      table.string('address_line2').nullable()
      table.string('country').nullable()

      table.jsonb('map_bounds').nullable()
      table.integer('map_zoom').nullable()
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('address_line1')
      table.dropColumn('address_line2')
      table.dropColumn('country')

      table.dropColumn('map_bounds')
      table.dropColumn('map_zoom')
    })
  }
}
