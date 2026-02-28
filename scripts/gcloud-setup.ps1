# Quick gcloud setup script
# This adds gcloud to your PATH for the current session

$gcloudPath = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

if (Test-Path $gcloudPath) {
    Write-Host "✅ Found gcloud installation" -ForegroundColor Green
    $env:Path = "$gcloudPath;$env:Path"
    Write-Host "✅ Added gcloud to PATH for this session" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use gcloud commands. Try:" -ForegroundColor Cyan
    Write-Host "  gcloud version" -ForegroundColor White
    Write-Host "  gcloud auth login" -ForegroundColor White
    Write-Host "  gcloud config set project cmw-portal" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ gcloud not found at: $gcloudPath" -ForegroundColor Red
    Write-Host "Please install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
}
