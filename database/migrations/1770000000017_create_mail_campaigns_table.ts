import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mail_campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('church_id')
        .unsigned()
        .references('id')
        .inTable('churches')
        .onDelete('CASCADE')
        .notNullable()
      table.string('name').notNullable()
      table.integer('property_count').notNullable().defaultTo(0)
      table.timestamp('posted_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('campaign_properties', (table) => {
      table.increments('id')
      table
        .integer('campaign_id')
        .unsigned()
        .references('id')
        .inTable('mail_campaigns')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('property_id')
        .unsigned()
        .references('id')
        .inTable('properties')
        .onDelete('CASCADE')
        .notNullable()
      table.boolean('label_generated').notNullable().defaultTo(false)
      table.boolean('posted').notNullable().defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['campaign_id', 'property_id'])
    })
  }

  async down() {
    this.schema.dropTable('campaign_properties')
    this.schema.dropTable(this.tableName)
  }
}
