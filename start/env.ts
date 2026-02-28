/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  APP_URL: Env.schema.string.optional(),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  /*
  |----------------------------------------------------------
  | Variables for configuring Geocode API
  |----------------------------------------------------------
  */
  GEOCODE_API_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Zyla API
  |----------------------------------------------------------
  */
  ZYLA_API_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Google Maps API
  |----------------------------------------------------------
  */
  GOOGLE_MAPS_API_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Google Cloud Storage
  |----------------------------------------------------------
  */
  GCP_PROJECT_ID: Env.schema.string.optional(),
  GCS_BUCKET_NAME: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  MAIL_FROM_ADDRESS: Env.schema.string.optional(),
  MAIL_FROM_NAME: Env.schema.string.optional(),
  ADMIN_EMAIL: Env.schema.string(),
})
