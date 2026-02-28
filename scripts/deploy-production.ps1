# Production Deployment Script for PowerShell
# Run this after deploying to ensure database is properly initialized

Write-Host "🚀 Running production deployment tasks..." -ForegroundColor Green

# Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
node ace migration:run --force

# Seed amenity types (idempotent - safe to run multiple times)
Write-Host "🌱 Seeding amenity types..." -ForegroundColor Cyan
node ace db:seed --files=database/seeders/amenity_type_seeder.ts

Write-Host "✅ Production deployment tasks completed!" -ForegroundColor Green
