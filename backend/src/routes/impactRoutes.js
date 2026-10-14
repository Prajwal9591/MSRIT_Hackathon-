import { Router } from 'express';
import { impactController } from '../controllers/impactController.js';

const router = Router();

// GET /impact
router.get('/impact', impactController.getBlastRadiusImpact);

// POST /impact/calculate
router.post('/impact/calculate', impactController.calculateImpact);

// POST /impact/diff/parse
router.post('/impact/diff/parse', impactController.parseDiff);

// POST /impact/diff/commits
router.post('/impact/diff/commits', impactController.getDiffBetweenCommits);

export default router;
