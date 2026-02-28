#!/bin/bash

# Google Cloud Storage Setup Script
# This script creates a GCS bucket and configures Cloud Run for file uploads

set -e

# Configuration
PROJECT_ID="cmw-portal"
BUCKET_NAME="welcomers-portal-uploads"
REGION="europe-west1"
SERVICE_NAME="production"

echo "======================================"
echo "Google Cloud Storage Setup"
echo "======================================"
echo ""
echo "Project: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo "Cloud Run Service: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil is not installed"
    echo "Install gcloud SDK which includes gsutil"
    exit 1
fi

echo "1. Setting project..."
gcloud config set project $PROJECT_ID

echo ""
echo "2. Creating GCS bucket..."
if gsutil ls gs://$BUCKET_NAME &> /dev/null; then
    echo "✅ Bucket already exists: gs://$BUCKET_NAME"
else
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/
    echo "✅ Created bucket: gs://$BUCKET_NAME"
fi

echo ""
echo "3. Making bucket publicly readable..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/
echo "✅ Bucket is now publicly readable"

echo ""
echo "4. Enabling uniform bucket-level access..."
gsutil uniformbucketlevelaccess set on gs://$BUCKET_NAME/
echo "✅ Uniform bucket-level access enabled"

echo ""
echo "5. Getting service account for Cloud Run..."
SERVICE_ACCOUNT=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format='value(spec.template.spec.serviceAccountName)')

if [ -z "$SERVICE_ACCOUNT" ]; then
    echo "❌ Error: Could not get service account for Cloud Run service"
    echo "Make sure the service '$SERVICE_NAME' exists in region '$REGION'"
    exit 1
fi

echo "✅ Service account: $SERVICE_ACCOUNT"

echo ""
echo "6. Granting storage permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.objectAdmin" \
  --condition=None \
  > /dev/null 2>&1

echo "✅ Granted storage.objectAdmin role"

echo ""
echo "7. Updating Cloud Run environment variables..."
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --update-env-vars=GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=$BUCKET_NAME \
  --quiet

echo "✅ Environment variables updated"

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "GCS bucket: gs://$BUCKET_NAME"
echo "Public URL prefix: https://storage.googleapis.com/$BUCKET_NAME/"
echo ""
echo "Your application will now:"
echo "  • Upload files to GCS instead of local storage"
echo "  • Files will persist across deployments"
echo "  • Images will be publicly accessible via GCS URLs"
echo ""
echo "Next steps:"
echo "  1. Test uploading a church logo in the application"
echo "  2. Verify the file appears in GCS: gsutil ls gs://$BUCKET_NAME/"
echo "  3. Check that the public URL works in a browser"
echo ""
