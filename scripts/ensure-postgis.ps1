<#
Ensures PostGIS extension exists in the local dev Postgres container and runs migrations.

Usage:
  .\scripts\ensure-postgis.ps1
  .\scripts\ensure-postgis.ps1 -ContainerName my-postgres

This script will:
 - Load DB settings from .env (if present) to detect `DB_USER` and `DB_DATABASE`.
 - Try to run `CREATE EXTENSION IF NOT EXISTS postgis` as the `postgres` superuser.
 - If that fails, try as the configured `DB_USER` (sometimes the initial superuser).
 - If both fail, print an actionable error and exit.
 - If extension is ensured, run `node ace migration:run` to apply migrations.
#>

param(
  [string]$ContainerName = 'welcomers-postgres'
)

function Load-DotEnv {
  param([string]$Path = '.env')
  if (Test-Path $Path) {
    Get-Content $Path | ForEach-Object {
      if ($_ -and ($_ -notmatch '^\s*#')) {
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
          $k = $parts[0].Trim()
          $v = $parts[1].Trim()
          if (-not [string]::IsNullOrEmpty($k) -and -not [string]::IsNullOrEmpty($v)) {
            Set-Item -Path Env:\$k -Value $v
          }
        }
      }
    }
  }
}

Write-Host "Loading .env (if present) to detect DB settings..."
Load-DotEnv

$DB = $env:DB_DATABASE; if (-not $DB) { $DB = 'welcomers_dev' }
$DB_USER = $env:DB_USER; if (-not $DB_USER) { $DB_USER = 'welcomers_user' }

Write-Host "Using container: $ContainerName" -ForegroundColor Cyan
Write-Host "Database: $DB | DB user: $DB_USER`n"

Write-Host "Attempting to create PostGIS extension as 'postgres' (superuser)..."
$out = & docker exec -i $ContainerName psql -U postgres -d $DB -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Failed running as 'postgres':"
  Write-Host $out
  Write-Host "Attempting to create extension as '$DB_USER'..."
  $out2 = & docker exec -i $ContainerName psql -U $DB_USER -d $DB -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create PostGIS extension as both 'postgres' and '$DB_USER'."
    Write-Host "Output (postgres):"; Write-Host $out
    Write-Host "Output ($DB_USER):"; Write-Host $out2
    Write-Host "
Please run the following command as a DB superuser inside the container, then re-run this script:"
    Write-Host "docker exec -it $ContainerName psql -U postgres -d $DB -c \"CREATE EXTENSION postgis;\""
    exit 1
  } else {
    Write-Host "PostGIS extension created (or already exists) as $DB_USER." -ForegroundColor Green
  }
} else {
  Write-Host "PostGIS extension created (or already exists) as postgres." -ForegroundColor Green
}

Write-Host "Running Adonis migrations..." -ForegroundColor Cyan
& node ace migration:run
if ($LASTEXITCODE -ne 0) {
  Write-Error "Migrations failed. See output above for details."
  exit $LASTEXITCODE
}

Write-Host "Done. PostGIS ensured and migrations applied." -ForegroundColor Green
