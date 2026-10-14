import { Router } from 'express';
import { dependencyController } from '../controllers/dependencyController.js';

const router = Router();

// GET /dependency/index (Reusable Dependency Index from memory)
router.get('/dependency/index', dependencyController.getDependencyIndex);
router.get('/dependencies/index', dependencyController.getDependencyIndex);

// GET /dependency/file (Detailed file dependencies: imports, importedBy, extends, implements, calls, references)
router.get('/dependency/file', dependencyController.getFileDependencies);
router.get('/dependencies/file', dependencyController.getFileDependencies);

// GET /dependency/blast-radius (Downstream transitive impact radius)
router.get('/dependency/blast-radius', dependencyController.getBlastRadius);
router.get('/dependencies/blast-radius', dependencyController.getBlastRadius);

// GET /dependency (Graph representation)
router.get('/dependency', dependencyController.getDependencyGraph);
router.get('/dependencies', dependencyController.getDependencyGraph);

// POST /dependency/analyze
router.post('/dependency/analyze', dependencyController.analyzeDependencies);

export default router;
