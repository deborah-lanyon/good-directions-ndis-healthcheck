import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Create mail_campaigns if it doesn't exist (fixes case where migration 17
    // was recorded as run but tables weren't actually created)
    const hasCampaigns = await this.schema.hasTable('mail_campaigns')
    if (!hasCampaigns) {
      this.schema.createTable('mail_campaigns', (table) => {
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
        table.jsonb('postcodes').notNullable().defaultTo('[]')
        table.string('sync_status').nullable()
        table.text('sync_error_message').nullable()
        table.timestamp('posted_at').nullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
      })
    }

    const hasPivot = await this.schema.hasTable('campaign_properties')
    if (!hasPivot) {
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
  }

  async down() {
    // Don't drop in down — original migration 17 handles that
  }
}
