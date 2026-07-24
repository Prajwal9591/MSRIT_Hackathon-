import { repoScannerService } from '../services/repoScannerService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const repoScannerController = {
  /**
   * Parse Repository Metadata from ZIP, Local Folder, or GitHub URL
   */
  parseMetadata: async (req, res, next) => {
    try {
      const { githubUrl, repoUrl, cloneUrl, folderPath, localPath, repositoryName, branch } = req.body || {};
      const file = req.file;

      let result;

      // 1. ZIP File Upload Processing
      if (file || req.body?.isZip) {
        result = await repoScannerService.processZipFile(file, repositoryName);
      }
      // 2. GitHub Repository URL Processing
      else if (githubUrl || repoUrl || cloneUrl) {
        const url = githubUrl || repoUrl || cloneUrl;
        result = await repoScannerService.processGithubUrl(url, branch || 'main', repositoryName);
      }
      // 3. Local Folder Processing
      else if (folderPath || localPath) {
        const targetPath = folderPath || localPath;
        result = await repoScannerService.processLocalFolder(targetPath, repositoryName);
      }
      // Default: Scan current workspace if no input provided
      else {
        result = await repoScannerService.processLocalFolder('d:\\MSRIT', repositoryName || 'MSRIT-Hackathon');
      }

      // Return exact required schema directly (and wrapped in ApiResponse)
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
