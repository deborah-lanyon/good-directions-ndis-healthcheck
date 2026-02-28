-- Manual SQL Migration for Production Database
-- Run this if you cannot run migrations via Railway

-- =====================================================
-- 1. Create visitor_groups table
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_groups (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  postcode VARCHAR(255) NOT NULL,
  description TEXT,
  lead_person_name VARCHAR(255),
  lead_person_email VARCHAR(255),
  lead_person_phone VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Add streets column (JSONB is better for PostgreSQL)
ALTER TABLE visitor_groups ADD COLUMN IF NOT EXISTS streets JSONB;

-- =====================================================
-- 2. Add visitor_group_id to street_assignments
-- =====================================================
ALTER TABLE street_assignments 
ADD COLUMN IF NOT EXISTS visitor_group_id INTEGER;

-- =====================================================
-- 3. Add visitor_group_id to visitors
-- =====================================================
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS visitor_group_id INTEGER;

-- =====================================================
-- Verify tables were created
-- =====================================================
-- Check visitor_groups table
SELECT 'visitor_groups columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitor_groups'
ORDER BY ordinal_position;

-- Check street_assignments has visitor_group_id
SELECT 'street_assignments has visitor_group_id:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'street_assignments' 
AND column_name = 'visitor_group_id';

-- Check visitors has visitor_group_id
SELECT 'visitors has visitor_group_id:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'visitors' 
AND column_name = 'visitor_group_id';
