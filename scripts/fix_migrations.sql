-- Mark migrations as completed that have already been run manually
-- This prevents them from trying to run again

INSERT INTO adonis_schema (name, batch) 
VALUES ('database/migrations/1764100000001_add_logo_banner_to_welcome_pack_templates', 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO adonis_schema (name, batch)
VALUES ('database/migrations/1766191759607_create_add_template_design_to_welcome_pack_templates_table', 1)
ON CONFLICT (name) DO NOTHING;
