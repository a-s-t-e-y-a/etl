#!/bin/bash

echo "🏗️  Building ETL Dashboard for Production..."

echo "📦 Installing dependencies..."
pnpm install
cd server && pnpm install && cd ..

echo "🔨 Building frontend..."
pnpm run build:client

echo "🔨 Building backend..."
pnpm run build:server

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "🚀 Starting production servers..."
pnpm run start:server &
pnpm run start:client

wait
