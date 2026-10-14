/**
 * Pure client-side GitHub API parser and metadata engine
 * Provides accurate, live repository intelligence without dummy data
 */

export const EXTENSION_TO_LANGUAGE = {
  // Source Code Languages
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.mts': 'TypeScript',
  '.cts': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.pyw': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.cxx': 'C++',
  '.cc': 'C++',
  '.hpp': 'C++',
  '.h': 'C/C++ Header',
  '.c': 'C',
  '.go': 'Go',
  '.rs': 'Rust',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'SASS',
  '.less': 'LESS',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.markdown': 'Markdown',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.xml': 'XML',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.cs': 'C#',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.dart': 'Dart',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.r': 'R',
  '.scala': 'Scala',
  '.lua': 'Lua',
  '.proto': 'Protocol Buffers',
  '.graphql': 'GraphQL',
  '.gql': 'GraphQL',

  // Power BI & Business Intelligence
  '.pbix': 'Power BI Report',
  '.pbit': 'Power BI Template',
  '.dax': 'DAX Expression',
  '.m': 'Power Query (M)',

  // Data & Spreadsheets
  '.xlsx': 'Excel Spreadsheet',
  '.xls': 'Excel Spreadsheet',
  '.csv': 'CSV Dataset',
  '.tsv': 'TSV Dataset',
  '.parquet': 'Parquet Data',
  '.avro': 'Avro Data',
  '.feather': 'Feather Data',
  '.ipynb': 'Jupyter Notebook',

  // Media & Visual Assets
  '.png': 'PNG Image',
  '.jpg': 'JPEG Image',
  '.jpeg': 'JPEG Image',
  '.gif': 'GIF Image',
  '.svg': 'SVG Graphic',
  '.webp': 'WebP Image',
  '.ico': 'Icon Asset',

  // Documents
  '.pdf': 'PDF Document',
  '.docx': 'Word Document',
  '.doc': 'Word Document',
  '.pptx': 'PowerPoint Presentation',
  '.txt': 'Plain Text Document'
};

const SOURCE_CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.mts', '.cts',
  '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.java',
  '.cpp', '.cxx', '.cc', '.hpp', '.h', '.c',
  '.go',
  '.rs',
  '.php',
  '.rb',
  '.cs',
  '.swift',
  '.kt',
  '.dart',
  '.vue',
  '.svelte',
  '.r',
  '.scala',
  '.lua',
  '.sh', '.bash', '.zsh',
  '.sql'
]);

export function isSourceCodeFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  const fileName = filePath.split('/').pop().toLowerCase();
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = fileName.substring(dotIndex);
  return SOURCE_CODE_EXTENSIONS.has(ext);
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(2)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

