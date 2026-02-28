#!/bin/bash

# Script to execute Cloud Run jobs (migrations and seeder)
# Run this in Google Cloud Shell after create-jobs.sh

echo "========================================="
echo "Executing Cloud Run Jobs"
echo "========================================="
echo ""

echo "Step 1: Executing migration-runner job..."
echo "This will add the subcategory column and update constraints..."
gcloud run jobs execute migration-runner --region=europe-west1 --wait

if [ $? -eq 0 ]; then
    echo "✓ Migrations completed successfully"
else
    echo "✗ Migration job failed - check logs above"
    exit 1
fi
echo ""

echo "Step 2: Executing seed-amenity-types job..."
echo "This will populate 36 subcategories across 9 categories..."
gcloud run jobs execute seed-amenity-types --region=europe-west1 --wait

if [ $? -eq 0 ]; then
    echo "✓ Seeder completed successfully"
else
    echo "✗ Seeder job failed - check logs above"
    exit 1
fi
echo ""

echo "========================================="
echo "All jobs completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Visit your production site"
echo "2. Go to church profile page"
echo "3. Check the Local Amenities dropdown"
echo "4. Verify subcategories are showing (should see 9 categories with subcategories)"
echo "5. Test generating a Welcome Pack to ensure subcategories display correctly"
