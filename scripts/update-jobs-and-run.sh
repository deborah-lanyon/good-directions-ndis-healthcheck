#!/bin/bash

# Script to update Cloud Run jobs and execute migrations/seeder
# Run this in Google Cloud Shell after the build completes

echo "========================================="
echo "Cloud Run Jobs Update & Execution Script"
echo "========================================="
echo ""

# Step 1: Check if build completed
echo "Step 1: Checking recent build status..."
gcloud builds list --limit=1
echo ""
read -p "Is the build status 'SUCCESS'? (y/n): " BUILD_SUCCESS

if [ "$BUILD_SUCCESS" != "y" ]; then
    echo "Please wait for the build to complete, then run this script again."
    exit 1
fi

# Step 2: Verify latest image exists
echo ""
echo "Step 2: Verifying 'latest' image exists..."
gcloud container images list-tags gcr.io/cmw-portal/production --limit=3
echo ""

# Step 3: Update migration-runner job
echo "Step 3: Updating migration-runner job to use 'latest' image..."
gcloud run jobs update migration-runner \
  --image=gcr.io/cmw-portal/production:latest \
  --region=europe-west1

if [ $? -eq 0 ]; then
    echo "✓ migration-runner job updated successfully"
else
    echo "✗ Failed to update migration-runner job"
    exit 1
fi
echo ""

# Step 4: Update seed-amenity-types job
echo "Step 4: Updating seed-amenity-types job to use 'latest' image..."
gcloud run jobs update seed-amenity-types \
  --image=gcr.io/cmw-portal/production:latest \
  --region=europe-west1

if [ $? -eq 0 ]; then
    echo "✓ seed-amenity-types job updated successfully"
else
    echo "✗ Failed to update seed-amenity-types job"
    exit 1
fi
echo ""

# Step 5: Execute migration-runner job
echo "Step 5: Executing migration-runner job..."
echo "This will run all pending migrations including subcategory column addition..."
gcloud run jobs execute migration-runner --region=europe-west1 --wait

if [ $? -eq 0 ]; then
    echo "✓ Migrations completed successfully"
else
    echo "✗ Migration job failed - check logs above"
    exit 1
fi
echo ""

# Step 6: Execute seed-amenity-types job
echo "Step 6: Executing seed-amenity-types job..."
echo "This will populate the database with 36 subcategories across 9 categories..."
gcloud run jobs execute seed-amenity-types --region=europe-west1 --wait

if [ $? -eq 0 ]; then
    echo "✓ Seeder completed successfully"
else
    echo "✗ Seeder job failed - check logs above"
    exit 1
fi
echo ""

# Step 7: Verify data
echo "========================================="
echo "All jobs completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Visit your production site and check the amenities dropdown"
echo "2. Verify subcategories are showing (should see 9 categories with subcategories)"
echo "3. Test generating a Welcome Pack to ensure subcategories display correctly"
echo ""
echo "To verify in the database, run:"
echo "  SELECT name, subcategory, COUNT(*) as count"
echo "  FROM amenity_types"
echo "  GROUP BY name, subcategory"
echo "  ORDER BY name, subcategory;"
