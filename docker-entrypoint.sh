#!/bin/sh
set -e

echo "🚀 Starting Family Finance Planner..."
echo "📦 Running database migrations..."

# Run Prisma migrations using the local installed version (not npx latest)
node_modules/.bin/prisma db push --accept-data-loss

echo "✅ Database ready!"
echo "🌐 Starting Next.js server..."

# Start the Next.js server
exec node server.js
