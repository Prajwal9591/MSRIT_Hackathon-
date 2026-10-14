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
      const uploadedFiles = req.files || (req.file ? [req.file] : null);

      // 1. Check for array of uploaded code files / files in JSON or Multer
      if (req.body?.files && Array.isArray(req.body.files) && req.body.files.length > 0) {
        result = await repoScannerService.processCodeFiles(req.body.files, repositoryName);
      }
      // 2. Multer multi-file upload
      else if (uploadedFiles && uploadedFiles.length > 0) {
        const isZip = uploadedFiles.some(
          (f) => f.originalname?.match(/\.(zip|tar|gz)$/i) || f.mimetype?.includes('zip')
        );
        if (isZip && uploadedFiles.length === 1) {
          result = await repoScannerService.processZipFile(uploadedFiles[0], repositoryName);
        } else {
          result = await repoScannerService.processCodeFiles(uploadedFiles, repositoryName);
        }
      }
      // 3. ZIP File Upload Processing
      else if (file || req.body?.isZip) {
        result = await repoScannerService.processZipFile(file, repositoryName);
      }
      // 4. GitHub Repository URL Processing
      else if (githubUrl || repoUrl || cloneUrl) {
        const url = githubUrl || repoUrl || cloneUrl;
        result = await repoScannerService.processGithubUrl(url, branch || 'main', repositoryName);
      }
      // 3. Local Folder Processing
      else if (folderPath || localPath) {
        const targetPath = folderPath || localPath;
        result = await repoScannerService.processLocalFolder(targetPath, repositoryName);
      }
      // No valid input provided
      else {
        throw ApiError.badRequest('No repository input provided. Please provide a GitHub URL, ZIP archive, or folder path.');
      }

      // Return exact required schema directly (and wrapped in ApiResponse)
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
