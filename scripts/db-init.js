#!/usr/bin/env node
const { execSync } = require('child_process')

function run(cmd) {
  try {
    console.log('> ' + cmd)
    const out = execSync(cmd, { stdio: 'inherit' })
    return out
  } catch (err) {
    console.error('Command failed:', cmd)
    throw err
  }
}

// Idempotent create role
const createRoleSql = `DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'welcomers_user') THEN
    CREATE ROLE welcomers_user WITH LOGIN PASSWORD 'welcomers_pass';
  END IF;
END $$;`

const createDbSql = `DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'welcomers_dev') THEN
    PERFORM pg_catalog.set_config('search_path', '', false);
    CREATE DATABASE welcomers_dev OWNER welcomers_user;
  END IF;
END $$;`

const grantSql = `DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_database WHERE datname = 'welcomers_dev') THEN
    GRANT ALL PRIVILEGES ON DATABASE welcomers_dev TO welcomers_user;
  END IF;
END $$;`

try {
  // Ensure container is running
  run('docker compose up -d db')

  // Run SQL commands via psql as postgres superuser
  run(
    `docker exec -i welcomers-postgres psql -U postgres -c "${createRoleSql.replace(/"/g, '\\"')}"`
  )
  run(`docker exec -i welcomers-postgres psql -U postgres -c "${createDbSql.replace(/"/g, '\\"')}"`)
  run(`docker exec -i welcomers-postgres psql -U postgres -c "${grantSql.replace(/"/g, '\\"')}"`)

  console.log(
    '\nDatabase initialization complete. You can now run migrations: node ace migration:run'
  )
} catch (err) {
  console.error('\ndb:init failed')
  process.exit(1)
}
