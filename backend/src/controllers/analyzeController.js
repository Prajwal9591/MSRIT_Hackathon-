import { analyzeService } from '../services/analyzeService.js';
import { analysisPipelineService } from '../services/analysisPipelineService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const analyzeController = {
  runAnalysis: (req, res, next) => {
    try {
      const { repoId, commitHash, diffText, diff } = req.body;
      const effectiveDiffText = diffText || (typeof diff === 'string' ? diff : null);
      const result = analyzeService.performBlastAnalysis(repoId, commitHash, effectiveDiffText);
      return ApiResponse.success(res, 200, result, 'Blast radius analysis completed');
    } catch (error) {
      next(error);
    }
  },

  // Run full end-to-end atomic analysis pipeline
  runPipeline: async (req, res, next) => {
    try {
      const {
        repoId,
        changedFile,
        changedFunction,
        files,
        forceRefresh,
        diffText,
        diff,
        baseSha,
        targetSha,
        commitHash,
        changedFiles
      } = req.body;

      const effectiveDiffText = diffText || (typeof diff === 'string' ? diff : null);

      const result = await analysisPipelineService.runFullPipeline({
        repoId,
        changedFile,
        changedFunction,
        files,
        forceRefresh,
        diffText: effectiveDiffText,
        baseSha,
        targetSha,
        commitHash,
        changedFiles
      });
      return ApiResponse.success(res, 200, result, 'Full AegisBlast end-to-end analysis pipeline completed');
    } catch (error) {
      next(error);
    }
  }
};
