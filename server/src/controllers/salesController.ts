import { Request, Response } from 'express';
import pool from '../config/database';
import redisClient from '../config/redis';

const DISTINCT_CACHE_TTL = 259200;

export const getDistinctPlatforms = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'distinct:platforms';
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }

    const result = await pool.query(
      'SELECT DISTINCT platform FROM global_sales_master ORDER BY platform'
    );

    const platforms = result.rows.map(row => row.platform);
    await redisClient.setEx(cacheKey, DISTINCT_CACHE_TTL, JSON.stringify(platforms));

    res.json({
      success: true,
      data: platforms,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platforms',
    });
  }
};

export const getDistinctMonths = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'distinct:months';
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }

    const result = await pool.query(
      'SELECT DISTINCT sale_month FROM global_sales_master ORDER BY sale_month'
    );

    const months = result.rows.map(row => row.sale_month);
    await redisClient.setEx(cacheKey, DISTINCT_CACHE_TTL, JSON.stringify(months));

    res.json({
      success: true,
      data: months,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch months',
    });
  }
};

export const getDistinctRegions = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'distinct:regions';
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }

    const result = await pool.query(
      'SELECT DISTINCT region FROM global_sales_master ORDER BY region'
    );

    const regions = result.rows.map(row => row.region);
    await redisClient.setEx(cacheKey, DISTINCT_CACHE_TTL, JSON.stringify(regions));

    res.json({
      success: true,
      data: regions,
      cached: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions',
    });
  }
};

export const getAggregatedData = async (req: Request, res: Response) => {
  try {
    const { platform, sale_month, region } = req.query;

    const groupByFields: string[] = [];
    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (platform) {
      groupByFields.push('platform');
      whereConditions.push(`platform = $${paramCount}`);
      values.push(platform);
      paramCount++;
    }

    if (sale_month) {
      groupByFields.push('sale_month');
      whereConditions.push(`sale_month = $${paramCount}`);
      values.push(sale_month);
      paramCount++;
    }

    if (region) {
      groupByFields.push('region');
      whereConditions.push(`region = $${paramCount}`);
      values.push(region);
      paramCount++;
    }

    let query = 'SELECT ';

    if (groupByFields.length > 0) {
      query += groupByFields.join(', ') + ', ';
    }

    query += 'SUM(gmv) as total_gmv, SUM(quantity) as total_quantity, COUNT(*) as record_count FROM global_sales_master';

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    if (groupByFields.length > 0) {
      query += ' GROUP BY ' + groupByFields.join(', ');
      query += ' ORDER BY ' + groupByFields.join(', ');
    }

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aggregated data',
    });
  }
};

export const getDetailedSalesData = async (req: Request, res: Response) => {
  try {
    const { platform, sale_month, region, page, limit } = req.query;

    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (platform) {
      whereConditions.push(`platform = $${paramCount}`);
      values.push(platform);
      paramCount++;
    } else {
      whereConditions.push(`platform = $${paramCount}`);
      values.push('Blinkit');
      paramCount++;
    }

    if (sale_month) {
      whereConditions.push(`sale_month = $${paramCount}`);
      values.push(sale_month);
      paramCount++;
    } else {
      whereConditions.push(`sale_month = $${paramCount}`);
      values.push('2025-01');
      paramCount++;
    }

    if (region) {
      whereConditions.push(`region = $${paramCount}`);
      values.push(region);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const pageNum = parseInt((page as string) || '1');
    const limitNum = parseInt((limit as string) || '10');
    const offset = (pageNum - 1) * limitNum;

    let dataQuery = `
      SELECT 
        platform,
        sale_month,
        region,
        master_code,
        master_name,
        SUM(quantity) as total_units,
        SUM(gmv) as total_gmv
      FROM global_sales_master
      ${whereClause}
      GROUP BY platform, sale_month, region, master_code, master_name
      ORDER BY sale_month ASC, total_gmv DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const dataResult = await pool.query(dataQuery, [...values, limitNum, offset]);

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT master_code, master_name
        FROM global_sales_master
        ${whereClause}
        GROUP BY platform, sale_month, region, master_code, master_name
      ) as grouped_records
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed sales data',
    });
  }
};

export const exportSalesData = async (req: Request, res: Response) => {
  try {
    const { platform, sale_month, region } = req.query;

    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (platform) {
      whereConditions.push(`platform = $${paramCount}`);
      values.push(platform);
      paramCount++;
    }

    if (sale_month) {
      whereConditions.push(`sale_month = $${paramCount}`);
      values.push(sale_month);
      paramCount++;
    }

    if (region) {
      whereConditions.push(`region = $${paramCount}`);
      values.push(region);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const dataQuery = `
      SELECT 
        platform,
        sale_month,
        region,
        master_code,
        master_name,
        SUM(quantity) as total_units,
        SUM(gmv) as total_gmv
      FROM global_sales_master
      ${whereClause}
      GROUP BY platform, sale_month, region, master_code, master_name
      ORDER BY sale_month ASC, total_gmv DESC
    `;

    const dataResult = await pool.query(dataQuery, values);

    res.json({
      success: true,
      data: dataResult.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export sales data',
    });
  }
};
