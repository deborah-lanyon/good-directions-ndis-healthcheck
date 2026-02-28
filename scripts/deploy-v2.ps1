# Deploy Welcomers Portal V2 to Google Cloud Run
# This script deploys a new version alongside the existing production app

Write-Host "🚀 Welcomers Portal V2 Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ID = "cmw-portal"
$REGION = "australia-southeast1"
$SERVICE_NAME = "welcomers-portal-v2"

# Step 0: Add gcloud to PATH if needed
$gcloudPath = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"
if (Test-Path $gcloudPath) {
    $env:Path = "$gcloudPath;$env:Path"
    Write-Host "✅ Added gcloud to PATH" -ForegroundColor Green
}

# Step 1: Verify gcloud is installed and authenticated
Write-Host "Step 1: Verifying gcloud setup..." -ForegroundColor Yellow
try {
    $gcloudVersion = gcloud version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ gcloud CLI not found. Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud CLI not found. Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    Write-Host "Looked in: $gcloudPath" -ForegroundColor Yellow
    exit 1
}

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
$currentAccount = gcloud config get-value account 2>$null
if ([string]::IsNullOrEmpty($currentAccount)) {
    Write-Host "❌ Not authenticated. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Authenticated as: $currentAccount" -ForegroundColor Green

# Set project
Write-Host "Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID 2>$null
Write-Host "✅ Project set to $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Step 2: Build the application
Write-Host "Step 2: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy to Cloud Run
Write-Host "Step 3: Deploying to Cloud Run..." -ForegroundColor Yellow
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create a NEW service separate from your existing production app." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying... (this may take several minutes)" -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME `
    --source . `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --project $PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Initial deployment completed!" -ForegroundColor Green
Write-Host ""

# Step 4: Get service URL
Write-Host "Step 4: Getting service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format="value(status.url)" 2>$null

if ([string]::IsNullOrEmpty($serviceUrl)) {
    Write-Host "⚠️  Could not retrieve service URL automatically." -ForegroundColor Yellow
    Write-Host "You can find it at: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Cyan
} else {
    Write-Host "✅ Service deployed at: $serviceUrl" -ForegroundColor Green
}
Write-Host ""

# Step 5: Configure environment variables
Write-Host "Step 5: Configuring environment variables..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to configure environment variables before the app will work!" -ForegroundColor Red
Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "1. Configure via Cloud Console (Recommended for first time)" -ForegroundColor White
Write-Host "2. Configure via gcloud CLI (Faster if you have secrets set up)" -ForegroundColor White
Write-Host "3. Skip for now (I'll do it manually later)" -ForegroundColor White
Write-Host ""

$envChoice = Read-Host "Enter your choice (1-3)"

switch ($envChoice) {
    "1" {
        Write-Host ""
        Write-Host "Opening Cloud Console..." -ForegroundColor Yellow
        $consoleUrl = "https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/revisions?project=$PROJECT_ID"
        Start-Process $consoleUrl
        Write-Host ""
        Write-Host "📋 Follow these steps in the console:" -ForegroundColor Cyan
        Write-Host "1. Click 'EDIT & DEPLOY NEW REVISION'" -ForegroundColor White
        Write-Host "2. Go to 'Variables & Secrets' tab" -ForegroundColor White
        Write-Host "3. Add the environment variables from ops/cloud-run-env-setup.md" -ForegroundColor White
        Write-Host "4. Reference secrets from Secret Manager for sensitive data" -ForegroundColor White
        Write-Host "5. Click 'DEPLOY'" -ForegroundColor White
    }
    "2" {
        Write-Host ""
        Write-Host "Configuring environment variables via gcloud..." -ForegroundColor Yellow
        Write-Host ""
        
        # Non-sensitive variables
        gcloud run services update $SERVICE_NAME `
            --region $REGION `
            --project $PROJECT_ID `
            --set-env-vars "NODE_ENV=production,HOST=0.0.0.0,LOG_LEVEL=info,SESSION_DRIVER=cookie,SYNC_WINDOW_DAYS=14,ADMIN_EMAIL=deborah@gooddirections.com.au,MAIL_FROM_ADDRESS=deborah@gooddirections.com.au,MAIL_FROM_NAME=Community Welcome Portal,SMTP_HOST=smtp.mailgun.org,SMTP_PORT=587,SMTP_USERNAME=postmaster@mg.communitywelcome.org.au,GEOCODE_API_KEY=68dfb0b059b1a855333485zed61bfc6"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Environment variables set" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  Now setting secrets... (make sure they exist in Secret Manager)" -ForegroundColor Yellow
            
            # Sensitive variables from Secret Manager
            gcloud run services update $SERVICE_NAME `
                --region $REGION `
                --project $PROJECT_ID `
                --update-secrets "APP_KEY=APP_KEY:latest,DB_HOST=DB_HOST:latest,DB_PORT=DB_PORT:latest,DB_USER=DB_USER:latest,DB_PASSWORD=DB_PASSWORD:latest,DB_DATABASE=DB_DATABASE:latest,SMTP_PASSWORD=SMTP_PASSWORD:latest,ZYLA_API_KEY=ZYLA_API_KEY:latest"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Secrets configured" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Some secrets may not exist in Secret Manager." -ForegroundColor Yellow
                Write-Host "You may need to create them first or configure manually via console." -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Failed to set environment variables" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host ""
        Write-Host "⚠️  Skipping environment variable configuration." -ForegroundColor Yellow
        Write-Host "Remember to configure them before using the app!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  Service Name: $SERVICE_NAME" -ForegroundColor White
Write-Host "  Region: $REGION" -ForegroundColor White
Write-Host "  Project: $PROJECT_ID" -ForegroundColor White
if (![string]::IsNullOrEmpty($serviceUrl)) {
    Write-Host "  URL: $serviceUrl" -ForegroundColor White
}
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure environment variables (if not done)" -ForegroundColor White
Write-Host "  2. Test the new version at the service URL" -ForegroundColor White
Write-Host "  3. Compare with your existing production app" -ForegroundColor White
Write-Host "  4. Once satisfied, you can direct your domain to the new service" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "  Cloud Run Console: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor White
Write-Host "  Service Logs: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/logs?project=$PROJECT_ID" -ForegroundColor White
Write-Host "  Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID" -ForegroundColor White
Write-Host ""
