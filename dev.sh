#!/bin/bash

echo "🚀 Starting ETL Dashboard Development Environment..."

echo "📦 Installing dependencies..."
pnpm install
cd server && pnpm install && cd ..

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "🔥 Starting development servers..."
pnpm run dev:server &
pnpm run dev:client

wait
