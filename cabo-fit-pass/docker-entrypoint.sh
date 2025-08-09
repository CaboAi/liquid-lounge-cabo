#!/bin/sh
set -e

# CaboFitPass Docker Entrypoint Script

echo "🚀 Starting CaboFitPass..."

# Wait for database to be ready (if using local PostgreSQL)
if [ -n "$DATABASE_URL" ] && [ "$NODE_ENV" = "production" ]; then
  echo "⏳ Waiting for database connection..."
  
  # Simple connection check
  until node -e "
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    client.connect().then(() => {
      console.log('✅ Database connected');
      client.end();
      process.exit(0);
    }).catch(() => process.exit(1));
  " 2>/dev/null; do
    echo "⏳ Database not ready, waiting..."
    sleep 2
  done
fi

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🗄️ Running database migrations..."
  npm run db:migrate
fi

# Start the application
echo "🌟 Starting Next.js server..."
exec node server.js