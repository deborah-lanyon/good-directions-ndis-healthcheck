# Copilot / AI Agent Instructions — Good Directions NDIS Healthcheck

**Short, actionable guidance to help AI coding agents be productive in this repository.**

## 1. Architecture Overview

**Backend:** AdonisJS 6 (TypeScript) + PostgreSQL with PostGIS  
**Frontend:** Inertia.js + Vue 3 (in `inertia/`), built via Vite  
**Services-first design:** Business logic in `app/services/*`, controllers are thin adapters  
**Key data flow:** `Controller` → `Service` → `Model` → DB

- Example: `PropertiesController.sync()` → `PropertySyncService.syncAllChurches()` → `PropertyService.syncPropertiesForChurch()` → `ZylaPropertyService.fetchProperties()` → `Property` model

**Domain structure:**

- **Properties**: External property data from Zyla API, filtered by church radius, auto-assigned to territories/visitors
- **Territories**: Postcode-based groupings for property management
- **Street Groups**: Sub-divisions within territories with assigned visitors
- **Welcome Packs**: PDF generation with church branding (logo/banner via GCS), local amenities, custom templates
- **Route Planning**: Google Maps API integration for optimized visiting routes

## 2. Development Commands (PowerShell)

```powershell
npm run dev           # Start dev server with HMR (backend + Vite)
npm run build         # Compile TypeScript + bundle assets
npm start             # Serve production build
node ace migration:run # Apply pending migrations
npm run test          # Run Japa test suite with DB transactions
npm run typecheck     # Type-check without building (fast)
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

**Docker setup:**

```powershell
npm run dev:all       # Start Postgres, init DB, run migrations, start dev
```

**Custom Ace commands (in `commands/`):**

```powershell
node ace make:super_admin <email>  # Create/promote super admin
node ace reset:password <email>    # Reset user password
node ace purge:properties          # Clear all properties
node ace debug:street_matching     # Troubleshoot street group assignments
node ace debug:property_data       # Inspect property data
```

## 3. Critical Conventions

### 3.1 Import Aliases

AdonisJS uses subpath imports (defined in `package.json`). Always use `#` prefixes:

```typescript
import Property from '#models/property'
import { PropertyService } from '#services/property_service'
import { middleware } from '#start/kernel'
```

**Never** use relative paths (`../../models/property`) for app code.

### 3.2 Service Dependency Injection

Services accept optional dependencies for testability:

```typescript
export class PropertyService {
  constructor(zylaService?: ZylaPropertyService) {
    this.zylaService = zylaService ?? new ZylaPropertyService()
  }
}
```

**When testing:** Pass mock services via constructor (see `tests/unit/property_service.spec.ts`)

### 3.3 Error Message Control Flow

Controllers check `error.message` strings for HTTP status codes. **Never change these messages without updating controllers/tests:**

```typescript
// In PropertyService
throw new Error('Property not found') // Controller maps this to 404
throw new Error('You do not have permission...') // Maps to 403
```

See `app/controllers/properties_controller.ts:41-51` for examples.

### 3.4 Inertia vs JSON Responses

- **Inertia pages:** `inertia.render('dashboard', { properties })` for Vue SSR
- **API endpoints:** `response.json({ data })` for AJAX calls
- Mixed routes exist in `start/routes.ts` — check prefix and middleware usage

### 3.5 Model Serialization & Custom Fields

Models use `$extras` for computed fields from joins:

```typescript
// In Territory model
serialize() {
  const data = super.serialize()
  if (this.$extras.totalProperties !== undefined) {
    data.totalProperties = this.$extras.totalProperties
  }
  return data
}
```

### 3.6 Lucid Column Transformations

Complex column types (e.g., JSONB arrays) need prepare/consume/serialize:

```typescript
@column({
  prepare: (value: string[]) => JSON.stringify(value),
  consume: (value: string | string[]) => Array.isArray(value) ? value : JSON.parse(value),
  serialize: (value: string[]) => value,
})
declare postcodes: string[]
```

See `app/models/territory.ts:16-29` for reference.

## 4. Testing Patterns

**Japa test structure:**

- Tests run with isolated transactions (`tests/bootstrap.ts`)
- Use factories for test data (`database/factories/*`)
- Mock external APIs by injecting fake services

**Example test stub:**

```typescript
const mockZylaService = {
  fetchProperties: async () => ({ properties: [...], totalFromApi: 10 })
}
const propertyService = new PropertyService(mockZylaService)
```

