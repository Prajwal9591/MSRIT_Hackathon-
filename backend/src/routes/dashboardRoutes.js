import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

// GET /dashboard
router.get('/dashboard', dashboardController.getDashboardMetrics);

export default router;
