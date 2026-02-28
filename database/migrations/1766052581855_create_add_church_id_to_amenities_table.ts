import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddChurchIdToAmenities extends BaseSchema {
  public async up() {
    this.schema.alterTable('amenities', (table) => {
      table.integer('church_id').unsigned().references('id').inTable('churches').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.alterTable('amenities', (table) => {
      table.dropColumn('church_id')
    })
  }
}
