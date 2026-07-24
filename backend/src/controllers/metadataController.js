import { metadataService } from '../services/metadataService.js';
import { metadataLoaderService } from '../services/metadataLoaderService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const metadataController = {
  getMetadata: (req, res, next) => {
    try {
      const { repoId } = req.params;
      const data = metadataService.getRepoMetadata(repoId);
      return ApiResponse.success(res, 200, data, 'Repository metadata retrieved');
    } catch (error) {
      next(error);
    }
  },

  getCommitDiff: (req, res, next) => {
    try {
      const { commitHash } = req.params;
      const data = metadataService.getCommitDiff(commitHash);
      return ApiResponse.success(res, 200, data, 'Commit diff information retrieved');
    } catch (error) {
      next(error);
    }
  },

  // Trigger Full or Incremental AST Metadata Scanning
  scanMetadata: (req, res, next) => {
    try {
      const { repoId, files, forceRefresh } = req.body;
      const result = metadataLoaderService.scanCodebase({ repoId, files, forceRefresh });
      return ApiResponse.success(res, 200, result, 'Metadata AST scan completed with incremental loading');
    } catch (error) {
      next(error);
    }
  },

  // Get cached metadata graph
  getMetadataCache: (req, res, next) => {
    try {
      const cache = metadataLoaderService.loadCache();
      return ApiResponse.success(res, 200, cache, 'Cached JSON metadata graph retrieved');
    } catch (error) {
      next(error);
    }
  }
};
