import { Router } from 'express';
import { explainController } from '../controllers/explainController.js';

const router = Router();

// POST /explain
router.post('/explain', explainController.getAiExplanation);

export default router;
