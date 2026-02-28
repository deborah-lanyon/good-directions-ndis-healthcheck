# Verify Production Schema Script
# Run this to check if production database already has the correct schema

Write-Host "=== Production Schema Verification ===" -ForegroundColor Cyan
Write-Host ""

# You'll need to set these environment variables or replace with your production DB credentials
$DB_HOST = $env:PROD_DB_HOST
$DB_PORT = $env:PROD_DB_PORT
$DB_NAME = $env:PROD_DB_NAME
$DB_USER = $env:PROD_DB_USER

if (-not $DB_HOST) {
    Write-Host "ERROR: Production database credentials not set!" -ForegroundColor Red
    Write-Host "Please set these environment variables:" -ForegroundColor Yellow
    Write-Host "  PROD_DB_HOST" -ForegroundColor Yellow
    Write-Host "  PROD_DB_PORT" -ForegroundColor Yellow
    Write-Host "  PROD_DB_NAME" -ForegroundColor Yellow
    Write-Host "  PROD_DB_USER" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or edit this script to hardcode the values temporarily." -ForegroundColor Yellow
    exit 1
}

Write-Host "Connecting to: $DB_HOST:$DB_PORT/$DB_NAME" -ForegroundColor Gray
Write-Host ""

# Prompt for password securely
$SecurePassword = Read-Host "Enter production database password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Checking schema..." -ForegroundColor Yellow
Write-Host ""

# Check 1: street_groups has church_id
Write-Host "1. Checking street_groups.church_id column..." -ForegroundColor Cyan
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'street_groups' AND column_name = 'church_id');"
if ($result -match "t") {
    Write-Host "   ✓ church_id column exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ church_id column MISSING - migration needs to run!" -ForegroundColor Red
}

# Check 2: street_groups does NOT have territory_id
Write-Host "2. Checking street_groups.territory_id column (should NOT exist)..." -ForegroundColor Cyan
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'street_groups' AND column_name = 'territory_id');"
if ($result -match "f") {
    Write-Host "   ✓ territory_id column does not exist (correct)" -ForegroundColor Green
} else {
    Write-Host "   ✗ territory_id column still EXISTS - migration needs to run!" -ForegroundColor Red
}

# Check 3: territories table should not exist
Write-Host "3. Checking territories table (should NOT exist)..." -ForegroundColor Cyan
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'territories');"
if ($result -match "f") {
    Write-Host "   ✓ territories table does not exist (correct)" -ForegroundColor Green
} else {
    Write-Host "   ✗ territories table still EXISTS - migration needs to run!" -ForegroundColor Red
}

# Check 4: visitor_groups table should not exist
Write-Host "4. Checking visitor_groups table (should NOT exist)..." -ForegroundColor Cyan
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visitor_groups');"
if ($result -match "f") {
    Write-Host "   ✓ visitor_groups table does not exist (correct)" -ForegroundColor Green
} else {
    Write-Host "   ✗ visitor_groups table still EXISTS - migration needs to run!" -ForegroundColor Red
}

# Check 5: Migration record
Write-Host "5. Checking if migration is marked as complete..." -ForegroundColor Cyan
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT 1 FROM adonis_schema WHERE name LIKE '%simplify_schema%');"
if ($result -match "t") {
    Write-Host "   ✓ Migration is marked as complete" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Migration NOT marked as complete - run mark-migration-complete-production.sql" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "If all checks show ✓ (green), production schema is ready and migration should be marked as complete."
Write-Host "If any checks show ✗ (red), DO NOT deploy - contact support."
Write-Host ""

# Clear password from environment
Remove-Item Env:\PGPASSWORD
