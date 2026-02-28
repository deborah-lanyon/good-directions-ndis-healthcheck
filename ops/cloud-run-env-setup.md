# Cloud Run Environment Variables Setup

## Required Environment Variables for Cloud Run

These need to be configured in your Cloud Run service before deployment.

### Non-Sensitive Variables (Set via Cloud Run Console or gcloud)

```bash
# Application
NODE_ENV=production
HOST=0.0.0.0
PORT=8080
LOG_LEVEL=info
SESSION_DRIVER=cookie
SYNC_WINDOW_DAYS=14

# Email Configuration
ADMIN_EMAIL=deborah@gooddirections.com.au
MAIL_FROM_ADDRESS=deborah@gooddirections.com.au
MAIL_FROM_NAME=Community Welcome Portal
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@mg.communitywelcome.org.au

# Geocoding
GEOCODE_API_KEY=68dfb0b059b1a855333485zed61bfc6
```

### Sensitive Variables (Should be in Secret Manager)

These should be created as secrets in Google Cloud Secret Manager and referenced in Cloud Run:

1. **APP_KEY**: `iRUQ801cCjlSQeFCsIvcTkZsodtYaUMx`
2. **DB_HOST**: `gondola.proxy.rlwy.net` (or your Cloud SQL connection if migrating)
3. **DB_PORT**: `18555`
4. **DB_USER**: `postgres`
5. **DB_PASSWORD**: `eUujnyIVAGowSaHdKoxmKZBmiSOeYQxp`
6. **DB_DATABASE**: `railway`
7. **SMTP_PASSWORD**: Your Mailgun SMTP password (from Mailgun dashboard)
8. **ZYLA_API_KEY**: `10938|SC9rwpqbhFAykq8taP2r3IO03p02ZCi0DAjlQls2`

## Setup Instructions

### Option 1: Via Google Cloud Console (Easiest)

1. **Go to Cloud Run service**:
   - https://console.cloud.google.com/run?project=cmw-portal

2. **Edit the service**:
   - Click on your service name
   - Click "EDIT & DEPLOY NEW REVISION"

3. **Add Environment Variables**:
   - Go to "Variables & Secrets" tab
   - Add all non-sensitive variables from above

4. **Add Secrets**:
   - First create secrets in Secret Manager: https://console.cloud.google.com/security/secret-manager?project=cmw-portal
   - Then reference them as "Reference a secret" in the Variables tab

### Option 2: Via gcloud CLI (If you have it installed)

```bash
# Set the service name (replace with your actual service name)
SERVICE_NAME="your-service-name"
REGION="europe-west1"

# Update environment variables
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,PORT=8080,LOG_LEVEL=info,SESSION_DRIVER=cookie,SYNC_WINDOW_DAYS=14,ADMIN_EMAIL=deborah@gooddirections.com.au,MAIL_FROM_ADDRESS=deborah@gooddirections.com.au,MAIL_FROM_NAME=Community Welcome Portal,SMTP_HOST=smtp.mailgun.org,SMTP_PORT=587,SMTP_USERNAME=postmaster@mg.communitywelcome.org.au,GEOCODE_API_KEY=68dfb0b059b1a855333485zed61bfc6"
```

## Important Notes

- **PORT**: Cloud Run sets PORT=8080 automatically. AdonisJS will pick this up from the environment.
- **Database**: Currently pointing to Railway PostgreSQL (gondola.proxy.rlwy.net). This will continue to work, or you can migrate to Cloud SQL later.
- **APP_URL**: Will be automatically set based on your Cloud Run service URL.
- **Secrets**: Always use Secret Manager for sensitive data in production.

## Deployment Steps

### Option 1: Deploy via Cloud Build Trigger (Recommended)

1. **Navigate to Cloud Build Triggers**: https://console.cloud.google.com/cloud-build/triggers?project=cmw-portal
2. **Find the existing deployment trigger** (should already be configured from ops/cd.yaml)
3. **Click "RUN" button**
4. **Select branch**: `main` (contains all latest fixes)
5. **Click "RUN TRIGGER"**
6. **Monitor progress**: https://console.cloud.google.com/cloud-build/builds?project=cmw-portal
7. **Expected steps**:
   - Build Docker image
   - Push to Artifact Registry
   - Run database migrations (portal-migrate job)
   - Deploy to Cloud Run service
   - Send Slack notification
8. **Once complete**, verify deployment at your Cloud Run service URL

### Option 2: Deploy via gcloud CLI

```bash
# Trigger the Cloud Build
gcloud builds submit --config=ops/cd.yaml --project=cmw-portal

# Or deploy directly to Cloud Run
gcloud run deploy <service-name> \
  --source . \
  --region europe-west1 \
  --project cmw-portal \
  --allow-unauthenticated
```

## Post-Deployment Verification

After deployment completes, test the following:

1. **Check Service URL**: Get the Cloud Run service URL from Console
2. **Test Registration**:
   - Navigate to /home#register
   - Submit registration form (should complete in 1-2 seconds, not 30+)
3. **Verify Navigation**:
   - Check Register link is hidden when logged in
   - Check Dashboard link is hidden when logged out
4. **Test Error Handling**:
   - Try registering with duplicate email
   - Should show: "An account with this email already exists"
5. **Check Email Sending**:
   - Verify emails are sent from deborah@gooddirections.com.au
   - Should not timeout or hang
6. **Review Logs**:
   - Check Cloud Run logs: https://console.cloud.google.com/logs/query?project=cmw-portal
   - Look for any errors or warnings
7. **Test Property Sync**:
   - Trigger `GET /api/properties/sync` with `Authorization: Bearer <APP_KEY>` header

## Rollback (if needed)

Cloud Run maintains revision history for instant rollback:

1. **Navigate to Revisions**: https://console.cloud.google.com/run/detail/europe-west1/<service-name>/revisions?project=cmw-portal
2. **Find the previous working revision**
3. **Click "MANAGE TRAFFIC"**
4. **Set 100% traffic to the previous revision**
5. **Click "SAVE"**

The old revision is preserved and can be restored instantly without rebuild.

## Verification Commands

```bash
# Check environment variables are set
gcloud run services describe <service-name> --region=europe-west1 --project=cmw-portal --format="value(spec.template.spec.containers[0].env)"

# View recent logs
gcloud run services logs read <service-name> --region=europe-west1 --project=cmw-portal --limit=50

# Check current revision
gcloud run revisions list --service=<service-name> --region=europe-west1 --project=cmw-portal
```
