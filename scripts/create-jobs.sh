#!/bin/bash

# Script to create Cloud Run jobs for migrations and seeder
# Run this in Google Cloud Shell

echo "========================================="
echo "Creating Cloud Run Jobs"
echo "========================================="
echo ""

# Use specific commit SHA since 'latest' tag isn't available yet
IMAGE="gcr.io/gd-ndis-healthcheck/production:fbcb581c68c5ea48f0b001c6fa69553f9d3f98cf"

echo "Step 1: Creating migration-runner job..."
gcloud run jobs create migration-runner \
  --image=$IMAGE \
  --region=australia-southeast1 \
  --command=node \
  --args="ace,migration:run,--force" \
  --set-cloudsql-instances=gd-ndis-healthcheck:australia-southeast1:cmw \
  --set-secrets="APP_KEY=APP_KEY:latest,DB_PASSWORD=DB_PASSWORD:latest" \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,LOG_LEVEL=info,SESSION_DRIVER=cookie,DB_HOST=/cloudsql/gd-ndis-healthcheck:australia-southeast1:cmw,DB_PORT=5432,DB_USER=postgres,DB_DATABASE=production" \
  --max-retries=0 \
  --task-timeout=300

if [ $? -eq 0 ]; then
    echo "✓ migration-runner job created successfully"
else
    echo "✗ Failed to create migration-runner job"
    exit 1
fi
echo ""

echo "Step 2: Creating seed-amenity-types job..."
gcloud run jobs create seed-amenity-types \
  --image=$IMAGE \
  --region=australia-southeast1 \
  --command=node \
  --args="ace,db:seed,--files=database/seeders/amenity_type_seeder.ts" \
  --set-cloudsql-instances=gd-ndis-healthcheck:australia-southeast1:cmw \
  --set-secrets="APP_KEY=APP_KEY:latest,DB_PASSWORD=DB_PASSWORD:latest" \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,LOG_LEVEL=info,SESSION_DRIVER=cookie,DB_HOST=/cloudsql/gd-ndis-healthcheck:australia-southeast1:cmw,DB_PORT=5432,DB_USER=postgres,DB_DATABASE=production" \
  --max-retries=0 \
  --task-timeout=300

if [ $? -eq 0 ]; then
    echo "✓ seed-amenity-types job created successfully"
else
    echo "✗ Failed to create seed-amenity-types job"
    exit 1
fi
echo ""

echo "========================================="
echo "Jobs created successfully!"
echo "========================================="
echo ""
echo "Next: Run ./run-jobs.sh to execute migrations and seeder"
