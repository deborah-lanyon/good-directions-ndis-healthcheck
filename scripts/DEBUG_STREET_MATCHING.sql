-- Run these queries to debug street matching issues
-- Replace <church_id> with your actual church ID

-- 1. Get all unique street names from properties
SELECT DISTINCT street_name, COUNT(*) as property_count
FROM properties
WHERE church_id = <church_id>
ORDER BY street_name;

-- 2. Get all street assignments for this church
SELECT 
    sa.street_name,
    sg.name as street_group_name,
    t.name as territory_name
FROM street_assignments sa
JOIN street_groups sg ON sa.street_group_id = sg.id
JOIN territories t ON sg.territory_id = t.id
WHERE t.church_id = <church_id>
ORDER BY sa.street_name;

-- 3. Find properties with street names that DON'T match any street assignment
SELECT DISTINCT p.street_name, COUNT(*) as count
FROM properties p
WHERE p.church_id = <church_id>
AND p.street_name NOT IN (
    SELECT sa.street_name
    FROM street_assignments sa
    JOIN street_groups sg ON sa.street_group_id = sg.id
    JOIN territories t ON sg.territory_id = t.id
    WHERE t.church_id = <church_id>
)
GROUP BY p.street_name
ORDER BY p.street_name;

-- 4. Find street assignments that DON'T match any property
SELECT DISTINCT sa.street_name, sg.name as group_name
FROM street_assignments sa
JOIN street_groups sg ON sa.street_group_id = sg.id
JOIN territories t ON sg.territory_id = t.id
WHERE t.church_id = <church_id>
AND sa.street_name NOT IN (
    SELECT DISTINCT street_name
    FROM properties
    WHERE church_id = <church_id>
)
ORDER BY sa.street_name;

-- 5. Sample some properties to see full addresses and extracted street names
SELECT address, street_name, postcode
FROM properties
WHERE church_id = <church_id>
LIMIT 20;

-- 6. Check for case-sensitive mismatches
SELECT 
    p.street_name as property_street,
    sa.street_name as assignment_street
FROM (SELECT DISTINCT street_name FROM properties WHERE church_id = <church_id>) p
CROSS JOIN (
    SELECT DISTINCT sa.street_name
    FROM street_assignments sa
    JOIN street_groups sg ON sa.street_group_id = sg.id
    JOIN territories t ON sg.territory_id = t.id
    WHERE t.church_id = <church_id>
) sa
WHERE LOWER(p.street_name) = LOWER(sa.street_name)
AND p.street_name != sa.street_name;
