import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Use raw SQL for idempotent migration
    await this.db.rawQuery(`
      -- 1. Add church_id to street_groups if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='street_groups' AND column_name='church_id'
        ) THEN
          ALTER TABLE street_groups 
          ADD COLUMN church_id integer NULL;
          
          ALTER TABLE street_groups 
          ADD CONSTRAINT street_groups_church_id_foreign 
          FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
        END IF;
      END $$;

      -- 2. Migrate data: copy church_id from territories to street_groups
      UPDATE street_groups 
      SET church_id = territories.church_id 
      FROM territories 
      WHERE street_groups.territory_id = territories.id;

      -- 3. Make church_id NOT NULL
      ALTER TABLE street_groups ALTER COLUMN church_id SET NOT NULL;

      -- 4. Drop territory_id from street_groups
      ALTER TABLE street_groups DROP CONSTRAINT IF EXISTS street_groups_territory_id_foreign;
      ALTER TABLE street_groups DROP COLUMN IF EXISTS territory_id;

      -- 5. Drop visitor_group_id from visitors
      ALTER TABLE visitors DROP CONSTRAINT IF EXISTS visitors_visitor_group_id_foreign;
      ALTER TABLE visitors DROP COLUMN IF EXISTS visitor_group_id;

      -- 6. Drop visitor_group_id from street_assignments
      ALTER TABLE street_assignments DROP CONSTRAINT IF EXISTS street_assignments_visitor_group_id_foreign;
      ALTER TABLE street_assignments DROP COLUMN IF EXISTS visitor_group_id;

      -- 7 & 8. Drop tables
      DROP TABLE IF EXISTS visitor_groups CASCADE;
      DROP TABLE IF EXISTS territories CASCADE;
    `)
  }

  async down() {
    // Recreate territories table
    await this.schema.createTable('territories', (table) => {
      table.increments('id')
      table.integer('church_id').unsigned().references('id').inTable('churches').onDelete('CASCADE')
      table.string('name').notNullable()
      table.jsonb('postcodes').notNullable()
      table.string('lead_person_name').nullable()
      table.string('lead_person_email').nullable()
      table.string('lead_person_phone').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Recreate visitor_groups table
    await this.schema.createTable('visitor_groups', (table) => {
      table.increments('id')
      table.integer('church_id').unsigned().references('id').inTable('churches').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('postcode').notNullable()
      table.jsonb('streets').defaultTo('[]')
      table.text('description').nullable()
      table.string('lead_person_name').nullable()
      table.string('lead_person_email').nullable()
      table.string('lead_person_phone').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Add visitor_group_id back to visitors
    await this.schema.alterTable('visitors', (table) => {
      table
        .integer('visitor_group_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('visitor_groups')
        .onDelete('SET NULL')
    })

    // Add visitor_group_id back to street_assignments
    await this.schema.alterTable('street_assignments', (table) => {
      table
        .integer('visitor_group_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('visitor_groups')
        .onDelete('SET NULL')
    })

    // Add territory_id back to street_groups, drop church_id
    await this.schema.alterTable('street_groups', (table) => {
      table
        .integer('territory_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('territories')
        .onDelete('CASCADE')
    })

    // Drop church_id constraint and column if they exist
    await this.db.rawQuery(`
      DO $$
      BEGIN
        -- Drop the foreign key constraint if it exists
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'street_groups_church_id_foreign'
        ) THEN
          ALTER TABLE street_groups DROP CONSTRAINT street_groups_church_id_foreign;
        END IF;

        -- Drop the column if it exists
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='street_groups' AND column_name='church_id'
        ) THEN
          ALTER TABLE street_groups DROP COLUMN church_id;
        END IF;
      END $$;
    `)
  }
}
