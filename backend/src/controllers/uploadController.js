import { repoUploadService } from '../services/repoUploadService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const uploadController = {
  // Handle ZIP Archive Upload
  handleZipUpload: (req, res, next) => {
    try {
      const file = req.file || (req.files && req.files[0]);
      const { repoName } = req.body;

      const result = repoUploadService.processZipUpload(file, repoName);
      return ApiResponse.created(res, result, 'ZIP archive processed & validated successfully');
    } catch (error) {
      next(error);
    }
  },

  // Handle Local Folder Upload
  handleFolderUpload: (req, res, next) => {
    try {
      const { files, folderName } = req.body;
      if (!files || !Array.isArray(files)) {
        throw ApiError.badRequest('Missing files array for folder upload');
      }

      const result = repoUploadService.processFolderUpload(files, folderName);
      return ApiResponse.created(res, result, 'Local folder directory parsed successfully');
    } catch (error) {
      next(error);
    }
  },

  // Handle GitHub Repository Clone URL
  handleGitClone: async (req, res, next) => {
    try {
      const { cloneUrl, branch } = req.body;
      if (!cloneUrl || typeof cloneUrl !== 'string') {
        throw ApiError.badRequest('Missing required cloneUrl string parameter');
      }

      const result = await repoUploadService.processGithubUrl(cloneUrl, branch);
      return ApiResponse.created(res, result, 'GitHub repository metadata extracted successfully');
    } catch (error) {
      next(error);
    }
  }
};
