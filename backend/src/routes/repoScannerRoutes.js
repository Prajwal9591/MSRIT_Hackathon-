import { Router } from 'express';
import multer from 'multer';
import { repoScannerController } from '../controllers/repoScannerController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max ZIP size
});

const router = Router();

// POST /scanner/parse-metadata (Accepts single ZIP, multiple code files, or JSON)
router.post('/scanner/parse-metadata', upload.any(), repoScannerController.parseMetadata);

// Alias routes for frontend compatibility
router.post('/parse-metadata', upload.any(), repoScannerController.parseMetadata);
router.post('/metadata/parse', upload.any(), repoScannerController.parseMetadata);

export default router;