## 5. Authentication & Authorization

- Auth uses Adonis `web` guard with sessions (not JWT)
- Protected routes: `.use(middleware.auth())` in `start/routes.ts`
- API sync endpoint: `.use(middleware.appKey())` requires `Authorization: Bearer <APP_KEY>`
- User approval workflow: Admin receives email with token-based approve/reject links

**Triggering manual sync (dev):**

```powershell
curl -H "Authorization: Bearer $env:APP_KEY" http://localhost:3333/api/properties/sync
```

## 6. Background Jobs & Scheduling

**Automatic property sync:** Uses Cloud Run Jobs + Cloud Scheduler for reliable scheduled execution:

- Daily sync runs at 2:00 AM Australia/Sydney timezone
- Cloud Scheduler triggers the `daily-property-sync` Cloud Run Job
- Job executes `node ace sync:properties` command
- Completely isolated from web service (no dependency on running instances)

**Architecture:**

- **Cloud Run Job**: `daily-property-sync` - Runs the sync command
- **Cloud Scheduler**: `daily-property-sync-trigger` - Triggers the job daily at 2 AM
- **Ace Command**: `commands/sync_properties.ts` - Contains sync logic

**Manual sync (development):**

```powershell
# Via API endpoint
curl -H "Authorization: Bearer $env:APP_KEY" http://localhost:3333/api/properties/sync

# Via Ace command
node ace sync:properties
```

**Manual sync (production):**

```bash
# Execute the Cloud Run Job
gcloud run jobs execute daily-property-sync --region=europe-west1 --wait

# Or via API endpoint
curl -H "Authorization: Bearer $APP_KEY" https://production-<hash>.run.app/api/properties/sync
```

**Setup instructions:**

1. Run `./setup-property-sync-job.sh` in Google Cloud Shell to create the Cloud Run Job
2. Run `./setup-property-sync-scheduler.sh` to create the Cloud Scheduler trigger

## 7. External Integrations

