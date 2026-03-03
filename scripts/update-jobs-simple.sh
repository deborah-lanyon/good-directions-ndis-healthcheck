#!/bin/bash

# Simple script to update Cloud Run jobs and execute them
# Run this in Google Cloud Shell after verifying the build completed

echo "Updating Cloud Run jobs to use 'latest' image..."

# Update both jobs
gcloud run jobs update migration-runner \
  --image=gcr.io/gd-ndis-healthcheck/production:latest \
  --region=australia-southeast1

gcloud run jobs update seed-amenity-types \
  --image=gcr.io/gd-ndis-healthcheck/production:latest \
  --region=australia-southeast1

echo ""
echo "Executing migration-runner job..."
gcloud run jobs execute migration-runner --region=australia-southeast1 --wait

echo ""
echo "Executing seed-amenity-types job..."
gcloud run jobs execute seed-amenity-types --region=australia-southeast1 --wait

echo ""
echo "Done! Check your production site for subcategories."
