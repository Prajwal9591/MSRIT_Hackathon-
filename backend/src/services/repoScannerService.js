import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import simpleGit from 'simple-git';
import { scanDirectoryRecursively, formatBytes, parseGitHubUrl, fetchGitHubRepoDetails } from '../utils/repoScannerUtils.js';
import { repositoryAnalysisEngine, inMemoryRepoStore } from './repositoryAnalysisEngineService.js';
import { repoUploadService } from './repoUploadService.js';
import { dependencyIndexBuilderService } from './dependencyIndexBuilderService.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const repoScannerService = {
  /**
   * Process single or multiple uploaded / dropped code files
   */
  processCodeFiles: async (files, repositoryName) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw ApiError.badRequest('No code files provided for parsing');
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aegisblast-files-'));
    const name = repositoryName || (files.length === 1 ? (files[0].originalname || files[0].name || 'code-snippet').replace(/\.[^/.]+$/, '') : 'drag-drop-codebase');

    try {
      logger.info(`Extracting ${files.length} code files into ${tempDir} for repository '${name}'`);

      for (const item of files) {
        const fileName = item.originalname || item.name || item.path || 'file.js';
        // Sanitize path to prevent directory traversal
        const safeRelPath = fileName.replace(/^(\.\.[\/\\])+/, '').replace(/^[/\\]+/, '');
        const targetFilePath = path.join(tempDir, safeRelPath);

        const targetDir = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        if (item.buffer) {
          fs.writeFileSync(targetFilePath, item.buffer);
        } else if (item.path && fs.existsSync(item.path)) {
          fs.copyFileSync(item.path, targetFilePath);
        } else if (item.content !== undefined) {
          fs.writeFileSync(targetFilePath, typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2), 'utf-8');
        } else {
          // If no content, write minimal placeholder for structure
          fs.writeFileSync(targetFilePath, `// Source code for ${fileName}\n`, 'utf-8');
        }
      }

      const scannedData = scanDirectoryRecursively(tempDir);
      const repoId = `repo-${Date.now()}`;

      // Build and store Dependency Graph Index in memory
      let dependencyGraph = null;
      if (scannedData.files && scannedData.files.length > 0) {
        try {
          const depIndex = dependencyIndexBuilderService.buildIndex({
            repoId,
            repositoryName: name,
            files: scannedData.files,
            rootPath: tempDir
          });
          dependencyGraph = depIndex.toJSON();
        } catch (depErr) {
          logger.warn(`Dependency Index build failed: ${depErr.message}`);
        }
      }

      const finalResult = {
        repoId,
        repositoryName: name,
        branch: 'main',
        status: scannedData.isEmpty ? 'Empty Repository' : 'Validated',
        ...scannedData,
        dependencyGraph
      };

      inMemoryRepoStore.set(repoId, finalResult);
      repoUploadService.setCurrentRepo(finalResult);

      return finalResult;
    } finally {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // ignore
        }
      }, 5000);
    }
  },

  /**
   * Process uploaded ZIP file
   */
  processZipFile: async (file, repositoryName) => {
    if (!file || (!file.buffer && !file.path)) {
      throw ApiError.badRequest('No ZIP file provided for upload');
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aegisblast-zip-'));
    const name = repositoryName || (file.originalname ? file.originalname.replace(/\.[^/.]+$/, '') : 'uploaded-zip');

    try {
      logger.info(`Extracting ZIP archive for repository '${name}' into ${tempDir}`);

      const zip = file.buffer ? new AdmZip(file.buffer) : new AdmZip(file.path);
      zip.extractAllTo(tempDir, true);

      const scannedData = scanDirectoryRecursively(tempDir);
      const repoId = `repo-${Date.now()}`;

      // Build and store Dependency Graph Index in memory
      let dependencyGraph = null;
      if (scannedData.files && scannedData.files.length > 0) {
        try {
          const depIndex = dependencyIndexBuilderService.buildIndex({
            repoId,
            repositoryName: name,
            files: scannedData.files,
            rootPath: tempDir
          });
          dependencyGraph = depIndex.toJSON();
        } catch (depErr) {
          logger.warn(`Dependency Index build failed: ${depErr.message}`);
        }
      }

      const finalResult = {
        repoId,
        repositoryName: name,
        branch: 'main',
        status: scannedData.isEmpty ? 'Empty Repository' : 'Validated',
        ...scannedData,
        dependencyGraph
      };

      inMemoryRepoStore.set(repoId, finalResult);
      repoUploadService.setCurrentRepo(finalResult);

      return finalResult;
    } finally {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // ignore
        }
      }, 5000);
    }
  },

  /**
   * Process Local Folder path
   */
  processLocalFolder: async (folderPath, repositoryName) => {
    if (!folderPath || typeof folderPath !== 'string') {
      throw ApiError.badRequest('Local folder path must be a non-empty string');
    }

    const normalizedPath = path.normalize(folderPath);

    if (!fs.existsSync(normalizedPath)) {
      throw ApiError.notFound(`Local folder path does not exist: ${folderPath}`);
    }

    const stat = fs.statSync(normalizedPath);
    if (!stat.isDirectory()) {
      throw ApiError.badRequest(`Provided path is a file, not a directory: ${folderPath}`);
    }

    const name = repositoryName || path.basename(normalizedPath) || 'local-folder';
    logger.info(`Scanning local directory recursively at ${normalizedPath}`);

    const scannedData = scanDirectoryRecursively(normalizedPath);
    const repoId = `repo-${Date.now()}`;

    // Build and store Dependency Graph Index in memory
    let dependencyGraph = null;
    if (scannedData.files && scannedData.files.length > 0) {
      try {
        const depIndex = dependencyIndexBuilderService.buildIndex({
          repoId,
          repositoryName: name,
          files: scannedData.files,
          rootPath: normalizedPath
        });
        dependencyGraph = depIndex.toJSON();
      } catch (depErr) {
        logger.warn(`Dependency Index build failed: ${depErr.message}`);
      }
    }

    const finalResult = {
      repoId,
      repositoryName: name,
      branch: 'main',
      status: scannedData.isEmpty ? 'Empty Repository' : 'Validated',
      ...scannedData,
      dependencyGraph
    };

    inMemoryRepoStore.set(repoId, finalResult);
    repoUploadService.setCurrentRepo(finalResult);

    return finalResult;
  },

  /**
   * Process GitHub Repository URL (Live GitHub REST API with real clone fallback)
   */
  processGithubUrl: async (githubUrl, branch = 'main', repositoryName) => {
    if (!githubUrl || typeof githubUrl !== 'string') {
      throw ApiError.badRequest('GitHub repository URL is required');
    }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw ApiError.badRequest('Invalid GitHub URL format. Expected github.com/owner/repository');
    }

    const { owner, repo, branch: urlBranch } = parsed;
    const targetBranch = urlBranch || branch || 'main';
    const name = repositoryName || repo;

    logger.info(`Fetching live metadata from GitHub for repository '${owner}/${repo}' (branch: ${targetBranch})`);

    // 1. First attempt direct GitHub REST API (fetches live tree, real languages, exact file counts)
    try {
      const githubMeta = await fetchGitHubRepoDetails(owner, repo, targetBranch);
      const repoId = `repo-${owner}-${repo}`;

      let dependencyGraph = null;
      if (githubMeta.files && githubMeta.files.length > 0) {
        try {
          const depIndex = dependencyIndexBuilderService.buildIndex({
            repoId,
            repositoryName: name,
            files: githubMeta.files
          });
          dependencyGraph = depIndex.toJSON();
        } catch (depErr) {
          logger.warn(`Dependency Index build failed: ${depErr.message}`);
        }
      }

      const finalResult = {
        repoId,
        ...githubMeta,
        repositoryName: name,
        gitUrl: githubUrl,
        owner,
        fullName: `${owner}/${name}`,
        status: githubMeta.isEmpty ? 'Empty Repository' : 'Validated',
        dependencyGraph
      };

      inMemoryRepoStore.set(repoId, finalResult);
      repoUploadService.setCurrentRepo(finalResult);

      return finalResult;
    } catch (apiErr) {
      logger.warn(`GitHub REST API query failed for ${owner}/${repo}: ${apiErr.message}. Attempting simple-git clone...`);
      
      // If error explicitly indicates 404 / private repo, throw clean error
      if (apiErr.message && (apiErr.message.includes('not found') || apiErr.message.includes('private'))) {
        throw ApiError.notFound(`GitHub repository '${owner}/${repo}' was not found or is private. Please verify the URL or ensure the repository is public.`);
      }
    }

    // 2. Clone via simple-git if API query couldn't be fulfilled (e.g. rate limit)
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aegisblast-git-'));

    try {
      logger.info(`Cloning GitHub repository '${githubUrl}' (branch: ${targetBranch || 'default'}) into ${tempDir}`);
      
      const git = simpleGit();
      if (targetBranch && targetBranch !== 'auto' && targetBranch !== 'main' && targetBranch !== 'master') {
        try {
          await git.clone(githubUrl, tempDir, ['--depth', '1', '--branch', targetBranch]);
        } catch (branchErr) {
          logger.warn(`Branch '${targetBranch}' clone failed (${branchErr.message}), falling back to default remote branch...`);
          await git.clone(githubUrl, tempDir, ['--depth', '1']);
        }
      } else {
        await git.clone(githubUrl, tempDir, ['--depth', '1']);
      }

      const scannedData = scanDirectoryRecursively(tempDir);
      const repoId = `repo-${owner}-${repo}`;

      let dependencyGraph = null;
      if (scannedData.files && scannedData.files.length > 0) {
        try {
          const depIndex = dependencyIndexBuilderService.buildIndex({
            repoId,
            repositoryName: name,
            files: scannedData.files,
            rootPath: tempDir
          });
          dependencyGraph = depIndex.toJSON();
        } catch (depErr) {
          logger.warn(`Dependency Index build failed: ${depErr.message}`);
        }
      }

      const finalResult = {
        repoId,
        repositoryName: name,
        gitUrl: githubUrl,
        owner,
        fullName: `${owner}/${name}`,
        branch: targetBranch,
        status: scannedData.isEmpty ? 'Empty Repository' : 'Validated',
        ...scannedData,
        dependencyGraph
      };

      inMemoryRepoStore.set(repoId, finalResult);
      repoUploadService.setCurrentRepo(finalResult);

      return finalResult;
    } catch (cloneError) {
      logger.warn(`simple-git clone error for ${githubUrl}: ${cloneError.message}`);
      
      const errMsg = cloneError.message || '';
      // Check if clone failed because repository is empty
      if (errMsg.includes('Remote branch') || errMsg.includes('empty') || errMsg.includes('fatal: empty') || errMsg.includes('fatal: Couldn\'t find remote ref')) {
        const repoId = `repo-${owner}-${repo}`;
        const emptyResult = {
          repoId,
          repositoryName: name,
          gitUrl: githubUrl,
          owner,
          fullName: `${owner}/${name}`,
          branch: targetBranch,
          defaultBranch: targetBranch,
          repositoryVisibility: 'Public',
          owner,
          totalFiles: 0,
          totalFolders: 0,
          numberOfFiles: 0,
          numberOfFolders: 0,
          numberOfClasses: 0,
          numberOfInterfaces: 0,
          numberOfControllers: 0,
          numberOfServices: 0,
          numberOfRepositories: 0,
          numberOfApis: 0,
          numberOfComponents: 0,
          numberOfConfigFiles: 0,
          languages: [],
          primaryLanguage: 'None',
          frameworks: [],
          buildSystem: { name: 'None', packageManager: 'None', buildTool: 'None' },
          packageStructure: { topLevelPackages: [], packagesCount: 0, folders: [] },
          metrics: {
            numberOfFiles: 0,
            numberOfFolders: 0,
            numberOfClasses: 0,
            numberOfInterfaces: 0,
            numberOfControllers: 0,
            numberOfServices: 0,
            numberOfRepositories: 0,
            numberOfApis: 0,
            numberOfComponents: 0,
            numberOfConfigFiles: 0
          },
          totalSize: '0 KB',
          repositoryAge: 'Newly initialized',
          lastCommitDate: 'No commits yet',
          lastCommitAuthor: owner,
          ignoredFolders: [],
          languageDistribution: [],
          scannedFiles: [],
          fileList: [],
          isEmpty: true,
          emptyReason: 'This GitHub repository is empty (0 files, 0 commits).',
          status: 'Empty Repository',
          techStack: {
            frontendFramework: 'None detected',
            backendFramework: 'None detected',
            packageManager: 'None detected'
          },
          infrastructureDetection: {
            dockerfile: false,
            dockerCompose: false,
            githubActions: false,
            gitlabCi: false,
            jenkins: false,
            terraform: false,
            kubernetes: false,
            helmCharts: false,
            nginx: false,
            apache: false
          },
          databaseDetection: {
            mongodb: false,
            mysql: false,
            postgresql: false,
            sqlite: false,
            redis: false,
            supabase: false,
            firebase: false,
            prisma: false,
            drizzle: false,
            typeorm: false
          },
          authenticationDetection: {
            jwt: false,
            oauth: false,
            passportJs: false,
            firebaseAuth: false,
            supabaseAuth: false,
            nextAuth: false,
            clerk: false,
            auth0: false
          },
          testingDetection: {
            jest: false,
            vitest: false,
            pytest: false,
            junit: false,
            mocha: false,
            cypress: false,
            playwright: false,
            selenium: false
          },
          apiAnalysis: {
            restApis: 0,
            graphQlApis: 0,
            webSocketEndpoints: 0,
            gRpcServices: 0
          },
          projectStructure: {
            modules: 0,
            controllers: 0,
            services: 0,
            routes: 0,
            components: 0,
            hooks: 0,
            utilities: 0,
            configurations: 0
          },
          repositoryHealth: {
            completeness: 0,
            documentationScore: 0,
            dependencyHealth: 0,
            codeOrganization: 0,
            repositoryHealthScore: 0,
            healthStatus: 'Empty Repository (0 files)'
          },
          readinessChecklist: {
            repositoryUploaded: true,
            repositoryValidated: false,
            metadataGenerated: true,
            languageDetectionCompleted: true,
            dependencyGraphReady: false,
            astParserReady: false,
            readyForBlastAnalysis: false
          }
        };

        inMemoryRepoStore.set(repoId, emptyResult);
        repoUploadService.setCurrentRepo(emptyResult);
        return emptyResult;
      }

      throw ApiError.badRequest(`Failed to access GitHub repository '${githubUrl}': ${errMsg}`);
    } finally {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          // ignore
        }
      }, 5000);
    }
  }
};
