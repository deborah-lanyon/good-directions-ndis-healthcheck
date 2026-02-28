import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Step 1: Clean up orphaned visitors and add church_id
    await this.db.rawQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'visitors' AND column_name = 'church_id'
        ) THEN
          -- Delete orphaned visitors (no street group assigned)
          DELETE FROM visitors WHERE street_group_id IS NULL;
          
          -- Add church_id column
          ALTER TABLE visitors ADD COLUMN church_id INTEGER;
          
          -- Populate church_id from street_groups
          UPDATE visitors v
          SET church_id = sg.church_id
          FROM street_groups sg
          WHERE v.street_group_id = sg.id;
          
          -- Add foreign key constraint
          ALTER TABLE visitors 
          ADD CONSTRAINT visitors_church_id_foreign 
          FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
          
          -- Make church_id NOT NULL after populating
          ALTER TABLE visitors ALTER COLUMN church_id SET NOT NULL;
        END IF;
      END $$;
    `)

    // Step 2: Create pivot table for many-to-many relationship (if not exists)
    await this.db.rawQuery(`
      CREATE TABLE IF NOT EXISTS street_group_visitor (
        id SERIAL PRIMARY KEY,
        street_group_id INTEGER NOT NULL,
        visitor_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        CONSTRAINT street_group_visitor_street_group_id_foreign 
          FOREIGN KEY (street_group_id) REFERENCES street_groups(id) ON DELETE CASCADE,
        CONSTRAINT street_group_visitor_visitor_id_foreign 
          FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
        CONSTRAINT street_group_visitor_street_group_id_visitor_id_unique 
          UNIQUE (street_group_id, visitor_id)
      )
    `)

    // Step 3: Migrate existing data from street_group_id to pivot table (idempotent)
    await this.db.rawQuery(`
      INSERT INTO street_group_visitor (street_group_id, visitor_id, created_at, updated_at)
      SELECT v.street_group_id, v.id, NOW(), NOW()
      FROM visitors v
      WHERE v.street_group_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM street_group_visitor sgv
          WHERE sgv.street_group_id = v.street_group_id
            AND sgv.visitor_id = v.id
        )
    `)

    // Step 4: Remove street_group_id from visitors table
    await this.db.rawQuery(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'visitors' AND column_name = 'street_group_id'
        ) THEN
          ALTER TABLE visitors DROP COLUMN street_group_id;
        END IF;
      END $$;
    `)
  }

  async down() {
    // Reverse: Add back street_group_id to visitors
    await this.db.rawQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'visitors' AND column_name = 'street_group_id'
        ) THEN
          ALTER TABLE visitors ADD COLUMN street_group_id INTEGER;
          
          -- Restore street_group_id from pivot table (take first assignment)
          UPDATE visitors v
          SET street_group_id = (
            SELECT sgv.street_group_id 
            FROM street_group_visitor sgv 
            WHERE sgv.visitor_id = v.id 
            LIMIT 1
          );
          
          ALTER TABLE visitors 
          ADD CONSTRAINT visitors_street_group_id_foreign 
          FOREIGN KEY (street_group_id) REFERENCES street_groups(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `)

    // Drop pivot table
    this.schema.dropTable('street_group_visitor')

    // Remove church_id from visitors
    await this.db.rawQuery(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'visitors' AND column_name = 'church_id'
        ) THEN
          ALTER TABLE visitors DROP COLUMN church_id;
        END IF;
      END $$;
    `)
  }
}
