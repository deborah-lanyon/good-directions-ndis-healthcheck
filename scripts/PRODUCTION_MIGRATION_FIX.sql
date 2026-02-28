-- =====================================================================
-- PRODUCTION DATABASE MIGRATION FIX (RECOVERY VERSION)
-- Run this in Google Cloud SQL Studio (Query tab)
-- =====================================================================

-- This handles partial execution and completes the migration safely

-- Step 1: Clean up orphaned visitors and add church_id (if not done)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visitors' AND column_name = 'church_id'
  ) THEN
    -- Only delete orphaned visitors if street_group_id still exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'visitors' AND column_name = 'street_group_id'
    ) THEN
      DELETE FROM visitors WHERE street_group_id IS NULL;
    END IF;
    
    -- Add church_id column
    ALTER TABLE visitors ADD COLUMN church_id INTEGER;
    
    -- Populate church_id from street_groups (only if street_group_id exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'visitors' AND column_name = 'street_group_id'
    ) THEN
      UPDATE visitors v
      SET church_id = sg.church_id
      FROM street_groups sg
      WHERE v.street_group_id = sg.id;
    END IF;
    
    -- Add foreign key constraint
    ALTER TABLE visitors 
    ADD CONSTRAINT visitors_church_id_foreign 
    FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;
    
    -- Make church_id NOT NULL after populating
    ALTER TABLE visitors ALTER COLUMN church_id SET NOT NULL;
  END IF;
END $$;

-- Step 2: Create pivot table for many-to-many relationship
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
);

-- Step 3: Migrate existing data from street_group_id to pivot table (if column still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visitors' AND column_name = 'street_group_id'
  ) THEN
    INSERT INTO street_group_visitor (street_group_id, visitor_id, created_at, updated_at)
    SELECT v.street_group_id, v.id, NOW(), NOW()
    FROM visitors v
    WHERE v.street_group_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM street_group_visitor sgv
        WHERE sgv.street_group_id = v.street_group_id
          AND sgv.visitor_id = v.id
      );
  END IF;
END $$;

-- Step 4: Remove street_group_id from visitors table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visitors' AND column_name = 'street_group_id'
  ) THEN
    ALTER TABLE visitors DROP COLUMN street_group_id;
  END IF;
END $$;

-- Step 5: Mark migration as complete in adonis_schema
INSERT INTO adonis_schema (name, batch)
SELECT 
  'database/migrations/1765497370845_create_create_street_group_visitor_pivots_table',
  (SELECT COALESCE(MAX(batch), 0) + 1 FROM adonis_schema)
WHERE NOT EXISTS (
  SELECT 1 FROM adonis_schema 
  WHERE name = 'database/migrations/1765497370845_create_create_street_group_visitor_pivots_table'
);

-- =====================================================================
-- VERIFICATION QUERIES (Run these SEPARATELY after the migration)
-- =====================================================================

-- Query 1: Should return only 'church_id'
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name IN ('church_id', 'street_group_id');

-- Query 2: Should return 1
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'street_group_visitor';

-- Query 3: Should show the new migration
SELECT name FROM adonis_schema WHERE name LIKE '%visitor%' ORDER BY batch DESC;

-- Query 4: Check all visitors have church_id
SELECT COUNT(*) FROM visitors WHERE church_id IS NOT NULL;
