import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import analyzeRoutes from './analyzeRoutes.js';
import metadataRoutes from './metadataRoutes.js';
import dependencyRoutes from './dependencyRoutes.js';
import impactRoutes from './impactRoutes.js';
import explainRoutes from './explainRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import repoScannerRoutes from './repoScannerRoutes.js';
import repositoryAnalysisRoutes from './repositoryAnalysisRoutes.js';
import securityRoutes from './securityRoutes.js';

const router = Router();

// Mount all API endpoints both at root level and under /api/v1/ prefix
router.use('/', healthRoutes);
router.use('/', uploadRoutes);
router.use('/', analyzeRoutes);
router.use('/', metadataRoutes);
router.use('/', dependencyRoutes);
router.use('/', impactRoutes);
router.use('/', explainRoutes);
router.use('/', dashboardRoutes);
router.use('/', repoScannerRoutes);
router.use('/', repositoryAnalysisRoutes);
router.use('/', securityRoutes);

export default router;
