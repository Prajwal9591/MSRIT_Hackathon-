import { impactService } from '../services/impactService.js';
import { impactAnalysisEngineService } from '../services/impactAnalysisEngineService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const impactController = {
  getBlastRadiusImpact: (req, res, next) => {
    try {
      const { commitHash, changedFile, changedFunction } = req.query;
      const data = impactAnalysisEngineService.calculateImpact({
        changedFile: changedFile || 'src/services/StripeWebhookHandler.ts',
        changedFunction: changedFunction || 'handlePaymentIntentSucceeded'
      });
      return ApiResponse.success(res, 200, data, 'Concentric blast radius layers calculated');
    } catch (error) {
      next(error);
    }
  },

  // Calculate full impact analysis with algorithms & risk matrix
  calculateImpact: (req, res, next) => {
    try {
      const { changedFile, changedFunction, dependencyGraph, metadata } = req.body;
      const result = impactAnalysisEngineService.calculateImpact({
        changedFile,
        changedFunction,
        dependencyGraph,
        metadata
      });
      return ApiResponse.success(res, 200, result, 'Impact analysis calculation completed successfully');
    } catch (error) {
      next(error);
    }
  }
};
