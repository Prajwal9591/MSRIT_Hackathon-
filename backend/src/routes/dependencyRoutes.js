import { Router } from 'express';
import { dependencyController } from '../controllers/dependencyController.js';

const router = Router();

// GET /dependency
router.get('/dependency', dependencyController.getDependencyGraph);

// POST /dependency/analyze
router.post('/dependency/analyze', dependencyController.analyzeDependencies);

export default router;
