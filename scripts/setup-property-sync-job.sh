#!/bin/bash

# Script to create Cloud Run Job for daily property sync
# Run this in Google Cloud Shell

echo "========================================="
echo "Creating Cloud Run Job for Property Sync"
echo "========================================="
echo ""

# Use latest image tag
IMAGE="gcr.io/gd-ndis-healthcheck/production:latest"

echo "Creating daily-property-sync job..."
gcloud run jobs create daily-property-sync \
  --image=$IMAGE \
  --region=australia-southeast1 \
  --command=node \
  --args="ace,sync:properties" \
  --set-cloudsql-instances=gd-ndis-healthcheck:australia-southeast1:cmw \
  --set-secrets="APP_KEY=APP_KEY:latest,DB_PASSWORD=DB_PASSWORD:latest,ZYLA_API_KEY=ZYLA_API_KEY:latest,GEOCODE_API_KEY=GEOCODE_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,LOG_LEVEL=info,DB_HOST=/cloudsql/gd-ndis-healthcheck:australia-southeast1:cmw,DB_PORT=5432,DB_USER=postgres,DB_DATABASE=production" \
  --max-retries=1 \
  --task-timeout=1800

if [ $? -eq 0 ]; then
    echo "✓ daily-property-sync job created successfully"
else
    echo "✗ Failed to create daily-property-sync job"
    exit 1
fi
echo ""

echo "========================================="
echo "Job created successfully!"
echo "========================================="
echo ""
echo "Next step: Run ./setup-property-sync-scheduler.sh to schedule daily execution"
