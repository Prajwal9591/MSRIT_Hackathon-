import { aiExplanationService } from '../services/aiExplanationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const explainController = {
  getAiExplanation: async (req, res, next) => {
    try {
      const { commitHash, impactJson, metadata, dependencyGraph } = req.body;
      const data = await aiExplanationService.generateExplanation({
        commitHash,
        impactJson,
        metadata,
        dependencyGraph
      });
      return ApiResponse.success(res, 200, data, 'AI architectural explanation generated successfully');
    } catch (error) {
      next(error);
    }
  }
};
