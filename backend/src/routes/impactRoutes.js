import { Router } from 'express';
import { impactController } from '../controllers/impactController.js';

const router = Router();

// GET /impact
router.get('/impact', impactController.getBlastRadiusImpact);

// POST /impact/calculate
router.post('/impact/calculate', impactController.calculateImpact);

export default router;
