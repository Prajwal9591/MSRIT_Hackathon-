import { securityAuditEngineService } from '../services/securityAuditEngineService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const securityController = {
  /**
   * Run security audit on current active repo or provided files
   * GET /api/v1/security/audit or POST /api/v1/security/audit
   */
  getSecurityAudit: (req, res, next) => {
    try {
      const { repoId, repoName, files } = req.body || req.query || {};
      const auditResult = securityAuditEngineService.runSecurityAudit({
        files: files || req.body?.files,
        repoId: repoId || req.query?.repoId,
        repoName: repoName || req.query?.repoName
      });

      return ApiResponse.success(res, 200, auditResult, auditResult.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Scan submitted codebase files
   * POST /api/v1/security/scan
   */
  scanFiles: (req, res, next) => {
    try {
      const { files, repoName, repoId } = req.body || {};
      const auditResult = securityAuditEngineService.runSecurityAudit({
        files: files || [],
        repoName,
        repoId
      });

      return ApiResponse.success(res, 200, auditResult, auditResult.message);
    } catch (error) {
      next(error);
    }
  }
};
