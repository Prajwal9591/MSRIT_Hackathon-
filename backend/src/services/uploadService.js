export const uploadService = {
  processArchiveUpload: (fileData, options = {}) => {
    const filename = fileData ? fileData.originalname : 'uploaded-archive.zip';
    const repoName = options.repoName || filename.replace(/\.[^/.]+$/, '');

    return {
      uploadId: `up-${Date.now()}`,
      repoName,
      status: 'ingested',
      fileSize: fileData ? fileData.size : 1024 * 45,
      branch: options.branch || 'main',
      astNodesExtracted: 312,
      functionsDiscovered: 84,
      message: `Repository ${repoName} ingested successfully into AegisBlast AST engine.`
    };
  },

  processGitClone: (cloneUrl, branch = 'main') => {
    const repoName = cloneUrl.split('/').pop().replace('.git', '') || 'cloned-repository';

    return {
      uploadId: `git-${Date.now()}`,
      cloneUrl,
      repoName,
      branch,
      status: 'cloned',
      astNodesExtracted: 420,
      functionsDiscovered: 126,
      message: `Git repository ${repoName} cloned and indexed.`
    };
  }
};
