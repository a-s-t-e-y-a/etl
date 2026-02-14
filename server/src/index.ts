import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import { connectRedis } from './config/redis';
import salesRoutes from './routes/salesRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Routes
app.use('/api/sales', salesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints:`);
      console.log(`   GET  /api/sales - Get all sales`);
      console.log(`   GET  /api/sales/stats - Get statistics`);
      console.log(`   GET  /api/sales/by-region - Get sales by region`);
      console.log(`   GET  /api/sales/:item_id - Get sale by ID`);
      console.log(`   POST /api/sales/cache/clear - Clear cache`);
      console.log(`   GET  /health - Health check`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
