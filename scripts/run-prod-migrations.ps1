# Run migrations against Cloud SQL production database
# This script temporarily updates .env to point to production, runs migrations, then restores original .env

Write-Host "Running migrations against production Cloud SQL database..." -ForegroundColor Green

# Backup current .env
Copy-Item .env .env.backup

# Create temporary .env with production database settings
$prodEnv = @"
NODE_ENV=production
APP_KEY=iRUQ801cCjlSQeFCsIvcTkZsodtYaUMx
HOST=0.0.0.0
APP_URL=https://production-410700363095.europe-west1.run.app
LOG_LEVEL=info

SESSION_DRIVER=cookie

# Production Database (Cloud SQL)
DB_HOST=34.140.32.121
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=$((Get-Content .env.backup | Select-String "DB_PASSWORD" | Out-String).Split("=")[1].Trim())
DB_DATABASE=production

GEOCODE_API_KEY=68dfb0b059b1a855333485zed61bfc6
ZYLA_API_KEY=10938|SC9rwpqbhFAykq8taP2r3IO03p02ZCi0DAjlQls2

SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@mg.communitywelcome.org
SMTP_PASSWORD=$((Get-Content .env.backup | Select-String "SMTP_PASSWORD" | Out-String).Split("=")[1].Trim())
ADMIN_EMAIL=admin@example.com

GCP_PROJECT_ID=cmw-portal
GCS_BUCKET_NAME=welcomers-portal-uploads
"@

Set-Content -Path .env -Value $prodEnv

Write-Host "Running migrations..." -ForegroundColor Yellow
node ace migration:run --force

$exitCode = $LASTEXITCODE

# Restore original .env
Move-Item -Force .env.backup .env

if ($exitCode -eq 0) {
    Write-Host "`nMigrations completed successfully!" -ForegroundColor Green
    Write-Host "Your production database is now set up." -ForegroundColor Green
} else {
    Write-Host "`nMigrations failed. Check the error above." -ForegroundColor Red
}

exit $exitCode