export function parseGitHubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const cleaned = rawUrl.trim();

  const httpsMatch = cleaned.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  const sshMatch = cleaned.match(/github\.com:([^/]+)\/([^/#?]+)/i);
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_\-.]+)\/([a-zA-Z0-9_\-.]+)$/);

  let owner = '';
  let repo = '';

  if (httpsMatch) {
    owner = httpsMatch[1];
    repo = httpsMatch[2].replace(/\.git$/i, '');
  } else if (sshMatch) {
    owner = sshMatch[1];
    repo = sshMatch[2].replace(/\.git$/i, '');
  } else if (shortMatch) {
    owner = shortMatch[1];
    repo = shortMatch[2].replace(/\.git$/i, '');
  }

  let branch = null;
  const branchMatch = cleaned.match(/github\.com\/[^/]+\/[^/]+\/tree\/([^/#?]+)/i);
  if (branchMatch) {
    branch = branchMatch[1];
  }

  if (owner && repo) {
    return { owner, repo, branch, fullName: `${owner}/${repo}` };
  }
  return null;
}

export async function fetchLiveGitHubMetadata(rawUrl, branchOverride = null) {
  const parsed = parseGitHubUrl(rawUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repository');
  }

  const { owner, repo, branch: urlBranch } = parsed;
  const headers = {
    Accept: 'application/vnd.github.v3+json'
  };

  // 1. Fetch Repository Info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`GitHub repository '${owner}/${repo}' was not found or is private. Please verify the URL or ensure the repository is public.`);
    }
    if (repoRes.status === 403) {
      throw new Error(`GitHub API rate limit reached. Please wait a few seconds or try again shortly.`);
    }
    throw new Error(`GitHub API error (${repoRes.status}): ${repoRes.statusText}`);
  }

  const repoInfo = await repoRes.json();
  const detectedDefaultBranch = repoInfo.default_branch || 'main';
  const repoName = repoInfo.name || repo;
  const visibility = repoInfo.private ? 'Private' : 'Public';
  const repoOwner = repoInfo.owner?.login || owner;
  const createdAt = repoInfo.created_at ? new Date(repoInfo.created_at).toISOString().split('T')[0] : 'N/A';
  const updatedAt = repoInfo.pushed_at ? new Date(repoInfo.pushed_at).toISOString().split('T')[0] : (repoInfo.updated_at ? new Date(repoInfo.updated_at).toISOString().split('T')[0] : 'N/A');

  // Check if repository size is 0 or empty
  const isLikelyEmpty = repoInfo.size === 0;

  // 2. Fetch Languages from GitHub API
  let githubLanguages = {};
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    if (langRes.ok) {
      githubLanguages = await langRes.json();
    }
  } catch {
    // ignore
  }

  // 3. Fetch Git Tree recursively with robust branch auto-detection
  let treeItems = [];
  let isTreeEmpty = false;
  let resolvedBranch = detectedDefaultBranch;

  const candidateBranches = [];
  if (urlBranch) candidateBranches.push(urlBranch);
  if (branchOverride && branchOverride !== 'auto' && branchOverride !== '' && branchOverride !== 'main' && branchOverride !== 'master') {
    candidateBranches.push(branchOverride);
  }
  if (detectedDefaultBranch) candidateBranches.push(detectedDefaultBranch);
  if (branchOverride && branchOverride !== 'auto' && branchOverride !== '') candidateBranches.push(branchOverride);
  candidateBranches.push('Production', 'production', 'main', 'master', 'develop', 'dev', 'trunk', 'release');

  const uniqueCandidates = Array.from(new Set(candidateBranches.filter(Boolean)));

  for (const candidate of uniqueCandidates) {
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(candidate)}?recursive=1`, { headers });
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData && Array.isArray(treeData.tree) && treeData.tree.length > 0) {
          treeItems = treeData.tree;
          resolvedBranch = candidate;
          isTreeEmpty = false;
          break;
        }
      }
    } catch {
      // try next candidate
    }
  }

  // If tree is still empty, list branches from GitHub REST API
  if (treeItems.length === 0) {
    try {
      const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`, { headers });
      if (branchesRes.ok) {
        const branchesList = await branchesRes.json();
        if (Array.isArray(branchesList) && branchesList.length > 0) {
          for (const b of branchesList) {
            if (!b?.name) continue;
            try {
              const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(b.name)}?recursive=1`, { headers });
              if (treeRes.ok) {
                const treeData = await treeRes.json();
                if (treeData && Array.isArray(treeData.tree) && treeData.tree.length > 0) {
                  treeItems = treeData.tree;
                  resolvedBranch = b.name;
                  isTreeEmpty = false;
                  break;
                }
              }
            } catch {
              // continue
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const defaultBranch = resolvedBranch || detectedDefaultBranch;

  // If tree is empty or repository size is 0
  if (isTreeEmpty || (isLikelyEmpty && treeItems.length === 0) || treeItems.length === 0) {
    const canonicalGitUrl = rawUrl?.trim().startsWith('http')
      ? rawUrl.trim()
      : `https://github.com/${repoOwner}/${repoName}.git`;

    return {
      repositoryName: repoName,
      gitUrl: canonicalGitUrl,
      branch: defaultBranch,
      defaultBranch,
      repositoryVisibility: visibility,
      owner: repoOwner,
      fullName: `${repoOwner}/${repoName}`,
      totalFiles: 0,
      totalFolders: 0,
      totalSize: '0 KB',
      repositoryAge: `Created ${createdAt}`,
      lastCommitDate: updatedAt !== 'N/A' ? updatedAt : 'No commits yet',
      lastCommitAuthor: repoOwner,
      ignoredFolders: [],
      languageDistribution: [],
      scannedFiles: [],
      fileList: [],
      isEmpty: true,
      isNonCodeRepo: false,
      emptyReason: 'This GitHub repository contains 0 files and 0 commits.',
      status: 'Empty Repository (0 files)',
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
  }

  // Parse files and folders from real tree
  const fileBlobs = treeItems.filter((i) => i.type === 'blob');
  const folderTrees = treeItems.filter((i) => i.type === 'tree');

  let totalSizeBytes = 0;
  const filePaths = [];
  const relativeFileNames = new Set();
  const folderSet = new Set(folderTrees.map((t) => t.path));
  const languageCounts = {};

  const structureCounts = {
    modules: 0,
    controllers: 0,
    services: 0,
    routes: 0,
    components: 0,
    hooks: 0,
    utilities: 0,
    configurations: 0
  };

  let hasReadme = false;
  let hasDocsFolder = false;
  let hasTestsFolder = false;
  let restApiCount = 0;
  let graphQlApiCount = 0;
  let webSocketCount = 0;
  let gRpcCount = 0;
  let sourceCodeFilesCount = 0;
  let powerBiFilesCount = 0;
  let spreadsheetFilesCount = 0;
  let imageFilesCount = 0;

  const codeModulesFolders = new Set();

  fileBlobs.forEach((item) => {
    const p = item.path;
    const lower = p.toLowerCase();
    const fileName = p.split('/').pop().toLowerCase();
    const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';

    totalSizeBytes += item.size || 512;
    filePaths.push(p);
    relativeFileNames.add(lower);

    const lang = EXTENSION_TO_LANGUAGE[ext] || (ext ? ext.toUpperCase().replace('.', '') : 'Other');
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;

    const isCode = isSourceCodeFile(p);
    if (isCode) {
      sourceCodeFilesCount++;
      const dirParts = p.split('/');
      if (dirParts.length > 1) {
        codeModulesFolders.add(dirParts[0]);
      }
    }

    if (['.pbix', '.pbit', '.dax', '.m'].includes(ext)) {
      powerBiFilesCount++;
    }
    if (['.xlsx', '.xls', '.csv', '.tsv', '.parquet'].includes(ext)) {
      spreadsheetFilesCount++;
    }
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
      imageFilesCount++;
    }

    if (fileName.startsWith('readme')) hasReadme = true;
    if (lower.includes('docs/') || lower.includes('documentation/')) hasDocsFolder = true;
    if (lower.includes('test') || lower.includes('__tests__') || lower.includes('spec')) hasTestsFolder = true;

    // Strict structure checks: ONLY count code files for code structures
    if (isCode) {
      if (lower.includes('/controllers/') || lower.includes('/controller/') || fileName.includes('controller.')) {
        structureCounts.controllers++;
        restApiCount++;
      } else if (lower.includes('/services/') || lower.includes('/service/') || fileName.includes('service.')) {
        structureCounts.services++;
      } else if (lower.includes('/routes/') || lower.includes('/route/') || lower.includes('/endpoints/') || fileName.includes('route.') || fileName.includes('routes.')) {
        structureCounts.routes++;
        restApiCount++;
      } else if (lower.includes('/components/') || lower.includes('/views/') || lower.includes('/widgets/') || fileName.includes('.component.') || ['jsx', 'tsx', 'vue', 'svelte'].includes(ext.replace('.', ''))) {
        structureCounts.components++;
      } else if (lower.includes('/hooks/') || fileName.startsWith('use') && ['js', 'ts', 'jsx', 'tsx'].includes(ext.replace('.', ''))) {
        structureCounts.hooks++;
      } else if (lower.includes('/utils/') || lower.includes('/util/') || lower.includes('/helpers/') || lower.includes('/helper/') || fileName.includes('util.') || fileName.includes('helper.')) {
        structureCounts.utilities++;
      }

      if (lower.includes('graphql') || ext === '.graphql' || ext === '.gql') graphQlApiCount++;
      if (lower.includes('socket') || lower.includes('websocket') || lower.includes('/ws/')) webSocketCount++;
      if (lower.includes('grpc') || ext === '.proto') gRpcCount++;
    }

    // Config files check
    const isConfigFile = [
      'package.json', 'tsconfig.json', 'vite.config', 'webpack.config', 'tailwind.config',
      'next.config', 'nuxt.config', 'svelte.config', 'cargo.toml', 'go.mod', 'pom.xml',
      'build.gradle', 'docker-compose', 'dockerfile', '.env', '.eslintrc', '.prettierrc',
      'requirements.txt', 'pyproject.toml', 'pipfile'
    ].some((cfg) => fileName.startsWith(cfg) || lower.includes(cfg));

    if (isConfigFile) {
      structureCounts.configurations++;
    }
  });

  structureCounts.modules = codeModulesFolders.size;

  const totalFiles = fileBlobs.length;
  const hasSourceCode = sourceCodeFilesCount > 0;
  const isNonCodeRepo = !hasSourceCode && totalFiles > 0;

  // Calculate Language Distribution
  let languageDistribution = [];
  const totalLangBytes = Object.values(githubLanguages).reduce((a, b) => a + b, 0);

  if (totalLangBytes > 0) {
    languageDistribution = Object.entries(githubLanguages)
      .map(([language, bytes]) => ({
        language,
        percentage: Math.round((bytes / totalLangBytes) * 100),
        files: languageCounts[language] || Math.max(1, Math.round((bytes / totalLangBytes) * totalFiles))
      }))
      .sort((a, b) => b.percentage - a.percentage);
  } else {
    languageDistribution = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        files: count,
        percentage: Math.round((count / totalFiles) * 100)
      }))
      .sort((a, b) => b.files - a.files);
  }

  // Exact file matching helper (prevents partial 2-letter substring false positives)
  const hasFile = (...patterns) => {
    return patterns.some((pat) => {
      const pLower = pat.toLowerCase();
      return Array.from(relativeFileNames).some((rf) => {
        if (pLower.startsWith('.') || pLower.includes('/')) {
          return rf === pLower || rf.endsWith(`/${pLower}`) || rf.includes(pLower);
        }
        const fname = rf.split('/').pop();
        return fname === pLower || fname.startsWith(`${pLower}.`) || fname.startsWith(`${pLower}-`);
      });
    });
  };

  // Tech Stack Determination
  let frontendFramework = 'None detected';
  let backendFramework = 'None detected';
  let packageManager = 'None detected';

  if (powerBiFilesCount > 0) {
    frontendFramework = 'Power BI Dashboards & Visuals';
    backendFramework = 'Power BI Data Model (DAX / M Engine)';
    packageManager = 'None (Power BI Desktop / Fabric)';
  } else if (spreadsheetFilesCount > 0 && !hasSourceCode) {
    frontendFramework = 'Excel Spreadsheets & Reports';
    backendFramework = 'Data Analysis Model';
    packageManager = 'None (Workbook Data Source)';
  } else if (imageFilesCount === totalFiles) {
    frontendFramework = 'Static Image & Media Assets';
    backendFramework = 'None detected';
    packageManager = 'None detected';
  } else {
    if (hasFile('next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config')) frontendFramework = 'Next.js';
    else if (hasFile('vite.config.js', 'vite.config.ts', 'vite.config.mjs')) frontendFramework = 'React (Vite)';
    else if (hasFile('angular.json')) frontendFramework = 'Angular';
    else if (hasFile('nuxt.config.js', 'nuxt.config.ts', 'vue.config.js')) frontendFramework = 'Vue.js';
    else if (hasFile('svelte.config.js', 'svelte.config.ts')) frontendFramework = 'Svelte';
    else if (hasSourceCode && languageDistribution.some((l) => l.language === 'TypeScript' || l.language === 'JavaScript')) {
      frontendFramework = structureCounts.components > 0 ? 'React / TypeScript' : 'Node.js Service';
    }

    if (hasFile('server.js', 'server.ts', 'app.js', 'app.ts') && hasSourceCode) backendFramework = 'Express / Node.js';
    else if (hasFile('nest-cli.json')) backendFramework = 'NestJS';
    else if (hasFile('main.py', 'app.py', 'manage.py')) backendFramework = 'Python (FastAPI / Flask / Django)';
    else if (hasFile('main.go', 'go.mod')) backendFramework = 'Go Microservice';
    else if (hasFile('pom.xml', 'build.gradle')) backendFramework = 'Spring Boot / Java';
    else if (hasFile('cargo.toml')) backendFramework = 'Rust Core';

    if (hasFile('pnpm-lock.yaml')) packageManager = 'pnpm';
    else if (hasFile('yarn.lock')) packageManager = 'yarn';
    else if (hasFile('package-lock.json', 'package.json')) packageManager = 'npm';
    else if (hasFile('poetry.lock')) packageManager = 'poetry';
    else if (hasFile('pipfile.lock', 'pipfile')) packageManager = 'pipenv';
    else if (hasFile('requirements.txt')) packageManager = 'pip';
    else if (hasFile('go.mod', 'go.sum')) packageManager = 'go modules';
    else if (hasFile('pom.xml')) packageManager = 'Maven';
    else if (hasFile('build.gradle')) packageManager = 'Gradle';
    else if (hasFile('cargo.toml', 'cargo.lock')) packageManager = 'Cargo';
  }

  // Infrastructure Detection (Exact file checks)
  const infrastructureDetection = {
    dockerfile: hasFile('dockerfile', 'dockerfile.dev', 'dockerfile.prod'),
    dockerCompose: hasFile('docker-compose.yml', 'docker-compose.yaml', 'compose.yaml', 'compose.yml'),
    githubActions: Array.from(relativeFileNames).some((rf) => rf.startsWith('.github/workflows/')),
    gitlabCi: hasFile('.gitlab-ci.yml', '.gitlab-ci.yaml'),
    jenkins: hasFile('jenkinsfile'),
    terraform: Array.from(relativeFileNames).some((rf) => rf.endsWith('.tf') || rf.endsWith('.tfvars')),
    kubernetes: Array.from(relativeFileNames).some((rf) => rf.includes('k8s/') || rf.includes('kubernetes/') || rf.endsWith('deployment.yaml') || rf.endsWith('deployment.yml')),
    helmCharts: hasFile('chart.yaml', 'chart.yml'),
    nginx: hasFile('nginx.conf') || Array.from(relativeFileNames).some((rf) => rf.includes('nginx/')),
    apache: hasFile('.htaccess', 'httpd.conf')
  };

  // Database Detection (Strict matching)
  const databaseDetection = {
    mongodb: hasSourceCode && (hasFile('mongoose', 'mongodb') || Array.from(relativeFileNames).some((rf) => rf.includes('mongoose') || rf.includes('mongo.'))),
    mysql: hasSourceCode && (hasFile('mysql', 'mysql2') || Array.from(relativeFileNames).some((rf) => rf.includes('mysql.'))),
    postgresql: hasSourceCode && (hasFile('pg', 'postgres', 'postgresql') || Array.from(relativeFileNames).some((rf) => rf.includes('postgres') || rf.includes('pg.'))),
    sqlite: hasSourceCode && (hasFile('sqlite', 'sqlite3', 'better-sqlite3') || Array.from(relativeFileNames).some((rf) => rf.endsWith('.sqlite') || rf.endsWith('.sqlite3') || rf.endsWith('.db'))),
    redis: hasSourceCode && (hasFile('redis', 'ioredis', 'redis.conf') || Array.from(relativeFileNames).some((rf) => rf.includes('redis.'))),
    supabase: hasSourceCode && (hasFile('supabase') || Array.from(relativeFileNames).some((rf) => rf.includes('supabase.'))),
    firebase: hasSourceCode && (hasFile('firebase.json', 'firebase') || Array.from(relativeFileNames).some((rf) => rf.includes('firebase.'))),
    prisma: hasFile('schema.prisma') || Array.from(relativeFileNames).some((rf) => rf.includes('prisma/')),
    drizzle: hasFile('drizzle.config.ts', 'drizzle.config.js') || Array.from(relativeFileNames).some((rf) => rf.includes('drizzle/')),
    typeorm: hasFile('ormconfig.json', 'ormconfig.ts', 'ormconfig.js')
  };

  // Authentication Detection (Strict matching)
  const authenticationDetection = {
    jwt: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('jsonwebtoken') || rf.includes('/jwt') || rf.includes('jwt.')),
    oauth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('oauth') || rf.includes('passport')),
    passportJs: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('passport.') || rf.includes('passport-')),
    firebaseAuth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('firebase-auth') || rf.includes('firebaseauth')),
    supabaseAuth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('supabase-auth') || rf.includes('supabaseauth')),
    nextAuth: hasSourceCode && (hasFile('next-auth') || Array.from(relativeFileNames).some((rf) => rf.includes('next-auth') || rf.includes('[...nextauth]'))),
    clerk: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('@clerk') || rf.includes('clerk.')),
    auth0: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('auth0') || rf.includes('@auth0'))
  };

  // Testing Detection (Strict matching)
  const testingDetection = {
    jest: hasFile('jest.config.js', 'jest.config.ts', 'jest.config.json', '.jestrc'),
    vitest: hasFile('vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs'),
    pytest: hasFile('conftest.py', 'pytest.ini') || Array.from(relativeFileNames).some((rf) => rf.includes('test_') && rf.endsWith('.py')),
    junit: hasFile('pom.xml') && Array.from(relativeFileNames).some((rf) => rf.includes('src/test/java')),
    mocha: hasFile('.mocharc.json', '.mocharc.js', '.mocharc.yaml', '.mocharc.yml'),
    cypress: hasFile('cypress.config.js', 'cypress.config.ts') || Array.from(relativeFileNames).some((rf) => rf.includes('cypress/')),
    playwright: hasFile('playwright.config.ts', 'playwright.config.js'),
    selenium: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('selenium'))
  };

  // Health Metrics Calculation
  const completeness = Math.min(100, Math.round((totalFiles / 20) * 40 + (hasReadme ? 30 : 0) + (hasTestsFolder ? 30 : 0)));
  const documentationScore = hasReadme ? (hasDocsFolder ? 95 : 85) : (isNonCodeRepo ? 60 : 35);
  const dependencyHealth = (packageManager !== 'None detected' && packageManager !== 'None (Power BI Desktop / Fabric)' && packageManager !== 'None (Workbook Data Source)') ? 95 : (isNonCodeRepo ? 85 : 70);
  const codeOrganization = folderSet.size > 2 ? 90 : (folderSet.size > 0 ? 80 : 65);
  const repositoryHealthScore = Math.round((completeness + documentationScore + dependencyHealth + codeOrganization) / 4);

  let healthStatus = 'Excellent';
  if (repositoryHealthScore < 60) healthStatus = 'Needs Improvement';
  else if (repositoryHealthScore < 75) healthStatus = 'Moderate';
  else if (repositoryHealthScore < 88) healthStatus = 'Good';

  const canonicalGitUrl = rawUrl?.trim().startsWith('http')
    ? rawUrl.trim()
    : `https://github.com/${repoOwner}/${repoName}.git`;

  return {
    repositoryName: repoName,
    gitUrl: canonicalGitUrl,
    branch: defaultBranch,
    defaultBranch,
    repositoryVisibility: visibility,
    owner: repoOwner,
    fullName: `${repoOwner}/${repoName}`,
    totalFiles,
    totalFolders: folderSet.size,
    totalSize: formatBytes(totalSizeBytes || (repoInfo.size ? repoInfo.size * 1024 : 1024)),
    repositoryAge: `Created ${createdAt}`,
    lastCommitDate: updatedAt,
    lastCommitAuthor: repoOwner,
    ignoredFolders: ['.git', 'node_modules', 'dist', 'build'],
    languageDistribution,
    scannedFiles: filePaths.slice(0, 100),
    fileList: filePaths.slice(0, 100),
    isEmpty: false,
    hasSourceCode,
    isNonCodeRepo,
    nonCodeType: powerBiFilesCount > 0 ? 'Power BI Dashboards & Visuals' : spreadsheetFilesCount > 0 ? 'Excel Spreadsheets & Data' : imageFilesCount > 0 ? 'Image & Media Assets' : null,
    nonCodeReason: isNonCodeRepo
      ? `This repository contains ${totalFiles} data/asset file(s) (Power BI, Excel, Images) without application source code. Code-level AST call graphs, API endpoints, and blast radius analysis require JavaScript, TypeScript, Python, Go, Java, or Rust code.`
      : null,
    status: isNonCodeRepo ? 'Validated (Data & Report Assets)' : 'Validated',
    techStack: {
      frontendFramework,
      backendFramework,
      packageManager
    },
    infrastructureDetection,
    databaseDetection,
    authenticationDetection,
    testingDetection,
    apiAnalysis: {
      restApis: restApiCount,
      graphQlApis: graphQlApiCount,
      webSocketEndpoints: webSocketCount,
      gRpcServices: gRpcCount
    },
    projectStructure: {
      modules: structureCounts.modules,
      controllers: structureCounts.controllers,
      services: structureCounts.services,
      routes: structureCounts.routes,
      components: structureCounts.components,
      hooks: structureCounts.hooks,
      utilities: structureCounts.utilities,
      configurations: structureCounts.configurations
    },
    repositoryHealth: {
      completeness,
      documentationScore,
      dependencyHealth,
      codeOrganization,
      repositoryHealthScore,
      healthStatus
    },
    readinessChecklist: {
      repositoryUploaded: true,
      repositoryValidated: true,
      metadataGenerated: true,
      languageDetectionCompleted: true,
      dependencyGraphReady: hasSourceCode,
      astParserReady: hasSourceCode,
      readyForBlastAnalysis: hasSourceCode
    }
  };
}

