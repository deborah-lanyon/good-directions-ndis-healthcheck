<#
PowerShell helper to create a PostgreSQL logical backup.

Usage examples:
  # Local DB (pg_dump on PATH)
  $env:PG_HOST='127.0.0.1'; $env:PG_PORT='5432'; $env:PG_USER='postgres'; $env:PG_PASSWORD='secret'; $env:PG_DB='mydb'; powershell -File scripts/backup_prod_db.ps1

  # Docker-based DB (exec into container)
  $env:BACKUP_MODE='docker'; $env:DB_CONTAINER_NAME='welcomers-postgres'; $env:PG_USER='postgres'; $env:PG_DB='welcomers_prod'; powershell -File scripts/backup_prod_db.ps1

Environment variables used:
  PG_HOST         - Postgres host (default: 127.0.0.1)
  PG_PORT         - Postgres port (default: 5432)
  PG_USER         - DB user (required for non-docker mode)
  PG_PASSWORD     - DB password (optional; recommended to supply via env or secret manager)
  PG_DB           - Database name (required)
  BACKUP_DIR      - Directory to write backups (default: ./backups)
  BACKUP_MODE     - 'docker' to exec into container, otherwise run local pg_dump
  DB_CONTAINER_NAME - Docker container name if using docker mode (default: welcomers-postgres)
  PG_DUMP_PATH    - Optional full path to pg_dump executable
#>

param()

function Write-Log($msg) { Write-Host "[backup] $msg" }

$PG_HOST = $env:PG_HOST  -or '127.0.0.1'
$PG_PORT = $env:PG_PORT  -or '5432'
$PG_USER = $env:PG_USER
$PG_PASSWORD = $env:PG_PASSWORD
$PG_DB   = $env:PG_DB
$BACKUP_DIR = $env:BACKUP_DIR -or (Join-Path -Path (Get-Location) -ChildPath 'backups')
$BACKUP_MODE = $env:BACKUP_MODE
$DB_CONTAINER_NAME = $env:DB_CONTAINER_NAME -or 'welcomers-postgres'
$PG_DUMP_PATH = $env:PG_DUMP_PATH -or 'pg_dump'

if (-not $PG_DB) {
  Write-Error 'PG_DB environment variable is required. Set PG_DB to the production DB name.'
  exit 2
}

New-Item -Path $BACKUP_DIR -ItemType Directory -Force | Out-Null
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$filename = Join-Path $BACKUP_DIR "$($PG_DB)_$timestamp.dump"

try {
  if ($BACKUP_MODE -eq 'docker') {
    Write-Log "Running pg_dump inside container '$DB_CONTAINER_NAME' -> $filename"
    # Run pg_dump inside container as postgres user; output to stdout and capture to host file
    $cmd = "docker exec -i $DB_CONTAINER_NAME pg_dump -U $PG_USER -F c -b -v $PG_DB"
    Write-Log "Executing: $cmd"
    $proc = Start-Process -FilePath 'powershell' -ArgumentList "-Command \"$cmd | Out-File -Encoding Byte -FilePath '$filename'\"" -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) { throw "docker exec pg_dump failed with exit code $($proc.ExitCode)" }
  } else {
    if (-not $PG_USER) { Write-Error 'PG_USER is required for local pg_dump mode.'; exit 2 }
    Write-Log "Running local pg_dump -> $filename"
    if ($PG_PASSWORD) { $env:PGPASSWORD = $PG_PASSWORD }
    $pgDumpCmd = "$PG_DUMP_PATH -h $PG_HOST -p $PG_PORT -U $PG_USER -F c -b -v -f `"$filename`" $PG_DB"
    Write-Log "Executing: $pgDumpCmd"
    $exit = cmd /c $pgDumpCmd
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }
  }

  Write-Log "Backup complete: $filename"
  Write-Log "Consider moving this file to secure long-term storage (GCS, S3, Azure Blob) and verify the restore process."
} catch {
  Write-Error "Backup failed: $_"
  exit 1
}
