import { Router } from 'express';
import { analyzeController } from '../controllers/analyzeController.js';

const router = Router();

// POST /analyze
router.post('/analyze', analyzeController.runAnalysis);

// POST /analyze/pipeline (Full End-to-End Orchestrator Endpoint)
router.post('/analyze/pipeline', analyzeController.runPipeline);

export default router;
