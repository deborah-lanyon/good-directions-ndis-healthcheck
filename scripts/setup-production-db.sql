-- Complete database schema for Welcomers Portal
-- Run this in Cloud SQL Studio against the 'production' database

-- Enable PostGIS (already done, but just in case)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop all existing tables (if any)
DROP TABLE IF EXISTS welcome_pack_logs CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS amenity_types CASCADE;
DROP TABLE IF EXISTS welcome_pack_templates CASCADE;
DROP TABLE IF EXISTS street_assignments CASCADE;
DROP TABLE IF EXISTS street_groups CASCADE;
DROP TABLE IF EXISTS territories CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS churches CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_token VARCHAR(255),
  forgot_password_token VARCHAR(255),
  forgot_password_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Churches table
CREATE TABLE churches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  postcode VARCHAR(20),
  country VARCHAR(255),
  map_center_lat DOUBLE PRECISION,
  map_center_lng DOUBLE PRECISION,
  map_zoom INTEGER DEFAULT 13,
  last_sync_date TIMESTAMP,
  properties_last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  street VARCHAR(255),
  postcode VARCHAR(20),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_from_church DOUBLE PRECISION,
  price DECIMAL(12, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type VARCHAR(100),
  sold_date DATE,
  feedback_status VARCHAR(50) DEFAULT 'not_visited',
  visitor_id INTEGER,
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Territories table
CREATE TABLE territories (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  postcodes JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Street groups table
CREATE TABLE street_groups (
  id SERIAL PRIMARY KEY,
  territory_id INTEGER REFERENCES territories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Street assignments table
CREATE TABLE street_assignments (
  id SERIAL PRIMARY KEY,
  street_group_id INTEGER REFERENCES street_groups(id) ON DELETE CASCADE,
  street_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Visitors table
CREATE TABLE visitors (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Welcome pack templates table
CREATE TABLE welcome_pack_templates (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Amenity types table
CREATE TABLE amenity_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Amenities table
CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  amenity_type_id INTEGER REFERENCES amenity_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Welcome pack logs table
CREATE TABLE welcome_pack_logs (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES welcome_pack_templates(id) ON DELETE SET NULL,
  generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for visitor_id in properties
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_visitor 
FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_properties_church_id ON properties(church_id);
CREATE INDEX idx_properties_postcode ON properties(postcode);
CREATE INDEX idx_properties_street ON properties(street);
CREATE INDEX idx_territories_church_id ON territories(church_id);
CREATE INDEX idx_street_groups_territory_id ON street_groups(territory_id);
CREATE INDEX idx_visitors_church_id ON visitors(church_id);
CREATE INDEX idx_amenities_church_id ON amenities(church_id);

-- Insert default amenity types
INSERT INTO amenity_types (name, icon) VALUES
  ('Hospital', 'hospital'),
  ('School', 'school'),
  ('Supermarket', 'shopping-cart'),
  ('Park', 'tree'),
  ('Restaurant', 'utensils'),
  ('Pharmacy', 'pills'),
  ('Library', 'book'),
  ('Gym', 'dumbbell')
ON CONFLICT (name) DO NOTHING;

SELECT 'Database schema created successfully!' as status;