| Service                  | Usage                             | Config                                                     |
| ------------------------ | --------------------------------- | ---------------------------------------------------------- |
| **Zyla API**             | Property sales data               | `ZYLA_API_KEY` in `.env`                                   |
| **geocode.maps.co**      | Address → lat/lng                 | `GEOCODE_API_KEY`                                          |
| **Google Maps API**      | Route optimization                | `GOOGLE_MAPS_API_KEY` (optional)                           |
| **Google Cloud Storage** | Welcome pack images (logo/banner) | `GCP_PROJECT_ID`, `GCS_BUCKET_NAME`                        |
| **SMTP**                 | User emails, notifications        | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` |

**GCS Usage Pattern:**

```typescript
const gcsService = new GcsStorageService()
const publicUrl = await gcsService.uploadFile(buffer, fileName, mimeType, 'welcome-packs')
```

See `app/services/gcs_storage_service.ts` and `app/controllers/welcome_pack_uploads_controller.ts`.

## 8. Database Patterns

**PostGIS for geo queries:**

- Churches have `latitude`, `longitude` for radius filtering
- Properties auto-calculate `distance_from_church` during sync
- Use raw SQL for PostGIS functions when needed

**Territory → Street Group → Visitor hierarchy:**

- Territories contain postcodes (JSONB array)
- Street Groups belong to territories, have assigned streets
- Visitors auto-assigned to properties based on postcode + street matches during property sync

## 9. Key Files by Feature

| Feature                  | Entry Points                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Property Sync**        | `app/services/property_sync_service.ts`, `app/services/zyla_property_service.ts`                                     |
| **Territory Management** | `app/controllers/territories_controller.ts`, `app/services/territory_service.ts`                                     |
| **Welcome Packs**        | `app/services/welcome_pack_service.ts`, `app/services/pdf_service.ts`, `app/controllers/welcome_packs_controller.ts` |
| **Route Planning**       | `app/services/route_service.ts`, `app/controllers/routes_controller.ts`                                              |
| **Auth Flow**            | `app/services/auth_service.ts`, `app/controllers/users_controller.ts`                                                |
| **Validation**           | `app/validators/*` (VineJS schemas)                                                                                  |
| **Frontend Pages**       | `inertia/pages/*` (Vue 3 SFCs)                                                                                       |

## 10. Environment Variables (see `start/env.ts`)

**Required:**

- `APP_KEY` — Adonis encryption key + API bearer token
- `DB_*` — PostgreSQL connection (must have PostGIS extension)
- `GEOCODE_API_KEY`, `ZYLA_API_KEY` — External APIs
- `SMTP_*`, `ADMIN_EMAIL` — Email delivery

**Optional:**

- `GOOGLE_MAPS_API_KEY` — Route optimization (fallback: simple distance sort)
- `GCP_PROJECT_ID`, `GCS_BUCKET_NAME` — Welcome pack image uploads

## 11. When to Ask the User

- Changing error messages used for HTTP status mapping (see #3.2)
- Modifying property sync windows or filters (affects background jobs)
- Altering territory/visitor auto-assignment logic (impacts core domain)
- Deployment configuration changes (Railway, GCP, etc.)

## 12. Production Database Migrations

**Important:** Migrations run automatically on deployment via the `portal-migrate` Cloud Run job configured in `cloudbuild.yaml`.

### Automatic Migration Flow (Current Setup)

The `cloudbuild.yaml` deployment pipeline automatically:

1. Builds Docker image with tags `$COMMIT_SHA` and `latest`
2. Pushes both tags to Google Container Registry
3. Deploys the `production` Cloud Run service with the `$COMMIT_SHA` image
4. Executes the `portal-migrate` job which runs `node ace migration:run --force`

**Cloud Run Job Configuration:**
The `portal-migrate` job is pre-configured with:

- Image: Updates automatically to use latest successful build
- Cloud SQL connection: `cmw-portal:europe-west1:cmw`
- Secrets: `APP_KEY` and `DB_PASSWORD` from Secret Manager
- Environment variables: Production database credentials

### Manual Migration (If Needed)

To run migrations manually in Google Cloud Shell:

```bash
# Execute the existing portal-migrate job
gcloud run jobs execute portal-migrate --region=europe-west1 --wait
```

### Running Seeders in Production

Seeders do NOT run automatically. To seed data manually:

```bash
# Option 1: Via Cloud SQL Console (for simple INSERT statements)
# Navigate to: https://console.cloud.google.com/sql/instances/cmw/overview?project=cmw-portal
# Go to SQL Studio, select 'production' database, and run INSERT statements

# Option 2: Create a seeder job (one-time setup)
gcloud run jobs create portal-seed-amenities \
  --image=gcr.io/cmw-portal/production:latest \
  --region=europe-west1 \
  --command=node \
  --args="ace,db:seed,--files=database/seeders/amenity_type_seeder.ts" \
  --set-cloudsql-instances=cmw-portal:europe-west1:cmw \
  --set-secrets="APP_KEY=APP_KEY:latest,DB_PASSWORD=DB_PASSWORD:latest" \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,DB_HOST=/cloudsql/cmw-portal:europe-west1:cmw,DB_PORT=5432,DB_USER=postgres,DB_DATABASE=production"

# Then execute it
gcloud run jobs execute portal-seed-amenities --region=europe-west1 --wait
```

### Troubleshooting Migration Issues

**Migration job failed:**

- Check job execution logs: https://console.cloud.google.com/run/jobs/europe-west1/portal-migrate?project=cmw-portal
- Verify the job is using the latest image (should update automatically from `cloudbuild.yaml`)

**Need to verify migration status:**

```bash
# Connect to production database
gcloud sql connect cmw --user=postgres --database=production --project=cmw-portal

# Check migration history
SELECT * FROM adonis_schema ORDER BY id DESC LIMIT 10;
```

**Manual schema changes (emergency only):**
If migrations fail and you need to manually alter the database:

```bash
# Use Cloud Console SQL Studio with admin privileges
# https://console.cloud.google.com/sql/instances/cmw/overview?project=cmw-portal
# Click "SQL Studio" → Select "production" database → Run SQL commands
```

## 13. Quick Reference

**Common queries:**

- Find properties by church: `Property.query().where('church_id', churchId)`
- Eager load relations: `.preload('church').preload('territory')`
- Transactions: Use Japa's `test.setup(() => db.beginTransaction())`

**Debugging:**

- Check `tests/api.rest` for HTTP request examples
- Inspect `start/routes.ts` for route-middleware mapping
- Use `npm run typecheck` to catch TypeScript errors without building

**Related docs:**

- Deployment: `DEPLOYMENT.md`, `DIGITALOCEAN_SYDNEY_DEPLOYMENT.md`
- Feature specs: `docs/MAP_DRAWING_AND_ROUTING.md`, `GCS_INTEGRATION.md`
- Database: `docs/DB_SETUP.md`, `docs/PROD_DB_BACKUP.md`
