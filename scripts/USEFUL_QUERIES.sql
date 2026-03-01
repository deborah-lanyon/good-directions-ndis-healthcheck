-- Useful SQL Queries for Good Directions NDIS Healthcheck Development
-- Keep commonly-used queries here for quick reference

-- ============================================
-- CHURCH QUERIES
-- ============================================

-- List all churches with IDs
SELECT id, church_name, postcode FROM churches;

-- Get specific church details
SELECT * FROM churches WHERE id = 1;


-- ============================================
-- STREET GROUP QUERIES
-- ============================================

-- List all street groups for a church
SELECT sg.id, sg.name, sg.description, t.name as territory_name
FROM street_groups sg
JOIN territories t ON sg.territory_id = t.id
WHERE t.church_id = 1;

-- Get street assignments for a specific street group
SELECT sa.id, sa.street_name, sg.name as group_name
FROM street_assignments sa
JOIN street_groups sg ON sa.street_group_id = sg.id
WHERE sg.id = 1;

-- Delete old test street groups (BE CAREFUL!)
-- DELETE FROM street_groups 
-- WHERE territory_id IN (SELECT id FROM territories WHERE church_id = 1) 
-- AND name != 'Beachside streets';


-- ============================================
-- PROPERTY QUERIES
-- ============================================

-- Check extracted street names for specific addresses
SELECT address, street_name, postcode 
FROM properties 
WHERE church_id = 1 
AND (address LIKE '%Malua%' OR address LIKE '%Grand Parade%');

-- Count properties by street name
SELECT street_name, COUNT(*) as count
FROM properties
WHERE church_id = 1
GROUP BY street_name
ORDER BY count DESC;

-- Find properties without extracted street names
SELECT id, address FROM properties 
WHERE church_id = 1 AND street_name IS NULL;


-- ============================================
-- TERRITORY QUERIES
-- ============================================

-- List all territories for a church
SELECT id, name, postcodes FROM territories WHERE church_id = 1;

-- Get the default territory for a church
SELECT * FROM territories 
WHERE church_id = 1 AND name = 'Default';


-- ============================================
-- VISITOR QUERIES
-- ============================================

-- List all visitors for a church with their assigned street groups
SELECT v.id, v.visitor_name, sg.name as street_group_name
FROM visitors v
LEFT JOIN street_groups sg ON v.street_group_id = sg.id
WHERE v.church_id = 1;


-- ============================================
-- DEBUGGING QUERIES
-- ============================================

-- Compare property street names with street assignments
SELECT DISTINCT p.street_name as property_street, sa.street_name as assignment_street
FROM properties p
CROSS JOIN street_assignments sa
WHERE p.church_id = 1
AND sa.street_group_id IN (
  SELECT sg.id FROM street_groups sg
  JOIN territories t ON sg.territory_id = t.id
  WHERE t.church_id = 1
)
ORDER BY p.street_name;

-- Find properties that should match a street group but don't
SELECT p.id, p.address, p.street_name
FROM properties p
WHERE p.church_id = 1
AND p.street_name IN (
  SELECT street_name FROM street_assignments 
  WHERE street_group_id = 1
);
