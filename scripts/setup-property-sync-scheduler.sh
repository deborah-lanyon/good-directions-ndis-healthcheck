#!/bin/bash

# Script to create Cloud Scheduler for daily property sync
# Run this in Google Cloud Shell AFTER creating the Cloud Run Job

echo "========================================="
echo "Creating Cloud Scheduler for Daily Property Sync"
echo "========================================="
echo ""

echo "Creating scheduler job to run daily at 2:00 AM Australia/Sydney..."
gcloud scheduler jobs create run daily-property-sync-trigger \
  --schedule="0 2 * * *" \
  --time-zone="Australia/Sydney" \
  --location=australia-southeast1 \
  --job=daily-property-sync \
  --region=australia-southeast1

if [ $? -eq 0 ]; then
    echo "✓ Cloud Scheduler created successfully"
else
    echo "✗ Failed to create Cloud Scheduler"
    exit 1
fi
echo ""

echo "========================================="
echo "Scheduler created successfully!"
echo "========================================="
echo ""
echo "Daily property sync will run at 2:00 AM Australia/Sydney timezone"
echo ""
echo "To test the sync manually, run:"
echo "  gcloud run jobs execute daily-property-sync --region=australia-southeast1 --wait"
echo ""
echo "To view scheduler jobs:"
echo "  gcloud scheduler jobs list --location=australia-southeast1"
echo ""
echo "To view job execution history:"
echo "  https://console.cloud.google.com/run/jobs/australia-southeast1/daily-property-sync?project=gd-ndis-healthcheck"
