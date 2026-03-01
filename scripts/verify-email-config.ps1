# Email Configuration Verification Script
# Checks that all required email environment variables are properly configured

Write-Host "`n=== Email Configuration Verification ===" -ForegroundColor Cyan
Write-Host "Checking environment variables for email functionality...`n" -ForegroundColor Gray

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "   Please create a .env file based on .env.example" -ForegroundColor Yellow
    exit 1
}

# Function to check environment variable
function Test-EnvVar {
    param(
        [string]$VarName,
        [bool]$Required = $true,
        [string]$Description = ""
    )
    
    $value = Get-Content .env | Select-String "^$VarName=" | ForEach-Object { 
        ($_ -replace "$VarName=", "").Trim() 
    }
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($Required) {
            Write-Host "❌ $VarName" -ForegroundColor Red -NoNewline
            Write-Host " - MISSING (Required)" -ForegroundColor Red
            if ($Description) {
                Write-Host "   $Description" -ForegroundColor Gray
            }
            return $false
        } else {
            Write-Host "⚠️  $VarName" -ForegroundColor Yellow -NoNewline
            Write-Host " - Not set (Optional, will use default)" -ForegroundColor Yellow
            if ($Description) {
                Write-Host "   $Description" -ForegroundColor Gray
            }
            return $true
        }
    } else {
        # Mask sensitive values
        $displayValue = $value
        if ($VarName -match "PASSWORD|KEY|SECRET") {
            $displayValue = "***" + $value.Substring([Math]::Max(0, $value.Length - 4))
        }
        
        Write-Host "✅ $VarName" -ForegroundColor Green -NoNewline
        Write-Host " = $displayValue" -ForegroundColor Gray
        if ($Description) {
            Write-Host "   $Description" -ForegroundColor Gray
        }
        return $true
    }
}

Write-Host "SMTP Configuration:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$allValid = $true

# Required variables
$allValid = (Test-EnvVar "SMTP_HOST" $true "SMTP server hostname (e.g., smtp.sendgrid.net)") -and $allValid
$allValid = (Test-EnvVar "SMTP_PORT" $true "SMTP port (587 for TLS, 465 for SSL)") -and $allValid
$allValid = (Test-EnvVar "ADMIN_EMAIL" $true "Email address for admin notifications") -and $allValid

# Check SMTP authentication
$smtpUsername = Get-Content .env | Select-String "^SMTP_USERNAME=" | ForEach-Object { 
    ($_ -replace "SMTP_USERNAME=", "").Trim() 
}

if ([string]::IsNullOrWhiteSpace($smtpUsername) -or $smtpUsername -eq "null") {
    Write-Host "⚠️  SMTP_USERNAME - Not configured (Some SMTP servers may not require authentication)" -ForegroundColor Yellow
    Write-Host "⚠️  SMTP_PASSWORD - Skipped (no username configured)" -ForegroundColor Yellow
} else {
    $allValid = (Test-EnvVar "SMTP_USERNAME" $true "SMTP authentication username") -and $allValid
    $allValid = (Test-EnvVar "SMTP_PASSWORD" $true "SMTP authentication password") -and $allValid
}

Write-Host "`nEmail Sender Configuration:" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Gray

# Optional variables with defaults
Test-EnvVar "MAIL_FROM_ADDRESS" $false "Defaults to: noreply@gooddirections.com.au"
Test-EnvVar "MAIL_FROM_NAME" $false "Defaults to: Good Directions NDIS Healthcheck"

Write-Host "`n=== Summary ===" -ForegroundColor Cyan

if ($allValid) {
    Write-Host "✅ All required email configuration variables are set!" -ForegroundColor Green
    Write-Host "`nYou can test email delivery by running:" -ForegroundColor Gray
    Write-Host "   node ace test:email" -ForegroundColor White
} else {
    Write-Host "❌ Some required variables are missing!" -ForegroundColor Red
    Write-Host "`nPlease update your .env file with the missing values." -ForegroundColor Yellow
    Write-Host "Refer to .env.example or ops/cloud-run-env-setup.md for guidance." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
