import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'amenity_types'

  async up() {
    // Use raw SQL to handle constraints conditionally
    await this.db.rawQuery(`
      DO $$
      BEGIN
        -- Drop the old single-column unique constraint if it exists
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'amenity_types_name_unique'
        ) THEN
          ALTER TABLE amenity_types DROP CONSTRAINT amenity_types_name_unique;
        END IF;

        -- Add the composite unique constraint if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'amenity_types_name_subcategory_unique'
        ) THEN
          ALTER TABLE amenity_types ADD CONSTRAINT amenity_types_name_subcategory_unique UNIQUE (name, subcategory);
        END IF;
      END $$;
    `)
  }

  async down() {
    // When rolling back, we just drop the composite constraint
    // We don't restore the old single-column constraint because:
    // 1. It may cause conflicts with existing data
    // 2. It will be recreated if we rollback to earlier migrations
    this.schema.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'amenity_types_name_subcategory_unique'
        ) THEN
          ALTER TABLE amenity_types DROP CONSTRAINT amenity_types_name_subcategory_unique;
        END IF;
      END $$;
    `)
  }
}
