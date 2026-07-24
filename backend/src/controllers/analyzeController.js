import { analyzeService } from '../services/analyzeService.js';
import { analysisPipelineService } from '../services/analysisPipelineService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const analyzeController = {
  runAnalysis: (req, res, next) => {
    try {
      const { repoId, commitHash } = req.body;
      const result = analyzeService.performBlastAnalysis(repoId, commitHash);
      return ApiResponse.success(res, 200, result, 'Blast radius analysis completed');
    } catch (error) {
      next(error);
    }
  },

  // Run full end-to-end atomic analysis pipeline
  runPipeline: async (req, res, next) => {
    try {
      const { repoId, changedFile, changedFunction, files, forceRefresh } = req.body;
      const result = await analysisPipelineService.runFullPipeline({
        repoId,
        changedFile,
        changedFunction,
        files,
        forceRefresh
      });
      return ApiResponse.success(res, 200, result, 'Full AegisBlast end-to-end analysis pipeline completed');
    } catch (error) {
      next(error);
    }
  }
};
