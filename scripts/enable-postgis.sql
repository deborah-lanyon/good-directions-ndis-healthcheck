-- Enable PostGIS extension for the production database
-- Run this in Cloud SQL Studio or via psql

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_version();
