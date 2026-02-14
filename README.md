# ETL Dashboard

A full-stack ETL Dashboard application with React + Vite frontend, Express backend, PostgreSQL database, and Redis caching.

## Quick Start

### Development

**Option 1: Using pnpm scripts**
```bash
pnpm run dev
```

**Option 2: Using shell script**
```bash
./dev.sh
```

This will start:
- Docker containers (PostgreSQL + Redis)
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Production

**Option 1: Using pnpm scripts**
```bash
pnpm run build
pnpm run start:prod
```

**Option 2: Using shell script**
```bash
./prod.sh
```

This will:
- Build frontend and backend
- Start Docker containers
- Run production servers

### Stop All Services

```bash
./stop.sh
```

or

```bash
pnpm run docker:down
```

## Available Scripts

### Root Level

- `pnpm run dev` - Start all services in development mode
- `pnpm run dev:docker` - Start Docker containers (foreground)
- `pnpm run dev:server` - Start backend dev server only
- `pnpm run dev:client` - Start frontend dev server only
- `pnpm run docker:up` - Start Docker containers (background)
- `pnpm run docker:down` - Stop Docker containers
- `pnpm run docker:logs` - View Docker logs
- `pnpm run build` - Build frontend and backend
- `pnpm run build:client` - Build frontend only
- `pnpm run build:server` - Build backend only
- `pnpm run start:prod` - Start production servers
- `pnpm run start:server` - Start backend production server
- `pnpm run start:client` - Start frontend preview server
- `pnpm run clean` - Clean all build artifacts and node_modules

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (server/.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etl_dashboard
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6380
```

## Services

- **Frontend**: http://localhost:5173 (dev) / http://localhost:4173 (prod)
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6380

## API Endpoints

- `GET /api/sales/platforms` - Get distinct platforms (cached 3 days)
- `GET /api/sales/months` - Get distinct months (cached 3 days)
- `GET /api/sales/regions` - Get distinct regions (cached 3 days)
- `GET /api/sales/aggregated?platform=X&sale_month=Y&region=Z` - Get aggregated sales data

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Router

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (pg)
- Redis

### Infrastructure
- Docker Compose
- PostgreSQL 15
- Redis 7

## Project Structure

```
etl_dashboard/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── config/            # Configuration files
│   └── lib/               # Utilities
├── server/                # Backend source
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── config/        # Database & Redis config
│   │   └── types/         # TypeScript types
│   └── init.sql          # Database initialization
├── docker-compose.yml     # Docker services
├── dev.sh                # Development startup script
├── prod.sh               # Production startup script
└── stop.sh               # Stop all services script
```

## Development Workflow

1. Clone the repository
2. Copy `.env.example` to `.env` in both root and server directories
3. Update environment variables
4. Run `pnpm install` in root and `cd server && pnpm install`
5. Start development: `pnpm run dev` or `./dev.sh`

## Login

Default login page accepts any email and password for demonstration purposes.
# Get all sales
curl http://localhost:3000/api/sales

# Filter by region
curl http://localhost:3000/api/sales?region=North%20America

# Get statistics
curl http://localhost:3000/api/sales/stats

# Get sales by region
curl http://localhost:3000/api/sales/by-region

# Clear cache
curl -X POST http://localhost:3000/api/sales/cache/clear
```

## Database Schema

### global_sales_master

| Column | Type | Description |
|--------|------|-------------|
| item_id | VARCHAR(255) | Item identifier (PK) |
| master_code | INT | Master code (PK) |
| master_name | VARCHAR(255) | Product name |
| region | TEXT | Sales region |
| gmv | NUMERIC | Gross merchandise value |
| quantity | FLOAT8 | Quantity sold |
| sale_month | VARCHAR(50) | Sale month |
| platform | VARCHAR(255) | Sales platform |

## Environment Variables

Backend `.env` file:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etl_dashboard
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
```

## Docker Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## Development

### Backend Development
```bash
cd server
pnpm dev          # Start with hot reload
pnpm build        # Build for production
pnpm start        # Run production build
```

### Frontend Development
```bash
pnpm run dev      # Start dev server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
```

## Features

- ✅ RESTful API with Express
- ✅ PostgreSQL database with sample data
- ✅ Redis caching (custom port 6380)
- ✅ Docker Compose setup
- ✅ TypeScript for type safety
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Query filtering
- ✅ Statistics aggregation
- ✅ Cache management

## License

ISC
```
