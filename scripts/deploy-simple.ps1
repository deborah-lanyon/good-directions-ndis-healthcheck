# Simple Deployment Script for Good Directions NDIS Healthcheck V2
# Run this to deploy to Google Cloud Run

Write-Host "🚀 Good Directions NDIS Healthcheck V2 - Simple Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Add gcloud to PATH
$gcloudPath = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"
if (Test-Path $gcloudPath) {
    $env:Path = "$gcloudPath;$env:Path"
}

# Check if gcloud is available
try {
    $version = gcloud version 2>&1 | Select-Object -First 1
    Write-Host "✅ Found: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ gcloud not found. Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "This will deploy your app to a NEW Cloud Run service called 'welcomers-portal-v2'" -ForegroundColor Yellow
Write-Host "Your existing production app will continue running unchanged." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Building application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Deploying to Cloud Run..." -ForegroundColor Cyan
Write-Host "(This will take 5-10 minutes...)" -ForegroundColor Yellow
Write-Host ""

gcloud run deploy welcomers-portal-v2 `
    --source . `
    --region australia-southeast1 `
    --platform managed `
    --allow-unauthenticated `
    --project cmw-portal

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure environment variables in Cloud Console" -ForegroundColor White
    Write-Host "2. Get your service URL:" -ForegroundColor White
    Write-Host "   gcloud run services describe welcomers-portal-v2 --region australia-southeast1 --format='value(status.url)'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Console: https://console.cloud.google.com/run?project=cmw-portal" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    exit 1
}
