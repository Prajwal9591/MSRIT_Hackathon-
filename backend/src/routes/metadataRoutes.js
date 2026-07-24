import { Router } from 'express';
import { metadataController } from '../controllers/metadataController.js';

const router = Router();

// GET /metadata or /metadata/:repoId
router.get('/metadata', metadataController.getMetadata);
router.get('/metadata/cache', metadataController.getMetadataCache);
router.get('/metadata/:repoId', metadataController.getMetadata);
router.get('/metadata/commit/:commitHash', metadataController.getCommitDiff);

// POST /metadata/scan (Trigger AST Metadata Scan with incremental loading)
router.post('/metadata/scan', metadataController.scanMetadata);

export default router;
