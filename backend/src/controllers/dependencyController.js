import { dependencyService } from '../services/dependencyService.js';
import { dependencyAnalyzerService } from '../services/dependencyAnalyzerService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const dependencyController = {
  // Get AST call-graph dependencies
  getDependencyGraph: (req, res, next) => {
    try {
      const { repoId } = req.query;
      const result = dependencyAnalyzerService.analyzeDependencies({ repoId });
      return ApiResponse.success(res, 200, result.graph, 'AST call-graph dependency graph retrieved');
    } catch (error) {
      next(error);
    }
  },

  // Trigger high-performance full codebase dependency analysis
  analyzeDependencies: (req, res, next) => {
    try {
      const { repoId, files, options } = req.body;
      const result = dependencyAnalyzerService.analyzeDependencies({ repoId, files, options });
      return ApiResponse.success(res, 200, result, 'High-performance codebase dependency analysis complete');
    } catch (error) {
      next(error);
    }
  }
};
