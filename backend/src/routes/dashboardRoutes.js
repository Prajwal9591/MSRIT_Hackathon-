import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

// GET /dashboard & /dashboard/metrics
router.get('/dashboard', dashboardController.getDashboardMetrics);
router.get('/dashboard/metrics', dashboardController.getDashboardMetrics);

export default router;
