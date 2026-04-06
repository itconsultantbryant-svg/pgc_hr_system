#!/bin/bash
# Post-deployment script for Render
# This script runs after deployment to set up the database

echo "Running post-deployment setup..."

# Generate Prisma Client (already done in postinstall, but ensure it's fresh)
npx prisma generate

# Push database schema
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Create admin user if it doesn't exist
echo "Creating admin user..."
npm run create-admin || echo "Admin user may already exist"

echo "Post-deployment setup complete!"
