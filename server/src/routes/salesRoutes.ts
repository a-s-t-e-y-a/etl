import { Router } from 'express';
import {
  getDistinctPlatforms,
  getDistinctMonths,
  getDistinctRegions,
  getAggregatedData,
  getDetailedSalesData,
  exportSalesData,
} from '../controllers/salesController';

const router = Router();

router.get('/platforms', getDistinctPlatforms);
router.get('/months', getDistinctMonths);
router.get('/regions', getDistinctRegions);
router.get('/aggregated', getAggregatedData);
router.get('/detailed', getDetailedSalesData);
router.get('/export', exportSalesData);

export default router;
