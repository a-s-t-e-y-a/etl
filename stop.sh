#!/bin/bash

echo "🛑 Stopping ETL Dashboard..."

echo "Stopping development servers..."
pkill -f "vite"
pkill -f "tsx"

echo "Stopping Docker containers..."
docker-compose down

echo "✅ All services stopped"
