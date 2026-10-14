import path from 'path';
import fs from 'fs';
import os from 'os';
import AdmZip from 'adm-zip';
import simpleGit from 'simple-git';
import { dependencyIndexBuilderService } from './dependencyIndexBuilderService.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Ignore patterns for standard build artifacts, dependencies, and VCS
 */
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'venv',
  '.venv',
  'env',
  '__pycache__',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'coverage',
  'target',
  'out',
  '.idea',
  '.vscode',
  'bin',
  'obj',
  '.turbo',
  '.cache'
]);

const IGNORED_FILES = new Set([
  '.ds_store',
  'thumbs.db',
  '.gitkeep',
  '.gitignore'
]);

/**
 * File extension to Programming Language mapping
 */
const EXTENSION_TO_LANGUAGE_MAP = {
  // TypeScript & JavaScript
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript (React)',
  '.mts': 'TypeScript',
  '.cts': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript (React)',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',

  // Python
  '.py': 'Python',
  '.pyw': 'Python',
  '.ipynb': 'Jupyter Notebook',

  // JVM Languages
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.scala': 'Scala',
  '.groovy': 'Groovy',

  // Systems & Compiled
  '.go': 'Go',
  '.rs': 'Rust',
  '.cpp': 'C++',
  '.cxx': 'C++',
  '.cc': 'C++',
  '.hpp': 'C++',
  '.h': 'C/C++ Header',
  '.c': 'C',
  '.cs': 'C#',
  '.swift': 'Swift',
  '.dart': 'Dart',

  // Web & Scripting
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.r': 'R',
  '.lua': 'Lua',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.ps1': 'PowerShell',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'SASS',
  '.less': 'LESS',
  '.sql': 'SQL',
  '.graphql': 'GraphQL',
  '.gql': 'GraphQL',
  '.proto': 'Protocol Buffers',

  // Config & Data
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.xml': 'XML',
  '.toml': 'TOML',
  '.md': 'Markdown',
  '.markdown': 'Markdown'
};

const SOURCE_CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.mts', '.cts',
  '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.java', '.kt', '.kts', '.scala', '.groovy',
  '.go', '.rs',
  '.cpp', '.cxx', '.cc', '.hpp', '.h', '.c',
  '.cs', '.swift', '.dart',
  '.php', '.rb', '.r', '.lua',
  '.vue', '.svelte',
  '.sh', '.bash', '.zsh', '.ps1',
  '.sql', '.graphql', '.gql', '.proto'
]);

/**
 * In-Memory Analysis Storage for scanned repositories
 */
class InMemoryRepositoryStore {
  constructor() {
    this.store = new Map(); // Map<repoId, analysisResult>
    this.activeRepoId = null;
    this.history = [];
  }

  set(repoId, analysisData) {
    if (!repoId || !analysisData) return;
    this.store.set(repoId, analysisData);
    this.activeRepoId = repoId;

    // Track in scan history
    const existingIndex = this.history.findIndex((h) => h.repoId === repoId);
    const historyItem = {
      repoId,
      repositoryName: analysisData.repositoryName,
      scannedAt: analysisData.scanMetadata?.scannedAt || new Date().toISOString(),
      numberOfFiles: analysisData.metrics?.numberOfFiles || 0,
      primaryLanguage: analysisData.primaryLanguage || 'Unknown',
      buildSystem: analysisData.buildSystem?.name || 'Unknown'
    };

    if (existingIndex >= 0) {
      this.history[existingIndex] = historyItem;
    } else {
      this.history.unshift(historyItem);
      if (this.history.length > 50) this.history.pop();
    }
  }

  get(repoId) {
    if (!repoId) return this.getActive();
    return this.store.get(repoId) || null;
  }

  getActive() {
    if (this.activeRepoId && this.store.has(this.activeRepoId)) {
      return this.store.get(this.activeRepoId);
    }
    // Fall back to most recent if active not explicitly set
    const keys = Array.from(this.store.keys());
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      return this.store.get(lastKey);
    }
    return null;
  }

  setActive(repoId) {
    if (this.store.has(repoId)) {
      this.activeRepoId = repoId;
      return true;
    }
    return false;
  }

  has(repoId) {
    return this.store.has(repoId);
  }

  getAll() {
    return Array.from(this.store.values());
  }

  getHistory() {
    return this.history;
  }

  clear(repoId) {
    if (repoId) {
      this.store.delete(repoId);
      if (this.activeRepoId === repoId) {
        const remaining = Array.from(this.store.keys());
        this.activeRepoId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      }
    } else {
      this.store.clear();
      this.activeRepoId = null;
      this.history = [];
    }
  }
}

// Global In-Memory Singleton Store
export const inMemoryRepoStore = new InMemoryRepositoryStore();

/**
 * Real Dynamic Repository Analysis Engine
 */
export class RepositoryAnalysisEngine {
  constructor() {
    this.store = inMemoryRepoStore;
  }

  /**
   * Check if a path should be ignored during scan
   */
  shouldIgnore(relativePath) {
    if (!relativePath) return true;
    const normalized = relativePath.replace(/\\/g, '/');
    const segments = normalized.split('/');
    for (const segment of segments) {
      const lower = segment.toLowerCase();
      if (IGNORED_DIRECTORIES.has(lower)) return true;
    }
    const fileName = segments[segments.length - 1].toLowerCase();
    if (IGNORED_FILES.has(fileName)) return true;
    return false;
  }

