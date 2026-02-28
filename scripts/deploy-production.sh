#!/bin/bash
# Production Deployment Script
# Run this after deploying to ensure database is properly initialized

echo "🚀 Running production deployment tasks..."

# Run migrations
echo "📦 Running database migrations..."
node ace migration:run --force

# Seed amenity types (idempotent - safe to run multiple times)
echo "🌱 Seeding amenity types..."
node ace db:seed --files=database/seeders/amenity_type_seeder.ts

echo "✅ Production deployment tasks completed!"
