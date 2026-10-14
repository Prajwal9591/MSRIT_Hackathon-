import { impactService } from '../services/impactService.js';
import { impactAnalysisEngineService } from '../services/impactAnalysisEngineService.js';
import { gitDiffParserService } from '../services/gitDiffParserService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const impactController = {
  getBlastRadiusImpact: (req, res, next) => {
    try {
      const {
        commitHash,
        changedFile,
        filePath,
        changedFunction,
        repoId,
        algorithm,
        maxDepth,
        diffText,
        baseSha,
        targetSha
      } = req.query;

      const targetFile = filePath || changedFile;
      const data = impactAnalysisEngineService.calculateImpact({
        changedFile: targetFile,
        changedFunction,
        repoId,
        algorithm: algorithm || 'bfs',
        maxDepth: maxDepth ? parseInt(maxDepth, 10) : 10,
        diffText,
        baseSha,
        targetSha,
        commitHash
      });

      return ApiResponse.success(res, 200, data, 'Concentric blast radius layers calculated from dependency index');
    } catch (error) {
      next(error);
    }
  },

  // Calculate full impact analysis with algorithms & risk matrix
  calculateImpact: (req, res, next) => {
    try {
      const {
        changedFile,
        filePath,
        changedFunction,
        repoId,
        algorithm,
        maxDepth,
        diffText,
        diff,
        baseSha,
        targetSha,
        commitHash,
        changedFiles
      } = req.body;

      const targetFile = filePath || changedFile;
      const effectiveDiffText = diffText || (typeof diff === 'string' ? diff : null);

      const result = impactAnalysisEngineService.calculateImpact({
        changedFile: targetFile,
        changedFunction,
        repoId,
        algorithm: algorithm || 'bfs',
        maxDepth: maxDepth ? parseInt(maxDepth, 10) : 10,
        diffText: effectiveDiffText,
        baseSha,
        targetSha,
        commitHash,
        changedFiles
      });

      return ApiResponse.success(res, 200, result, 'Impact analysis calculation completed successfully from dependency index');
    } catch (error) {
      next(error);
    }
  },

  // Parse a unified git diff into structured file changes and symbols
  parseDiff: (req, res, next) => {
    try {
      const { diffText, diff } = req.body;
      const rawText = diffText || (typeof diff === 'string' ? diff : '');
      const parsed = gitDiffParserService.parseUnifiedDiff(rawText);
      return ApiResponse.success(res, 200, parsed, 'Git unified diff parsed successfully');
    } catch (error) {
      next(error);
    }
  },

  // Extract and parse diff between two commits or single commit in local repository
  getDiffBetweenCommits: async (req, res, next) => {
    try {
      const { repositoryPath, baseSha, targetSha, commitHash } = req.body;
      const targetBase = baseSha || commitHash;
      const parsed = await gitDiffParserService.getDiffBetweenCommits(repositoryPath, targetBase, targetSha);
      return ApiResponse.success(res, 200, parsed, 'Git diff extracted and parsed successfully');
    } catch (error) {
      next(error);
    }
  }
};
