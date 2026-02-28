import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'amenities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('amenity_type_id')
        .unsigned()
        .references('id')
        .inTable('amenity_types')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('address').notNullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.string('phone').nullable()
      table.string('website').nullable()
      table.string('suburb').nullable()
      table.string('postcode').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Create index for spatial queries
    this.schema.raw(
      'CREATE INDEX amenities_latitude_longitude_idx ON amenities (latitude, longitude)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