  /**
   * Format bytes to readable size
   */
  formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 0.1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  }

  /**
   * Main Dynamic Scan Entry Point - Scans the repository exactly once and caches in memory
   */
  async scanRepository({
    repoId = null,
    repositoryName = null,
    files = null,
    directoryPath = null,
    zipFile = null,
    githubUrl = null,
    branch = 'main',
    forceRescan = false
  }) {
    const scanStartTime = Date.now();
    const resolvedRepoId = repoId || `repo-${Date.now()}`;

    // Single-scan check: If already scanned and stored in memory, return cached analysis
    if (!forceRescan && this.store.has(resolvedRepoId)) {
      logger.info(`Repository '${resolvedRepoId}' already analyzed. Serving from in-memory cache.`);
      return this.store.get(resolvedRepoId);
    }

    let collectedFiles = [];
    let detectedRepoName = repositoryName;
    let sourceType = 'files';
    let totalSizeBytes = 0;

    // 1. Process from Local Directory Path
    if (directoryPath && fs.existsSync(directoryPath)) {
      sourceType = 'folder';
      detectedRepoName = detectedRepoName || path.basename(directoryPath);
      collectedFiles = this.readFilesFromDirectory(directoryPath);
    }
    // 2. Process from ZIP Archive
    else if (zipFile) {
      sourceType = 'zip';
      detectedRepoName = detectedRepoName || (zipFile.originalname ? zipFile.originalname.replace(/\.[^/.]+$/, '') : 'uploaded-zip');
      collectedFiles = this.readFilesFromZip(zipFile);
    }
    // 3. Process from GitHub Clone / API
    else if (githubUrl) {
      sourceType = 'github';
      const parsedName = githubUrl.split('/').pop().replace('.git', '') || 'github-repo';
      detectedRepoName = detectedRepoName || parsedName;
      collectedFiles = await this.readFilesFromGitHub(githubUrl, branch, detectedRepoName);
    }
    // 4. Process from in-memory File Array / Drop / JSON
    else if (files && Array.isArray(files)) {
      sourceType = 'files';
      detectedRepoName = detectedRepoName || (files.length === 1 ? (files[0].name || files[0].path || 'file').replace(/\.[^/.]+$/, '') : 'uploaded-project');
      collectedFiles = this.normalizeFileArray(files);
    } else {
      throw ApiError.badRequest('No valid repository input provided for analysis (expected files, folder path, ZIP, or GitHub URL)');
    }

    // Filter out ignored files
    const validFiles = collectedFiles.filter((f) => !this.shouldIgnore(f.path));
    totalSizeBytes = validFiles.reduce((acc, f) => acc + (f.sizeBytes || f.size || (f.content ? Buffer.byteLength(f.content, 'utf8') : 512)), 0);

    logger.info(`Analyzing repository '${detectedRepoName}' (${validFiles.length} files, ${this.formatBytes(totalSizeBytes)})`);

    // Execute single-pass dynamic extraction
    const analysisResult = this.performSinglePassAnalysis({
      repoId: resolvedRepoId,
      repositoryName: detectedRepoName || 'repository',
      files: validFiles,
      sourceType,
      totalSizeBytes,
      scanDurationMs: Date.now() - scanStartTime
    });

    // Store in memory
    this.store.set(resolvedRepoId, analysisResult);

    return analysisResult;
  }

  /**
   * Helper: Read all files recursively from a local directory
   */
  readFilesFromDirectory(dirPath) {
    const results = [];
    const traverse = (currentDir) => {
      let entries;
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch (e) {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(dirPath, fullPath).replace(/\\/g, '/');

        if (this.shouldIgnore(relativePath)) continue;

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            let content = '';
            // Only read content for source/config text files under 2MB
            if (stats.size < 2 * 1024 * 1024) {
              content = fs.readFileSync(fullPath, 'utf-8');
            }
            results.push({
              path: relativePath,
              name: entry.name,
              sizeBytes: stats.size,
              content
            });
          } catch (e) {
            results.push({
              path: relativePath,
              name: entry.name,
              sizeBytes: 1024,
              content: ''
            });
          }
        }
      }
    };

    traverse(dirPath);
    return results;
  }

  /**
   * Helper: Read all files from a ZIP archive
   */
  readFilesFromZip(zipFile) {
    const results = [];
    try {
      const zip = zipFile.buffer
        ? new AdmZip(zipFile.buffer)
        : new AdmZip(zipFile.path);

      const zipEntries = zip.getEntries();
      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;
        const entryPath = entry.entryName.replace(/\\/g, '/');
        if (this.shouldIgnore(entryPath)) continue;

        let content = '';
        if (entry.header.size < 2 * 1024 * 1024) {
          try {
            content = entry.getData().toString('utf8');
          } catch (e) {
            content = '';
          }
        }

        results.push({
          path: entryPath,
          name: path.basename(entryPath),
          sizeBytes: entry.header.size || 1024,
          content
        });
      }
    } catch (err) {
      logger.warn(`ZIP extraction error: ${err.message}`);
    }
    return results;
  }

  /**
   * Helper: Clone or fetch files from GitHub
   */
  async readFilesFromGitHub(githubUrl, branch = 'main', repoName = 'github-repo') {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `aegisblast-gh-${Date.now()}-`));
    try {
      logger.info(`Cloning GitHub repo '${githubUrl}' into ${tempDir}`);
      const git = simpleGit();
      await git.clone(githubUrl, tempDir, ['--depth', '1', '--branch', branch]);
      const files = this.readFilesFromDirectory(tempDir);
      return files;
    } catch (err) {
      logger.warn(`GitHub clone fallback failed: ${err.message}`);
      // Return minimal structured representation if clone failed
      return [
        { path: 'package.json', name: 'package.json', sizeBytes: 512, content: `{\n  "name": "${repoName}",\n  "version": "1.0.0"\n}` }
      ];
    } finally {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}
      }, 10000);
    }
  }

  /**
   * Helper: Normalize raw file array from client payload
   */
  normalizeFileArray(rawFiles) {
    return rawFiles.map((item) => {
      const filePath = (item.path || item.webkitRelativePath || item.name || item.filename || 'file.js').replace(/\\/g, '/');
      const name = path.basename(filePath);
      let content = typeof item.content === 'string' ? item.content : '';
      if (!content && item.buffer) {
        try {
          content = item.buffer.toString('utf8');
        } catch (e) {}
      }
      return {
        path: filePath,
        name,
        sizeBytes: item.size || item.sizeBytes || (content ? Buffer.byteLength(content, 'utf8') : 1024),
        content
      };
    });
  }

  /**
   * Perform Single-Pass Dynamic Analysis across all collected repository files
   */
  performSinglePassAnalysis({
    repoId,
    repositoryName,
    files = [],
    sourceType = 'files',
    totalSizeBytes = 0,
    scanDurationMs = 0
  }) {
    let finalRepoName = repositoryName;
    const folderSet = new Set();
    const languageFileCounts = {};
    const relativePathsSet = new Set();

    // Metrics counters
    let numberOfClasses = 0;
    let numberOfInterfaces = 0;
    let numberOfControllers = 0;
    let numberOfServices = 0;
    let numberOfRepositories = 0;
    let numberOfApis = 0;
    let numberOfComponents = 0;
    let numberOfConfigFiles = 0;

    // Detailed extracted lists
    const extractedClasses = [];
    const extractedInterfaces = [];
    const extractedControllers = [];
    const extractedServices = [];
    const extractedRepositories = [];
    const extractedApis = [];
    const extractedComponents = [];
    const extractedConfigFiles = [];

    // Manifests content map
    let packageJson = null;
    let pomXml = null;
    let buildGradle = null;
    let cargoToml = null;
    let goMod = null;
    let requirementsTxt = null;
    let pyprojectToml = null;

    // 1. Process files, track folders & manifests
    files.forEach((file) => {
      const relPath = file.path.replace(/\\/g, '/');
      relativePathsSet.add(relPath.toLowerCase());

      // Track all folder segments
      const segments = relPath.split('/');
      segments.pop(); // remove file name
      let currentFolder = '';
      for (const seg of segments) {
        if (seg && seg !== '.') {
          currentFolder = currentFolder ? `${currentFolder}/${seg}` : seg;
          folderSet.add(currentFolder);
        }
      }

      // Language tracking
      const ext = path.extname(relPath).toLowerCase();
      const language = EXTENSION_TO_LANGUAGE_MAP[ext] || (ext ? ext.toUpperCase().replace('.', '') : 'Plain Text');
      languageFileCounts[language] = (languageFileCounts[language] || 0) + 1;

      const fileName = path.basename(relPath).toLowerCase();
      const content = file.content || '';

      // Capture manifest files for build system & framework inspection
      if (fileName === 'package.json') {
        try {
          packageJson = JSON.parse(content || '{}');
          if (packageJson.name && (!finalRepoName || finalRepoName === 'uploaded-zip' || finalRepoName === 'uploaded-project' || finalRepoName === 'repository')) {
            finalRepoName = packageJson.name;
          }
        } catch (e) {}
      } else if (fileName === 'pom.xml') {
        pomXml = content;
        const nameMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/) || content.match(/<name>([^<]+)<\/name>/);
        if (nameMatch && (!finalRepoName || finalRepoName === 'repository')) {
          finalRepoName = nameMatch[1];
        }
      } else if (fileName === 'build.gradle' || fileName === 'build.gradle.kts') {
        buildGradle = content;
      } else if (fileName === 'cargo.toml') {
        cargoToml = content;
        const nameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
        if (nameMatch && (!finalRepoName || finalRepoName === 'repository')) {
          finalRepoName = nameMatch[1];
        }
      } else if (fileName === 'go.mod') {
        goMod = content;
        const modMatch = content.match(/module\s+([^\s\n\r]+)/);
        if (modMatch && (!finalRepoName || finalRepoName === 'repository')) {
          finalRepoName = modMatch[1].split('/').pop();
        }
      } else if (fileName === 'requirements.txt') {
        requirementsTxt = content;
      } else if (fileName === 'pyproject.toml') {
        pyprojectToml = content;
      }

      // Check if file is a configuration file
      const isConfig = this.isConfigurationFile(relPath, fileName);
      if (isConfig) {
        numberOfConfigFiles++;
        extractedConfigFiles.push({
          name: fileName,
          path: relPath,
          sizeBytes: file.sizeBytes || 512
        });
      }

      // Check if file is a source code file for AST & entity parsing
      const isSourceCode = SOURCE_CODE_EXTENSIONS.has(ext);
      if (isSourceCode) {
        const fileAnalysis = this.analyzeSourceCodeFile(relPath, fileName, ext, content);

        // Aggregate Classes
        if (fileAnalysis.classes.length > 0) {
          numberOfClasses += fileAnalysis.classes.length;
          extractedClasses.push(...fileAnalysis.classes);
        }

        // Aggregate Interfaces
        if (fileAnalysis.interfaces.length > 0) {
          numberOfInterfaces += fileAnalysis.interfaces.length;
          extractedInterfaces.push(...fileAnalysis.interfaces);
        }

        // Aggregate Controllers
        if (fileAnalysis.isController || fileAnalysis.controllers.length > 0) {
          const count = Math.max(1, fileAnalysis.controllers.length);
          numberOfControllers += count;
          if (fileAnalysis.controllers.length > 0) {
            extractedControllers.push(...fileAnalysis.controllers);
          } else {
            extractedControllers.push({
              name: path.basename(relPath, ext),
              file: relPath,
              type: 'Controller Module'
            });
          }
        }

        // Aggregate Services
        if (fileAnalysis.isService || fileAnalysis.services.length > 0) {
          const count = Math.max(1, fileAnalysis.services.length);
          numberOfServices += count;
          if (fileAnalysis.services.length > 0) {
            extractedServices.push(...fileAnalysis.services);
          } else {
            extractedServices.push({
              name: path.basename(relPath, ext),
              file: relPath,
              type: 'Service Module'
            });
          }
        }

        // Aggregate Repositories (Data Access Layer)
        if (fileAnalysis.isRepository || fileAnalysis.repositories.length > 0) {
          const count = Math.max(1, fileAnalysis.repositories.length);
          numberOfRepositories += count;
          if (fileAnalysis.repositories.length > 0) {
            extractedRepositories.push(...fileAnalysis.repositories);
          } else {
            extractedRepositories.push({
              name: path.basename(relPath, ext),
              file: relPath,
              type: 'Data Repository'
            });
          }
        }

        // Aggregate APIs / Endpoints
        if (fileAnalysis.apis.length > 0) {
          numberOfApis += fileAnalysis.apis.length;
          extractedApis.push(...fileAnalysis.apis);
        }

        // Aggregate Components
        if (fileAnalysis.isComponent || fileAnalysis.components.length > 0) {
          const count = Math.max(1, fileAnalysis.components.length);
          numberOfComponents += count;
          if (fileAnalysis.components.length > 0) {
            extractedComponents.push(...fileAnalysis.components);
          } else {
            extractedComponents.push({
              name: path.basename(relPath, ext),
              file: relPath,
              framework: fileAnalysis.componentFramework || 'UI Component'
            });
          }
        }
      }
    });

    const numberOfFiles = files.length;
    const numberOfFolders = folderSet.size;

    // 2. Extract Programming Language(s) & Distribution
    const languages = Object.entries(languageFileCounts)
      .map(([name, count]) => ({
        name,
        files: count,
        percentage: numberOfFiles > 0 ? Math.round((count / numberOfFiles) * 100) : 0,
        isSourceCode: Array.from(SOURCE_CODE_EXTENSIONS).some((e) => EXTENSION_TO_LANGUAGE_MAP[e] === name)
      }))
      .sort((a, b) => b.files - a.files);

    const sourceLanguages = languages.filter((l) => l.isSourceCode);
    const primaryLanguage = sourceLanguages.length > 0 ? sourceLanguages[0].name : (languages.length > 0 ? languages[0].name : 'Unknown');

    // 3. Extract Framework(s) dynamically
    const frameworks = this.detectFrameworks({
      packageJson,
      pomXml,
      buildGradle,
      cargoToml,
      goMod,
      requirementsTxt,
      pyprojectToml,
      relativePathsSet,
      extractedComponents,
      extractedControllers
    });

    // 4. Extract Build System dynamically
    const buildSystem = this.detectBuildSystem({
      packageJson,
      pomXml,
      buildGradle,
      cargoToml,
      goMod,
      requirementsTxt,
      pyprojectToml,
      relativePathsSet
    });

    // 5. Extract Package Structure dynamically
    const packageStructure = this.detectPackageStructure({
      files,
      folderSet,
      numberOfFiles,
      numberOfFolders
    });

    // Construct the complete, unified Repository Analysis Payload
    return {
      repositoryName: finalRepoName || 'analyzed-repository',
      languages,
      primaryLanguage,
      frameworks,
      buildSystem,
      packageStructure,
      metrics: {
        numberOfFiles,
        numberOfFolders,
        numberOfClasses,
        numberOfInterfaces,
        numberOfControllers,
        numberOfServices,
        numberOfRepositories,
        numberOfApis,
        numberOfComponents,
        numberOfConfigFiles
      },
      extractedElements: {
        classes: extractedClasses.slice(0, 200),
        interfaces: extractedInterfaces.slice(0, 200),
        controllers: extractedControllers.slice(0, 200),
        services: extractedServices.slice(0, 200),
        repositories: extractedRepositories.slice(0, 200),
        apis: extractedApis.slice(0, 200),
        components: extractedComponents.slice(0, 200),
        configFiles: extractedConfigFiles.slice(0, 100)
      },
      dependencyGraph: (() => {
        try {
          if (files && files.length > 0) {
            const index = dependencyIndexBuilderService.buildIndex({
              repoId,
              repositoryName: finalRepoName,
              files
            });
            return index.toJSON();
          }
        } catch (e) {
          logger.warn(`Dependency Index build warning: ${e.message}`);
        }
        return null;
      })(),
      scanMetadata: {
        scanId: `scan-${Date.now()}`,
        repoId,
        scannedOnce: true,
        scannedAt: new Date().toISOString(),
        scanDurationMs,
        sourceType,
        totalSizeBytes,
        formattedSize: this.formatBytes(totalSizeBytes),
        isEmpty: numberOfFiles === 0
      }
    };
  }

  /**
   * Helper: Check if a file path is a configuration file
   */
  isConfigurationFile(relPath, fileName) {
    const lowerName = fileName.toLowerCase();
    const lowerPath = relPath.toLowerCase();

    const configNames = [
      'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'turbo.json',
      'tsconfig.json', 'jsconfig.json', 'angular.json', 'nest-cli.json',
      'vite.config', 'webpack.config', 'next.config', 'nuxt.config', 'svelte.config', 'astro.config', 'remix.config',
      'tailwind.config', 'postcss.config', 'babel.config',
      '.eslintrc', 'eslint.config', '.prettierrc', 'prettier.config',
      'jest.config', 'vitest.config', 'playwright.config', 'cypress.config',
      'cargo.toml', 'cargo.lock', 'go.mod', 'go.sum', 'pom.xml', 'build.gradle', 'settings.gradle',
      'docker-compose', 'dockerfile', 'compose.yaml', 'compose.yml',
      'requirements.txt', 'pyproject.toml', 'pipfile', 'setup.py', 'setup.cfg',
      'makefile', 'cmakelists.txt',
      'firebase.json', 'vercel.json', 'netlify.toml', 'serverless.yml', 'drizzle.config'
    ];

    if (lowerName.startsWith('.env')) return true;
    if (lowerPath.startsWith('.github/workflows/')) return true;

    return configNames.some((cfg) => lowerName.startsWith(cfg) || lowerName.includes(cfg));
  }

  /**
   * Helper: AST & Regex Parser to extract classes, interfaces, controllers, services, repositories, APIs, components from code
   */
  analyzeSourceCodeFile(filePath, fileName, ext, content = '') {
    const lowerPath = filePath.toLowerCase();
    const lowerName = fileName.toLowerCase();

    const classes = [];
    const interfaces = [];
    const controllers = [];
    const services = [];
    const repositories = [];
    const apis = [];
    const components = [];

    let isController = false;
    let isService = false;
    let isRepository = false;
    let isComponent = false;
    let componentFramework = null;

    // Check directory / filename heuristics
    if (lowerPath.includes('/controllers/') || lowerPath.includes('/controller/') || lowerName.includes('controller.')) {
      isController = true;
    }
    if (lowerPath.includes('/services/') || lowerPath.includes('/service/') || lowerName.includes('service.') || lowerPath.includes('/usecases/')) {
      isService = true;
    }
    if (
      lowerPath.includes('/repos/') || lowerPath.includes('/repository/') || lowerPath.includes('/repositories/') ||
      lowerPath.includes('/dao/') || lowerPath.includes('/daos/') || lowerName.includes('repository.') || lowerName.includes('dao.') ||
      lowerPath.includes('/models/') || lowerPath.includes('/model/') || lowerPath.includes('/schemas/') || lowerPath.includes('/schema/') || lowerPath.includes('/entities/')
    ) {
      isRepository = true;
    }
    if (
      lowerPath.includes('/components/') || lowerPath.includes('/views/') || lowerPath.includes('/widgets/') || lowerPath.includes('/ui/') ||
      lowerPath.includes('/layouts/') || lowerPath.includes('/pages/') || lowerName.includes('.component.') || lowerName.includes('.view.')
    ) {
      isComponent = true;
    }

    if (ext === '.vue') {
      isComponent = true;
      componentFramework = 'Vue';
    } else if (ext === '.svelte') {
      isComponent = true;
      componentFramework = 'Svelte';
    } else if (['.jsx', '.tsx'].includes(ext)) {
      isComponent = true;
      componentFramework = 'React';
    }

    if (!content) {
      return {
        classes,
        interfaces,
        controllers,
        services,
        repositories,
        apis,
        components,
        isController,
        isService,
        isRepository,
        isComponent,
        componentFramework
      };
    }

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('#')) {
        return;
      }

      // 1. Extract Classes (JS/TS, Python, Java, C#, C++, PHP, Go struct, Rust struct)
      const classMatch = trimmed.match(/(?:export\s+(?:default\s+)?)?(?:public|private|protected|abstract|final|data\s+)?class\s+([A-Za-z0-9_$]+)/) ||
                         trimmed.match(/^class\s+([A-Za-z0-9_$]+)(?:\([^)]*\))?:/) ||
                         trimmed.match(/type\s+([A-Za-z0-9_$]+)\s+struct\b/) ||
                         trimmed.match(/(?:pub\s+)?struct\s+([A-Za-z0-9_$]+)\b/);

      if (classMatch) {
        const className = classMatch[1];
        classes.push({
          name: className,
          file: filePath,
          line: lineNum
        });

        // Controller classification
        if (className.toLowerCase().endsWith('controller') || trimmed.includes('@Controller') || trimmed.includes('@RestController')) {
          isController = true;
          controllers.push({ name: className, file: filePath, line: lineNum, type: 'Class Controller' });
        }
        // Service classification
        if (className.toLowerCase().endsWith('service') || className.toLowerCase().endsWith('usecase') || trimmed.includes('@Service') || trimmed.includes('@Injectable')) {
          isService = true;
          services.push({ name: className, file: filePath, line: lineNum, type: 'Class Service' });
        }
        // Repository classification
        if (className.toLowerCase().endsWith('repository') || className.toLowerCase().endsWith('dao') || className.toLowerCase().endsWith('model') || trimmed.includes('@Repository') || trimmed.includes('@Entity')) {
          isRepository = true;
          repositories.push({ name: className, file: filePath, line: lineNum, type: 'Data Repository' });
        }
      }

      // 2. Extract Interfaces (TS, Java, Go, Rust trait, PHP)
      const ifaceMatch = trimmed.match(/(?:export\s+)?(?:public|private|protected)?\s*interface\s+([A-Za-z0-9_$]+)/) ||
                         trimmed.match(/type\s+([A-Za-z0-9_$]+)\s+interface\b/) ||
                         trimmed.match(/(?:pub\s+)?trait\s+([A-Za-z0-9_$]+)\b/);
      if (ifaceMatch) {
        interfaces.push({
          name: ifaceMatch[1],
          file: filePath,
          line: lineNum
        });
      }

      // 3. Extract APIs / Endpoints (REST, GraphQL, WebSockets, gRPC)
      // Express / Koa / Fastify / Node routes: router.get('/path'), app.post('/path')
      const expressRouteMatch = trimmed.match(/(?:router|app|server)\.(get|post|put|delete|patch|options|head)\(['"]([^'"]+)['"]/i);
      if (expressRouteMatch) {
        apis.push({
          method: expressRouteMatch[1].toUpperCase(),
          path: expressRouteMatch[2],
          file: filePath,
          line: lineNum,
          type: 'REST (Express/Node)'
        });
      }

      // NestJS / Spring Decorators: @Get('/path'), @PostMapping('/path')
      const decoratorRouteMatch = trimmed.match(/@(Get|Post|Put|Delete|Patch|GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\s*\(\s*['"]?([^'")\s]*)['"]?/i);
      if (decoratorRouteMatch) {
        const method = decoratorRouteMatch[1].toUpperCase().replace('MAPPING', '');
        apis.push({
          method: method === 'REQUEST' ? 'ALL' : method,
          path: decoratorRouteMatch[2] || '/',
          file: filePath,
          line: lineNum,
          type: 'REST (Decorator)'
        });
      }

      // Python FastAPI / Flask routes: @app.get('/path'), @router.post('/path')
      const pyRouteMatch = trimmed.match(/@(?:app|router|api)\.(get|post|put|delete|patch|route)\(['"]([^'"]+)['"]/i);
      if (pyRouteMatch) {
        apis.push({
          method: pyRouteMatch[1].toUpperCase(),
          path: pyRouteMatch[2],
          file: filePath,
          line: lineNum,
          type: 'REST (Python)'
        });
      }

      // Go (Gin / Echo / Chi): r.GET('/path', handler)
      const goRouteMatch = trimmed.match(/(?:r|router|e|g|app)\.(GET|POST|PUT|DELETE|PATCH)\(['"]([^'"]+)['"]/);
      if (goRouteMatch) {
        apis.push({
          method: goRouteMatch[1].toUpperCase(),
          path: goRouteMatch[2],
          file: filePath,
          line: lineNum,
          type: 'REST (Go)'
        });
      }

      // GraphQL queries & mutations
      if (trimmed.match(/type\s+(?:Query|Mutation)\s*\{/) || trimmed.match(/extend\s+type\s+(?:Query|Mutation)/) || trimmed.match(/@(Query|Mutation)\(/)) {
        apis.push({
          method: 'GRAPHQL',
          path: trimmed.slice(0, 40),
          file: filePath,
          line: lineNum,
          type: 'GraphQL Operation'
        });
      }

      // gRPC RPC definition
      const grpcMatch = trimmed.match(/rpc\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*returns/);
      if (grpcMatch) {
        apis.push({
          method: 'RPC',
          path: grpcMatch[1],
          file: filePath,
          line: lineNum,
          type: 'gRPC Service Method'
        });
      }

      // 4. Extract React / UI Components
      if (['.jsx', '.tsx', '.js', '.ts'].includes(ext)) {
        const compMatch = trimmed.match(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][A-Za-z0-9_$]*)\s*(?:=\s*(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>|\([^)]*\)\s*\{)/);
        if (compMatch && (lowerPath.includes('component') || lowerPath.includes('view') || lowerPath.includes('ui') || lowerPath.includes('widget') || trimmed.includes('<') || ext === '.tsx' || ext === '.jsx')) {
          isComponent = true;
          componentFramework = componentFramework || 'React';
          components.push({
            name: compMatch[1],
            file: filePath,
            line: lineNum,
            framework: componentFramework
          });
        }
      }
    });

    return {
      classes,
      interfaces,
      controllers,
      services,
      repositories,
      apis,
      components,
      isController,
      isService,
      isRepository,
      isComponent,
      componentFramework
    };
  }

  /**
   * Helper: Detect Frameworks dynamically from dependencies, configs, and AST
   */
  detectFrameworks({
    packageJson,
    pomXml,
    buildGradle,
    cargoToml,
    goMod,
    requirementsTxt,
    pyprojectToml,
    relativePathsSet,
    extractedComponents,
    extractedControllers
  }) {
    const frameworks = [];
    const addedNames = new Set();

    const addFramework = (name, type, confidence = 100, source = 'manifest') => {
      if (!addedNames.has(name)) {
        addedNames.add(name);
        frameworks.push({ name, type, confidence, source });
      }
    };

    // Node / JS / TS ecosystem dependencies
    const allNpmDeps = new Set();
    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      Object.entries(deps).forEach(([depName, ver]) => {
        allNpmDeps.add(depName.toLowerCase());
      });
    }

    const hasNpm = (...names) => names.some((n) => allNpmDeps.has(n.toLowerCase()));
    const hasPath = (...paths) => paths.some((p) => {
      const pLower = p.toLowerCase();
      return Array.from(relativePathsSet).some((rf) => rf === pLower || rf.endsWith(`/${pLower}`) || rf.includes(pLower));
    });

    // Frontend UI Frameworks
    if (hasNpm('next') || hasPath('next.config.js', 'next.config.ts', 'next.config.mjs')) addFramework('Next.js', 'frontend', 100, 'manifest');
    if (hasNpm('react', 'react-dom') || hasPath('vite.config.js', 'vite.config.ts') && extractedComponents.length > 0) addFramework('React', 'frontend', 100, 'manifest');
    if (hasNpm('@angular/core') || hasPath('angular.json')) addFramework('Angular', 'frontend', 100, 'manifest');
    if (hasNpm('vue') || hasPath('nuxt.config.js', 'vue.config.js')) addFramework('Vue', 'frontend', 100, 'manifest');
    if (hasNpm('svelte', '@sveltejs/kit') || hasPath('svelte.config.js')) addFramework('Svelte', 'frontend', 100, 'manifest');
    if (hasNpm('tailwindcss') || hasPath('tailwind.config.js', 'tailwind.config.ts')) addFramework('Tailwind CSS', 'css', 100, 'config');

    // Backend Node Frameworks
    if (hasNpm('express') || hasPath('server.js', 'app.js') && extractedControllers.length > 0) addFramework('Express', 'backend', 100, 'manifest');
    if (hasNpm('@nestjs/core') || hasPath('nest-cli.json')) addFramework('NestJS', 'backend', 100, 'manifest');
    if (hasNpm('fastify')) addFramework('Fastify', 'backend', 100, 'manifest');
    if (hasNpm('koa')) addFramework('Koa', 'backend', 100, 'manifest');
    if (hasNpm('hono')) addFramework('Hono', 'backend', 100, 'manifest');

    // ORMs & Database Frameworks
    if (hasNpm('@prisma/client', 'prisma') || hasPath('schema.prisma')) addFramework('Prisma ORM', 'orm', 100, 'manifest');
    if (hasNpm('drizzle-orm') || hasPath('drizzle.config.ts', 'drizzle.config.js')) addFramework('Drizzle ORM', 'orm', 100, 'manifest');
    if (hasNpm('typeorm') || hasPath('ormconfig.json')) addFramework('TypeORM', 'orm', 100, 'manifest');
    if (hasNpm('mongoose')) addFramework('Mongoose', 'orm', 100, 'manifest');

    // Java / Spring Frameworks
    if (pomXml || buildGradle) {
      const jvmContent = (pomXml || '') + (buildGradle || '');
      if (jvmContent.includes('spring-boot') || jvmContent.includes('org.springframework')) addFramework('Spring Boot', 'backend', 100, 'manifest');
      if (jvmContent.includes('hibernate')) addFramework('Hibernate / JPA', 'orm', 100, 'manifest');
      if (jvmContent.includes('quarkus')) addFramework('Quarkus', 'backend', 100, 'manifest');
    }

    // Python Frameworks
    if (requirementsTxt || pyprojectToml) {
      const pyContent = (requirementsTxt || '') + (pyprojectToml || '');
      if (pyContent.toLowerCase().includes('fastapi')) addFramework('FastAPI', 'backend', 100, 'manifest');
      if (pyContent.toLowerCase().includes('flask')) addFramework('Flask', 'backend', 100, 'manifest');
      if (pyContent.toLowerCase().includes('django')) addFramework('Django', 'fullstack', 100, 'manifest');
      if (pyContent.toLowerCase().includes('sqlalchemy')) addFramework('SQLAlchemy', 'orm', 100, 'manifest');
    }

    // Go Frameworks
    if (goMod) {
      if (goMod.includes('github.com/gin-gonic/gin')) addFramework('Gin', 'backend', 100, 'manifest');
      if (goMod.includes('github.com/labstack/echo')) addFramework('Echo', 'backend', 100, 'manifest');
      if (goMod.includes('github.com/gofiber/fiber')) addFramework('Fiber', 'backend', 100, 'manifest');
      if (goMod.includes('gorm.io/gorm')) addFramework('GORM', 'orm', 100, 'manifest');
    }

    // Rust Frameworks
    if (cargoToml) {
      if (cargoToml.includes('actix-web')) addFramework('Actix Web', 'backend', 100, 'manifest');
      if (cargoToml.includes('axum')) addFramework('Axum', 'backend', 100, 'manifest');
      if (cargoToml.includes('rocket')) addFramework('Rocket', 'backend', 100, 'manifest');
      if (cargoToml.includes('diesel')) addFramework('Diesel', 'orm', 100, 'manifest');
      if (cargoToml.includes('tokio')) addFramework('Tokio Async Engine', 'backend', 100, 'manifest');
    }

    // Testing Frameworks
    if (hasNpm('jest') || hasPath('jest.config.js', 'jest.config.ts')) addFramework('Jest', 'testing', 100, 'config');
    if (hasNpm('vitest') || hasPath('vitest.config.ts', 'vitest.config.js')) addFramework('Vitest', 'testing', 100, 'config');
    if (hasNpm('@playwright/test') || hasPath('playwright.config.ts')) addFramework('Playwright', 'testing', 100, 'config');
    if (hasNpm('cypress') || hasPath('cypress.config.js', 'cypress.config.ts')) addFramework('Cypress', 'testing', 100, 'config');
    if (hasPath('conftest.py', 'pytest.ini')) addFramework('Pytest', 'testing', 100, 'config');

    // Default fallback if components/controllers were detected
    if (frameworks.length === 0) {
      if (extractedComponents.length > 0) addFramework('React / UI Components', 'frontend', 85, 'ast');
      if (extractedControllers.length > 0) addFramework('Node.js / Custom Router', 'backend', 85, 'ast');
    }

    return frameworks;
  }

  /**
   * Helper: Detect Build System dynamically
   */
  detectBuildSystem({
    packageJson,
    pomXml,
    buildGradle,
    cargoToml,
    goMod,
    requirementsTxt,
    pyprojectToml,
    relativePathsSet
  }) {
    const hasPath = (...paths) => paths.some((p) => {
      const pLower = p.toLowerCase();
      return Array.from(relativePathsSet).some((rf) => rf === pLower || rf.endsWith(`/${pLower}`) || rf.includes(pLower));
    });

    let name = 'Custom / Standard Runtime';
    let buildTool = 'None';
    let packageManager = 'None';
    let configFile = null;
    const scripts = [];

    // Check JavaScript / Node Build Systems
    if (packageJson) {
      if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach((s) => scripts.push(s));
      }

      if (hasPath('vite.config.ts', 'vite.config.js', 'vite.config.mjs')) {
        buildTool = 'Vite';
        configFile = 'vite.config.ts';
      } else if (hasPath('webpack.config.js', 'webpack.config.ts')) {
        buildTool = 'Webpack';
        configFile = 'webpack.config.js';
      } else if (hasPath('next.config.js', 'next.config.ts', 'next.config.mjs')) {
        buildTool = 'Next.js Compiler (SWC)';
        configFile = 'next.config.js';
      } else if (hasPath('turbo.json')) {
        buildTool = 'Turborepo';
        configFile = 'turbo.json';
      } else {
        buildTool = 'Node.js Build Script';
      }

      if (hasPath('pnpm-lock.yaml')) packageManager = 'pnpm';
      else if (hasPath('yarn.lock')) packageManager = 'yarn';
      else if (hasPath('bun.lockb', 'bun.lock')) packageManager = 'bun';
      else if (hasPath('package-lock.json') || packageJson) packageManager = 'npm';

      name = `${buildTool} (${packageManager})`;
    }
    // Maven
    else if (pomXml || hasPath('pom.xml')) {
      name = 'Maven';
      buildTool = 'Apache Maven';
      packageManager = 'Maven Repository';
      configFile = 'pom.xml';
    }
    // Gradle
    else if (buildGradle || hasPath('build.gradle', 'build.gradle.kts')) {
      name = 'Gradle';
      buildTool = 'Gradle Build Tool';
      packageManager = 'Gradle / Maven Central';
      configFile = 'build.gradle';
    }
    // Cargo (Rust)
    else if (cargoToml || hasPath('cargo.toml')) {
      name = 'Cargo';
      buildTool = 'Cargo (rustc)';
      packageManager = 'crates.io';
      configFile = 'Cargo.toml';
    }
    // Go Modules
    else if (goMod || hasPath('go.mod')) {
      name = 'Go Modules';
      buildTool = 'Go Toolchain (go build)';
      packageManager = 'Go Proxy';
      configFile = 'go.mod';
    }
    // Python (Poetry / Pip)
    else if (pyprojectToml || hasPath('pyproject.toml', 'poetry.lock')) {
      name = 'Poetry (Python)';
      buildTool = 'Poetry';
      packageManager = 'PyPI';
      configFile = 'pyproject.toml';
    } else if (requirementsTxt || hasPath('requirements.txt')) {
      name = 'Pip (Python)';
      buildTool = 'setuptools / pip';
      packageManager = 'PyPI';
      configFile = 'requirements.txt';
    } else if (hasPath('makefile', 'Makefile')) {
      name = 'GNU Make';
      buildTool = 'Make';
      packageManager = 'System / Native';
      configFile = 'Makefile';
    } else if (hasPath('cmakelists.txt')) {
      name = 'CMake';
      buildTool = 'CMake';
      packageManager = 'Native Toolchain';
      configFile = 'CMakeLists.txt';
    }

    return {
      name,
      buildTool,
      packageManager,
      configFile,
      scripts
    };
  }

  /**
   * Helper: Detect Package Structure & Module Hierarchy dynamically
   */
  detectPackageStructure({ files = [], folderSet = new Set(), numberOfFiles = 0, numberOfFolders = 0 }) {
    const topLevelPackages = new Set();
    const directoryTree = {};
    let maxDepth = 1;

    files.forEach((file) => {
      const relPath = file.path.replace(/\\/g, '/');
      const parts = relPath.split('/');

      if (parts.length > 1) {
        topLevelPackages.add(parts[0]);
        maxDepth = Math.max(maxDepth, parts.length);
      }

      // Build hierarchical folder mapping
      let currentLevel = directoryTree;
      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i];
        if (!currentLevel[folder]) {
          currentLevel[folder] = {
            type: 'directory',
            children: {},
            filesCount: 0
          };
        }
        currentLevel[folder].filesCount++;
        currentLevel = currentLevel[folder].children;
      }
    });

    const topLevelList = Array.from(topLevelPackages);

    // Determine layout archetype
    let layoutType = 'modular';
    if (topLevelList.includes('packages') || topLevelList.includes('apps') || topLevelList.includes('workspaces') || (topLevelList.includes('frontend') && topLevelList.includes('backend'))) {
      layoutType = 'monorepo';
    } else if (topLevelList.includes('controllers') || topLevelList.includes('services') || topLevelList.includes('routes') || topLevelList.includes('models')) {
      layoutType = 'layered';
    } else if (numberOfFolders <= 2 || maxDepth <= 2) {
      layoutType = 'flat';
    }

    return {
      root: '/',
      topLevelPackages: topLevelList,
      packagesCount: folderSet.size,
      depth: maxDepth,
      layoutType,
      folders: Array.from(folderSet)
    };
  }
}

// Singleton Engine Instance
export const repositoryAnalysisEngine = new RepositoryAnalysisEngine();
export const repositoryAnalysisEngineService = repositoryAnalysisEngine;
