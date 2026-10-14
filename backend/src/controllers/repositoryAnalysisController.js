import { repositoryAnalysisEngine, inMemoryRepoStore } from '../services/repositoryAnalysisEngineService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const repositoryAnalysisController = {
  /**
   * Scan repository once dynamically and store in memory
   * POST /api/v1/analysis-engine/scan or POST /api/v1/repository/analyze
   */
  scanAndAnalyze: async (req, res, next) => {
    try {
      const { repositoryName, repoId, folderPath, githubUrl, branch, files, forceRescan } = req.body || {};
      const file = req.file;
      const uploadedFiles = req.files || (req.file ? [req.file] : null);

      logger.info(`Received repository analysis request for repo: ${repositoryName || repoId || folderPath || githubUrl || 'uploaded-files'}`);

      let analysisResult;

      // 1. Multer ZIP file upload
      if (file || (uploadedFiles && uploadedFiles.length === 1 && uploadedFiles[0].originalname?.match(/\.(zip|tar|gz)$/i))) {
        const targetZip = file || uploadedFiles[0];
        analysisResult = await repositoryAnalysisEngine.scanRepository({
          repoId,
          repositoryName,
          zipFile: targetZip,
          forceRescan: Boolean(forceRescan)
        });
      }
      // 2. Uploaded code files array (from multer or JSON payload)
      else if ((uploadedFiles && uploadedFiles.length > 0) || (files && Array.isArray(files) && files.length > 0)) {
        const fileList = files || uploadedFiles;
        analysisResult = await repositoryAnalysisEngine.scanRepository({
          repoId,
          repositoryName,
          files: fileList,
          forceRescan: Boolean(forceRescan)
        });
      }
      // 3. Local folder path
      else if (folderPath) {
        analysisResult = await repositoryAnalysisEngine.scanRepository({
          repoId,
          repositoryName,
          directoryPath: folderPath,
          forceRescan: Boolean(forceRescan)
        });
      }
      // 4. Remote GitHub URL
      else if (githubUrl) {
        analysisResult = await repositoryAnalysisEngine.scanRepository({
          repoId,
          repositoryName,
          githubUrl,
          branch: branch || 'main',
          forceRescan: Boolean(forceRescan)
        });
      } else {
        throw ApiError.badRequest('No valid repository input provided. Please provide code files, ZIP archive, local folder path, or GitHub URL.');
      }

      return ApiResponse.success(res, 200, analysisResult, 'Repository analyzed dynamically and stored in memory');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get currently active repository analysis from memory
   * GET /api/v1/analysis-engine/current or GET /api/v1/repository/analysis/current
   */
  getCurrentAnalysis: (req, res, next) => {
    try {
      const activeAnalysis = inMemoryRepoStore.getActive();
      if (!activeAnalysis) {
        return ApiResponse.success(res, 200, null, 'No active repository currently loaded in memory');
      }
      return ApiResponse.success(res, 200, activeAnalysis, 'Current repository analysis retrieved from memory');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get specific repository analysis by ID from memory
   * GET /api/v1/analysis-engine/repo/:repoId or GET /api/v1/repository/analysis/:repoId
   */
  getAnalysisById: (req, res, next) => {
    try {
      const { repoId } = req.params;
      const analysis = inMemoryRepoStore.get(repoId);
      if (!analysis) {
        throw ApiError.notFound(`No repository analysis found in memory for ID '${repoId}'`);
      }
      return ApiResponse.success(res, 200, analysis, `Repository analysis for '${repoId}' retrieved from memory`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all repository analyses currently stored in memory
   * GET /api/v1/analysis-engine/all
   */
  getAllAnalyses: (req, res, next) => {
    try {
      const allAnalyses = inMemoryRepoStore.getAll();
      const history = inMemoryRepoStore.getHistory();
      return ApiResponse.success(res, 200, { analyses: allAnalyses, history, count: allAnalyses.length }, 'All in-memory repository analyses retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear repository from in-memory store
   * DELETE /api/v1/analysis-engine/:repoId?
   */
  clearMemoryStore: (req, res, next) => {
    try {
      const { repoId } = req.params;
      inMemoryRepoStore.clear(repoId);
      return ApiResponse.success(res, 200, { clearedRepoId: repoId || 'ALL' }, 'In-memory repository store updated');
    } catch (error) {
      next(error);
    }
  }
};
