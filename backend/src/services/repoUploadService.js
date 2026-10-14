import path from 'path';
import fs from 'fs';

// Ignore pattern rules
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', 'venv', '__pycache__', '.idea', '.vscode', 'coverage']);
const IGNORED_FILES = new Set(['.DS_Store', 'thumbs.db', 'package-lock.json', 'yarn.lock']);

// File extension to language mapping
const LANGUAGE_MAP = {
  '.js': 'JavaScript',
  '.jsx': 'JavaScript (React)',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript (React)',
  '.py': 'Python',
  '.go': 'Go',
  '.java': 'Java',
  '.rs': 'Rust',
  '.c': 'C',
  '.cpp': 'C++',
  '.cs': 'C#',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.md': 'Markdown'
};

let activeRepoStore = null;

export const repoUploadService = {
  /**
   * Set currently active repository in backend memory
   */
  setCurrentRepo: (repoData) => {
    activeRepoStore = repoData;
  },

  /**
   * Get currently active repository
   */
  getCurrentRepo: () => {
    return activeRepoStore;
  },

  /**
   * Helper to check if path segment should be ignored
   */
  shouldIgnorePath: (filePath) => {
    const parts = filePath.split(/[/\\]/);
    for (const part of parts) {
      if (IGNORED_DIRECTORIES.has(part.toLowerCase())) {
        return true;
      }
    }
    const fileName = parts[parts.length - 1];
    if (IGNORED_FILES.has(fileName.toLowerCase())) {
      return true;
    }
    return false;
  },

  /**
   * Pure JS ZIP Entry Extractor from raw Buffer
   */
  extractZipEntries: (buffer) => {
    const entries = [];
    let i = 0;
    const len = buffer.length;

    while (i < len - 30) {
      if (buffer[i] === 0x50 && buffer[i + 1] === 0x4b && buffer[i + 2] === 0x03 && buffer[i + 3] === 0x04) {
        const compressedSize = buffer.readUInt32LE(i + 18);
        const uncompressedSize = buffer.readUInt32LE(i + 22);
        const filenameLength = buffer.readUInt16LE(i + 26);
        const extraLength = buffer.readUInt16LE(i + 28);
        const filename = buffer.toString('utf8', i + 30, i + 30 + filenameLength);

        if (filename && !filename.endsWith('/') && !filename.startsWith('__MACOSX') && !filename.includes('/.')) {
          entries.push({
            path: filename,
            size: uncompressedSize || compressedSize || 1024
          });
        }
        i += 30 + filenameLength + extraLength;
      } else {
        i++;
      }
    }
    return entries;
  },

  /**
   * Validate repository files & size bounds
   */
  validateUpload: ({ files, totalSizeKb, repoName }) => {
    const errors = [];
    const warnings = [];

    if (!repoName || repoName.trim().length === 0) {
      errors.push('Repository name cannot be empty.');
    }

    if (totalSizeKb > 500 * 1024) {
      errors.push(`Repository total size (${Math.round(totalSizeKb / 1024)}MB) exceeds maximum allowed threshold of 500MB.`);
    }

    if (!files || files.length === 0) {
      warnings.push('Repository is empty (0 source files detected).');
    }

    // Check if key manifest files exist
    const filePaths = (files || []).map((f) => String(f?.path || '').toLowerCase());
    const hasManifest = filePaths.some((p) =>
      p.endsWith('package.json') || p.endsWith('requirements.txt') || p.endsWith('go.mod') || p.endsWith('pom.xml') || p.endsWith('cargo.toml')
    );

    if (files && files.length > 0 && !hasManifest) {
      warnings.push('No standard package manifest (package.json, requirements.txt, go.mod) detected in root.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Process and analyze raw file list (from ZIP, Local Folder, or GitHub clone)
   */
  parseRepositoryStructure: (rawFileList = [], repoName = 'sample-repo', repoType = 'folder') => {
    const validFiles = [];
    const folderSet = new Set();
    const languageCounts = {};
    let totalSizeBytes = 0;

    (rawFileList || []).forEach((item) => {
      const relPath = item.path || item.name;
      if (!relPath || repoUploadService.shouldIgnorePath(relPath)) {
        return; // Ignore .git, node_modules, dist, build, venv
      }

      // Collect all folder levels
      const normalizedPath = relPath.replace(/\\/g, '/');
      const segments = normalizedPath.split('/');
      segments.pop(); // remove filename

      let currentFolder = '';
      for (const seg of segments) {
        if (seg && seg !== '.') {
          currentFolder = currentFolder ? `${currentFolder}/${seg}` : seg;
          folderSet.add(currentFolder);
        }
      }

      const ext = path.extname(relPath).toLowerCase();
      const language = LANGUAGE_MAP[ext] || 'Other';
      const sizeBytes = item.size || item.sizeBytes || 1024;

      totalSizeBytes += sizeBytes;

      // Count languages
      languageCounts[language] = (languageCounts[language] || 0) + 1;

      validFiles.push({
        path: relPath,
        sizeBytes,
        sizeKb: Math.ceil(sizeBytes / 1024),
        extension: ext || 'file',
        language
      });
    });

    const totalFiles = validFiles.length;
    const totalFolders = folderSet.size;
    const totalSizeKb = Math.ceil(totalSizeBytes / 1024);

    // Compute language percentages
    const languages = Object.entries(languageCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const primaryLanguage = languages.length > 0 ? languages[0].name : 'None detected';

    // Validation
    const validation = repoUploadService.validateUpload({
      files: validFiles,
      totalSizeKb,
      repoName
    });

    const parsedResult = {
      metadata: {
        id: `repo-${Date.now()}`,
        name: repoName,
        repoType,
        totalFiles,
        totalFolders,
        totalSizeKb,
        primaryLanguage,
        scannedAt: new Date().toISOString(),
        ignoredPatterns: Array.from(IGNORED_DIRECTORIES),
        isEmpty: totalFiles === 0
      },
      validation,
      languages,
      folders: Array.from(folderSet),
      files: validFiles.slice(0, 100) // cap file list at top 100 for fast response
    };

    repoUploadService.setCurrentRepo(parsedResult);
    return parsedResult;
  },

  /**
   * Process ZIP Upload
   */
  processZipUpload: (file, repoName) => {
    const extractedName = repoName || (file ? file.originalname.replace(/\.[^/.]+$/, '') : 'uploaded-zip');
    let extractedFiles = [];

    if (file) {
      try {
        const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
        if (buffer) {
          extractedFiles = repoUploadService.extractZipEntries(buffer);
        }
      } catch (e) {
        console.warn('ZIP buffer extraction error:', e.message);
      }
    }

    return repoUploadService.parseRepositoryStructure(extractedFiles, extractedName, 'ZIP Archive');
  },

  /**
   * Process Local Folder Upload
   */
  processFolderUpload: (folderFiles, folderName) => {
    const name = folderName || 'local-workspace-folder';
    return repoUploadService.parseRepositoryStructure(folderFiles || [], name, 'Local Folder');
  },

  /**
   * Process GitHub Repository Clone via GitHub REST API
   */
  processGithubUrl: async (githubUrl, branch = 'auto') => {
    const extractedName = githubUrl ? githubUrl.split('/').pop().replace('.git', '') : 'github-repo';
    let rawFileList = [];
    let resolvedBranch = branch;

    // Parse owner & repo from GitHub URL
    const match = githubUrl ? githubUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/i) : null;
    if (match) {
      const owner = match[1];
      const repo = match[2].replace('.git', '');
      const headers = {
        'User-Agent': 'AegisBlast-App',
        'Accept': 'application/vnd.github.v3+json'
      };

      try {
        // 1. Fetch Repository Info to get exact default branch
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        let detectedDefault = 'main';
        if (repoRes.ok) {
          const repoInfo = await repoRes.json();
          detectedDefault = repoInfo.default_branch || 'main';
        }

        const candidateBranches = [];
        if (branch && branch !== 'auto' && branch !== 'main' && branch !== 'master') candidateBranches.push(branch);
        if (detectedDefault) candidateBranches.push(detectedDefault);
        if (branch && branch !== 'auto') candidateBranches.push(branch);
        candidateBranches.push('Production', 'production', 'main', 'master', 'develop', 'dev');

        const uniqueCandidates = Array.from(new Set(candidateBranches.filter(Boolean)));

        for (const candidate of uniqueCandidates) {
          try {
            const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(candidate)}?recursive=1`, { headers });
            if (treeRes.ok) {
              const treeData = await treeRes.json();
              if (treeData.tree && Array.isArray(treeData.tree) && treeData.tree.length > 0) {
                rawFileList = treeData.tree
                  .filter((item) => item.type === 'blob')
                  .map((item) => ({
                    path: item.path,
                    size: item.size || 1024
                  }));
                resolvedBranch = candidate;
                break;
              }
            }
          } catch (e) {
            // try next candidate
          }
        }
      } catch (err) {
        console.warn(`GitHub REST API fetch error for ${githubUrl}:`, err.message);
      }
    }

    const result = repoUploadService.parseRepositoryStructure(rawFileList, extractedName, 'GitHub Clone');
    result.metadata.githubUrl = githubUrl;
    result.metadata.gitUrl = githubUrl;
    if (match) {
      result.metadata.owner = match[1];
    }
    result.metadata.branch = resolvedBranch || 'main';
    return result;
  }
};
