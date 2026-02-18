#!/bin/sh
set -e

echo "🚀 Starting Family Finance Planner..."
echo "📦 Running database migrations..."

# Use the prisma binary copied from the builder stage (v5, not npx latest)
node node_modules/prisma/build/index.js db push --accept-data-loss

echo "✅ Database ready!"
echo "🌐 Starting Next.js server..."

exec node server.js