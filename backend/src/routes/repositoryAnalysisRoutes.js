import { Router } from 'express';
import multer from 'multer';
import { repositoryAnalysisController } from '../controllers/repositoryAnalysisController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

const router = Router();

// Scan & Analyze (single-pass dynamic analysis stored in memory)
router.post('/analysis-engine/scan', upload.any(), repositoryAnalysisController.scanAndAnalyze);
router.post('/repository/analyze', upload.any(), repositoryAnalysisController.scanAndAnalyze);
router.post('/analysis-engine/analyze', upload.any(), repositoryAnalysisController.scanAndAnalyze);

// Get Active Analysis from Memory
router.get('/analysis-engine/current', repositoryAnalysisController.getCurrentAnalysis);
router.get('/repository/analysis/current', repositoryAnalysisController.getCurrentAnalysis);
router.get('/repository/analysis', repositoryAnalysisController.getCurrentAnalysis);

// Get All Analyses & History from Memory
router.get('/analysis-engine/all', repositoryAnalysisController.getAllAnalyses);
router.get('/analysis-engine/repositories', repositoryAnalysisController.getAllAnalyses);
router.get('/repository/analysis/all', repositoryAnalysisController.getAllAnalyses);

// Get Specific Analysis by Repo ID from Memory
router.get('/analysis-engine/repo/:repoId', repositoryAnalysisController.getAnalysisById);
router.get('/analysis-engine/repository/:repoId', repositoryAnalysisController.getAnalysisById);
router.get('/repository/analysis/:repoId', repositoryAnalysisController.getAnalysisById);

// Clear Memory Cache
router.delete('/analysis-engine/cache', repositoryAnalysisController.clearMemoryStore);
router.delete('/analysis-engine/repository/:repoId', repositoryAnalysisController.clearMemoryStore);
router.delete('/analysis-engine/:repoId', repositoryAnalysisController.clearMemoryStore);

export default router;
