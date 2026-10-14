import { dependencyService } from '../services/dependencyService.js';
import { dependencyAnalyzerService } from '../services/dependencyAnalyzerService.js';
import { dependencyIndexBuilderService, inMemoryDependencyIndexStore } from '../services/dependencyIndexBuilderService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const dependencyController = {
  // Get Reusable Dependency Index for repository
  getDependencyIndex: (req, res, next) => {
    try {
      const { repoId } = req.query;
      const index = inMemoryDependencyIndexStore.get(repoId);
      if (!index) {
        return ApiResponse.success(res, 200, null, 'No dependency index found in memory for this repository');
      }
      return ApiResponse.success(res, 200, index.toJSON(), 'Repository dependency index retrieved from memory');
    } catch (error) {
      next(error);
    }
  },

  // Get file-level dependencies (imports, importedBy, extends, implements, calls, references)
  getFileDependencies: (req, res, next) => {
    try {
      const { repoId, filePath, path: p } = req.query;
      const targetFile = filePath || p;
      if (!targetFile) {
        throw ApiError.badRequest('Query parameter "filePath" or "path" is required');
      }

      const index = inMemoryDependencyIndexStore.get(repoId);
      if (!index) {
        throw ApiError.notFound('No dependency index active in memory. Please scan a repository first.');
      }

      const fileRecord = index.getFileDependencies(targetFile);
      if (!fileRecord) {
        throw ApiError.notFound(`File '${targetFile}' not found in dependency index`);
      }

      return ApiResponse.success(res, 200, fileRecord, `Dependency record for file '${targetFile}' retrieved`);
    } catch (error) {
      next(error);
    }
  },

  // Calculate blast radius for a file
  getBlastRadius: (req, res, next) => {
    try {
      const { repoId, filePath, path: p, depth, maxDepth, algorithm } = req.query;
      const targetFile = filePath || p;
      if (!targetFile) {
        throw ApiError.badRequest('Query parameter "filePath" or "path" is required');
      }

      const index = inMemoryDependencyIndexStore.get(repoId);
      if (!index) {
        throw ApiError.notFound('No dependency index active in memory. Please scan a repository first.');
      }

      const blast = index.computeBlastRadius(targetFile, {
        maxDepth: depth ? parseInt(depth, 10) : maxDepth ? parseInt(maxDepth, 10) : 10,
        algorithm: algorithm || 'bfs'
      });
      return ApiResponse.success(res, 200, blast, `Blast radius for file '${targetFile}' calculated from dependency index`);
    } catch (error) {
      next(error);
    }
  },

  // Get AST call-graph dependencies
  getDependencyGraph: (req, res, next) => {
    try {
      const { repoId } = req.query;
      const index = inMemoryDependencyIndexStore.get(repoId);
      if (index) {
        return ApiResponse.success(res, 200, {
          repoId: index.repoId,
          nodes: index.nodes,
          edges: index.edges,
          summary: index.summary
        }, 'Dependency index graph retrieved from memory');
      }

      const result = dependencyAnalyzerService.analyzeDependencies({ repoId });
      return ApiResponse.success(res, 200, result.graph, 'AST call-graph dependency graph retrieved');
    } catch (error) {
      next(error);
    }
  },

  // Trigger high-performance full codebase dependency analysis
  analyzeDependencies: (req, res, next) => {
    try {
      const { repoId, files, options, repositoryName, rootPath } = req.body;
      if (files && Array.isArray(files)) {
        const index = dependencyIndexBuilderService.buildIndex({
          repoId,
          repositoryName,
          files,
          rootPath
        });
        return ApiResponse.success(res, 200, index.toJSON(), 'Dependency index built and stored in memory');
      }

      const result = dependencyAnalyzerService.analyzeDependencies({ repoId, files, options });
      return ApiResponse.success(res, 200, result, 'High-performance codebase dependency analysis complete');
    } catch (error) {
      next(error);
    }
  }
};
