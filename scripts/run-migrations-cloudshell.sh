#!/bin/bash
# Run this in Google Cloud Shell to execute migrations

# Set environment variables
export DB_HOST="34.140.32.121"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_PASSWORD="HfV@Rvq[TNA{z6TO"
export DB_DATABASE="production"
export NODE_ENV="production"
export APP_KEY="iRUQ801cCjlSQeFCsIvcTkZsodtYaUMx"

# Clone repo and run migrations
git clone https://github.com/deborah-lanyon/Community-Welcome-Project.git
cd Community-Welcome-Project
npm ci
node ace migration:run --force

echo "Migrations complete!"
