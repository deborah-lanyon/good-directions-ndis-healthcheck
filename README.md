# Good Directions NDIS Healthcheck

A web application that helps organisations track nearby properties and coordinate welcome pack deliveries. The backend is built with AdonisJS 6 and PostgreSQL, and the frontend uses Inertia.js with Vue 3.

## Features

- Organisation self-service onboarding with admin approval
- Property ingestion via the Zyla CoreLogic aggregation API
- Radius based filtering using stored organisation profile settings
- Manual property status updates and delivery tracking
- Geocoding assistance for church profile configuration
- Email notifications for approvals, password resets, and property syncs

## Tech Stack

- Node.js 22 + TypeScript
- AdonisJS 6 with Lucid ORM
- PostgreSQL
- Inertia.js + Vue 3
- Tailwind CSS
- Japa test runner

## Prerequisites

- Node.js 22
- npm 10 or later
- PostgreSQL 13 or later

## Getting Started

1. Clone the repository and install dependencies.

   ```bash
   git clone <repository-url>
   cd welcomers-portal
   npm install
   ```

2. Create a database and seed credentials.

3. Copy and configure environment variables.

   ```bash
   cp .env.example .env
   ```

4. Build the project and run migrations.

   ```bash
   npm run build
   node ace migration:run
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

   The app runs on `http://localhost:3333` with Vite HMR for the Vue frontend.

## Available Scripts

- `npm run dev` – Start the HTTP server with hot reload
- `npm run build` – Compile TypeScript and bundle assets
- `npm start` – Serve the built application
- `npm run test` – Execute unit tests with Japa
- `npm run lint` – Run ESLint
- `npm run format` – Format the codebase with Prettier
- `npm run typecheck` – Type-check the project without emitting files

## Database Tasks

- `node ace migration:run` – Apply pending migrations
- `node ace migration:rollback` – Roll back the last migration batch
- `node ace migration:status` – Inspect migration history

## Environment Variables

| Key               | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `APP_KEY`         | Adonis encryption key generated with `node ace generate:key`             |
| `APP_NAME`        | Used by the logger (optional)                                            |
| `APP_URL`         | Public base URL for links in emails, defaults to `http://localhost:3333` |
| `HOST`            | HTTP host binding, defaults to `0.0.0.0`                                 |
| `PORT`            | HTTP port, defaults to `3333`                                            |
| `LOG_LEVEL`       | Pino log level                                                           |
| `SESSION_DRIVER`  | Session store driver, usually `memory` or `cookie`                       |
| `DB_HOST`         | PostgreSQL host                                                          |
| `DB_PORT`         | PostgreSQL port                                                          |
| `DB_USER`         | PostgreSQL user                                                          |
| `DB_PASSWORD`     | PostgreSQL password                                                      |
| `DB_DATABASE`     | PostgreSQL database name                                                 |
| `ADMIN_EMAIL`     | Address that receives new registration approval requests                 |
| `SMTP_HOST`       | Outbound SMTP host                                                       |
| `SMTP_PORT`       | Outbound SMTP port                                                       |
| `SMTP_USERNAME`   | SMTP username                                                            |
| `SMTP_PASSWORD`   | SMTP password                                                            |
| `ZYLA_API_KEY`    | API key for the Zyla property data service                               |
| `GEOCODE_API_KEY` | API key for the geocode.maps.co lookup service                           |

## Key Endpoints

| Method | Path                   | Description                                                            |
| ------ | ---------------------- | ---------------------------------------------------------------------- |
| `POST` | `/api/register`        | Accept user signup requests and create a pending church profile        |
| `POST` | `/api/login`           | Authenticate a user and start a session                                |
| `POST` | `/api/forgot-password` | Generate a forgot password token                                       |
| `POST` | `/api/reset-password`  | Reset a password using the supplied token                              |
| `GET`  | `/api/auth/check`      | Return the authenticated user record                                   |
| `PUT`  | `/properties/:id`      | Update property feedback status or visitor information (requires auth) |

Authenticated users access the dashboard, church profile editor, and geocoding helper via Inertia-powered routes. Property sync is triggered automatically on login (see Property Sync Workflow).

## Property Sync Workflow

Properties are synced automatically when a church account owner logs in:

1. **Login-triggered sync**: When a church admin logs in with their credentials, property sync runs automatically in the background. This happens on every login.

2. **No sync on impersonation**: When a super admin uses the "Login as" feature to impersonate a church account, sync does NOT trigger. This prevents unexpected data changes during admin support activities.

3. **What gets synced**:
   - **Sold properties**: Recent sales (last month) from the Zyla API, filtered by the church's postcode
   - **Rental properties**: Active listings are tracked. When a rental disappears from listings (indicating someone signed a lease), it becomes a "welcomeable" property

4. **Manual sync**: Church admins can also trigger a sync manually from their Church Profile page by clicking "Check for new properties"

5. **Notifications**: When new properties are created, email notifications are sent to the church owner and to any visitors assigned to those properties via street groups

### Property Types

- **Sold**: Properties that have been sold - these appear immediately in the property list
- **Rented**: Rental properties that have been delisted (leased) - only show up after they're taken off the rental market

## Testing

Run the unit test suite with:

```bash
npm run test
```

The suite uses an isolated transaction per test group and covers services for users, churches, properties, notifications, geocoding, and Zyla API integration logic.

## Deployment Notes

- Ensure migrations run before serving traffic.
- Provide production-grade credentials for PostgreSQL, SMTP, Zyla, and geocoding services.
- Property sync runs automatically on user login - no external scheduler needed.

## License

Private proprietary software. Redistribution is not permitted.
