-- Safe Production Migration Marker Script
-- Run this on PRODUCTION database BEFORE deploying new code
-- This tells AdonisJS the migration has already been applied manually

-- First, check if migration already exists
SELECT name, batch, migration_time 
FROM adonis_schema 
WHERE name = 'database/migrations/1765446745419_create_simplify_schema_remove_territories_and_visitor_groups_table';

-- If the query above returns no rows, run this INSERT:
INSERT INTO adonis_schema (name, batch, migration_time) 
VALUES (
  'database/migrations/1765446745419_create_simplify_schema_remove_territories_and_visitor_groups_table',
  (SELECT COALESCE(MAX(batch), 0) + 1 FROM adonis_schema),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Verify it was added:
SELECT name, batch, migration_time 
FROM adonis_schema 
WHERE name LIKE '%simplify_schema%';

-- Expected result: One row showing the migration is marked as complete
