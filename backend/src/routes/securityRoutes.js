import { Router } from 'express';
import { securityController } from '../controllers/securityController.js';

const router = Router();

router.get('/security/audit', securityController.getSecurityAudit);
router.post('/security/audit', securityController.getSecurityAudit);
router.post('/security/scan', securityController.scanFiles);

export default router;
