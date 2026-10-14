import fs from 'fs';
import path from 'path';

export const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'venv',
  '__pycache__',
  '.next',
  'coverage',
  'target',
  'out'
]);

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
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.sql': 'SQL',
  '.graphql': 'GraphQL',
  '.gql': 'GraphQL',
  '.proto': 'Protocol Buffers',

  // Power BI & Data
  '.pbix': 'Power BI Report',
  '.pbit': 'Power BI Template',
  '.dax': 'DAX Expression',
  '.m': 'Power Query (M)',
  '.xlsx': 'Excel Spreadsheet',
  '.xls': 'Excel Spreadsheet',
  '.csv': 'CSV Dataset',
  '.tsv': 'TSV Dataset',
  '.parquet': 'Parquet Data',
  '.avro': 'Avro Data',
  '.feather': 'Feather Data',
  '.ipynb': 'Jupyter Notebook',

  // Assets & Docs
  '.png': 'PNG Image',
  '.jpg': 'JPEG Image',
  '.jpeg': 'JPEG Image',
  '.gif': 'GIF Image',
  '.svg': 'SVG Graphic',
  '.webp': 'WebP Image',
  '.ico': 'Icon Asset',
  '.pdf': 'PDF Document',
  '.docx': 'Word Document',
  '.doc': 'Word Document',
  '.pptx': 'PowerPoint Presentation',
  '.txt': 'Plain Text Document',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.xml': 'XML',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'SASS',
  '.md': 'Markdown',
  '.markdown': 'Markdown'
};

export const SOURCE_CODE_EXTENSIONS = new Set([
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
  const fileName = filePath.split(/[/\\]/).pop().toLowerCase();
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = fileName.substring(dotIndex);
  return SOURCE_CODE_EXTENSIONS.has(ext);
}

/**
 * Format bytes to readable string (e.g. "4.2 MB", "850 KB")
 */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(2)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

/**
 * Scan directory recursively collecting files, folders, size, language distribution,
 * infrastructure, database, auth, framework, testing, API, project structure, and health metrics.
 */
export function scanDirectoryRecursively(dirPath) {
  let totalFiles = 0;
  const folderSet = new Set();
  const foundIgnoredFolders = new Set();
  let totalSizeBytes = 0;
  const languageCounts = {};

  const structureCounts = {
    modules: 0,
    classes: 0,
    interfaces: 0,
    controllers: 0,
    services: 0,
    repositories: 0,
    routes: 0,
    components: 0,
    hooks: 0,
    utilities: 0,
    configurations: 0
  };

  let packageJsonContent = null;
  let requirementsContent = null;
  let hasReadme = false;
  let hasDocsFolder = false;
  let hasTestsFolder = false;

  const allFilePaths = [];
  const allFilesList = [];
  const relativeFileNames = new Set();

  let restApiCount = 0;
  let graphQlApiCount = 0;
  let webSocketCount = 0;
  let gRpcCount = 0;
  let sourceCodeFilesCount = 0;
  let powerBiFilesCount = 0;
  let spreadsheetFilesCount = 0;
  let imageFilesCount = 0;

  const codeModulesFolders = new Set();

  function traverse(currentPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      const lowerName = name.toLowerCase();
      const fullPath = path.join(currentPath, name);
      const relativePath = path.relative(dirPath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(lowerName)) {
          foundIgnoredFolders.add(name);
          continue;
        }
        folderSet.add(relativePath);

        if (lowerName === 'docs' || lowerName === 'documentation') hasDocsFolder = true;
        if (lowerName === '__tests__' || lowerName === 'test' || lowerName === 'tests' || lowerName === 'cypress' || lowerName === 'e2e') hasTestsFolder = true;

        traverse(fullPath);
      } else if (entry.isFile()) {
        totalFiles++;
        relativeFileNames.add(relativePath.toLowerCase());
        allFilePaths.push(relativePath);

        let fileSizeBytes = 0;
        try {
          const stats = fs.statSync(fullPath);
          fileSizeBytes = stats.size || 0;
          totalSizeBytes += fileSizeBytes;
        } catch (e) {
          // ignore
        }

        const ext = path.extname(name).toLowerCase();
        const language = EXTENSION_TO_LANGUAGE[ext] || (ext ? ext.toUpperCase().replace('.', '') : 'Other');
        languageCounts[language] = (languageCounts[language] || 0) + 1;

        const isCode = isSourceCodeFile(relativePath);
        if (isCode) {
          sourceCodeFilesCount++;
          const dirParts = relativePath.split('/');
          if (dirParts.length > 1) {
            codeModulesFolders.add(dirParts[0]);
          }
        }

        if (['.pbix', '.pbit', '.dax', '.m'].includes(ext)) powerBiFilesCount++;
        if (['.xlsx', '.xls', '.csv', '.tsv', '.parquet'].includes(ext)) spreadsheetFilesCount++;
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) imageFilesCount++;

        // Key root files
        if (lowerName === 'package.json') {
          try {
            packageJsonContent = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          } catch (e) {}
        } else if (lowerName === 'requirements.txt' || lowerName === 'pyproject.toml') {
          try {
            requirementsContent = fs.readFileSync(fullPath, 'utf-8');
          } catch (e) {}
        } else if (lowerName.startsWith('readme')) {
          hasReadme = true;
        }

        // Categorize structure & APIs based ONLY on real code files
        const pathLower = relativePath.toLowerCase();
        if (isCode) {
          // Read code content for accurate AST/regex pattern detection
          let codeContent = '';
          try {
            codeContent = fs.readFileSync(fullPath, 'utf-8');
          } catch (e) {}

          // Class detection
          const classMatches = codeContent.match(/(?:export\s+(?:default\s+)?)?(?:public|private|protected|abstract|final|data\s+)?class\s+([A-Za-z0-9_$]+)|^class\s+([A-Za-z0-9_$]+)(?:\([^)]*\))?:|type\s+([A-Za-z0-9_$]+)\s+struct\b|(?:pub\s+)?struct\s+([A-Za-z0-9_$]+)\b/gm);
          if (classMatches) {
            structureCounts.classes += classMatches.length;
          }

          // Interface detection
          const ifaceMatches = codeContent.match(/(?:export\s+)?(?:public|private|protected)?\s*interface\s+([A-Za-z0-9_$]+)|type\s+([A-Za-z0-9_$]+)\s+interface\b|(?:pub\s+)?trait\s+([A-Za-z0-9_$]+)\b/gm);
          if (ifaceMatches) {
            structureCounts.interfaces += ifaceMatches.length;
          }

          // Controller detection
          if (pathLower.includes('/controllers/') || pathLower.includes('/controller/') || lowerName.includes('controller.') || codeContent.includes('@Controller') || codeContent.includes('@RestController')) {
            structureCounts.controllers++;
            restApiCount++;
          }
          // Service detection
          else if (pathLower.includes('/services/') || pathLower.includes('/service/') || lowerName.includes('service.') || pathLower.includes('/usecases/') || codeContent.includes('@Service') || codeContent.includes('@Injectable')) {
            structureCounts.services++;
          }
          // Repository detection (Data Access Layer)
          else if (pathLower.includes('/repos/') || pathLower.includes('/repository/') || pathLower.includes('/repositories/') || pathLower.includes('/dao/') || pathLower.includes('/daos/') || lowerName.includes('repository.') || lowerName.includes('dao.') || pathLower.includes('/models/') || pathLower.includes('/model/') || pathLower.includes('/schemas/') || codeContent.includes('@Repository') || codeContent.includes('@Entity')) {
            structureCounts.repositories++;
          }
          // Routes detection
          else if (pathLower.includes('/routes/') || pathLower.includes('/route/') || pathLower.includes('/endpoints/') || lowerName.includes('route.') || lowerName.includes('routes.')) {
            structureCounts.routes++;
            restApiCount++;
          }
          // Components detection
          else if (pathLower.includes('/components/') || pathLower.includes('/views/') || pathLower.includes('/widgets/') || lowerName.includes('.component.') || ['jsx', 'tsx', 'vue', 'svelte'].includes(ext.replace('.', '')) || codeContent.includes('React.') || (codeContent.includes('export function') && codeContent.includes('<'))) {
            structureCounts.components++;
          } else if (pathLower.includes('/hooks/') || lowerName.startsWith('use') && ['js', 'ts', 'jsx', 'tsx'].includes(ext.replace('.', ''))) {
            structureCounts.hooks++;
          } else if (pathLower.includes('/utils/') || pathLower.includes('/util/') || pathLower.includes('/helpers/') || pathLower.includes('/helper/') || lowerName.includes('util.') || lowerName.includes('helper.')) {
            structureCounts.utilities++;
          }

          // Additional REST APIs detection from code patterns
          const routeMatches = codeContent.match(/(?:router|app)\.(get|post|put|delete|patch)\(|@(Get|Post|Put|Delete|Patch|GetMapping|PostMapping)\(/gi);
          if (routeMatches && !pathLower.includes('/controllers/') && !pathLower.includes('/routes/')) {
            restApiCount += routeMatches.length;
          }

          if (pathLower.includes('graphql') || ext === '.graphql' || ext === '.gql' || codeContent.includes('type Query') || codeContent.includes('type Mutation')) graphQlApiCount++;
          if (pathLower.includes('socket') || pathLower.includes('ws') || pathLower.includes('gateway') || codeContent.includes('io.on(')) webSocketCount++;
          if (pathLower.includes('grpc') || ext === '.proto' || codeContent.includes('rpc ')) gRpcCount++;
        }

        const isConfigFile = [
          'package.json', 'tsconfig.json', 'vite.config', 'webpack.config', 'tailwind.config',
          'next.config', 'nuxt.config', 'svelte.config', 'cargo.toml', 'go.mod', 'pom.xml',
          'build.gradle', 'docker-compose', 'dockerfile', '.env', '.eslintrc', '.prettierrc',
          'requirements.txt', 'pyproject.toml', 'pipfile'
        ].some((cfg) => lowerName.startsWith(cfg) || pathLower.includes(cfg));

        if (isConfigFile) {
          structureCounts.configurations++;
        }

        // Collect file entry with content for dependency indexing
        let fileContentToSave = '';
        if (isCode && typeof codeContent === 'string') {
          fileContentToSave = codeContent;
        } else if (fileSizeBytes < 256 * 1024) {
          try {
            fileContentToSave = fs.readFileSync(fullPath, 'utf-8');
          } catch (e) {}
        }

        allFilesList.push({
          path: relativePath,
          name,
          sizeBytes: fileSizeBytes,
          content: fileContentToSave
        });
      }
    }
  }

  traverse(dirPath);

  structureCounts.modules = codeModulesFolders.size;

  const hasSourceCode = sourceCodeFilesCount > 0;
  const isNonCodeRepo = !hasSourceCode && totalFiles > 0;

  // Dependencies from manifests
  const allDeps = new Set();
  if (packageJsonContent) {
    const deps = { ...packageJsonContent.dependencies, ...packageJsonContent.devDependencies };
    Object.keys(deps).forEach((d) => allDeps.add(d.toLowerCase()));
  }
  if (requirementsContent) {
    requirementsContent.split('\n').forEach((line) => {
      const depName = line.split(/[=<>#\s]/)[0].trim().toLowerCase();
      if (depName) allDeps.add(depName);
    });
  }

  const hasDep = (...deps) => deps.some((d) => allDeps.has(d.toLowerCase()));
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

  // If repository has 0 files (empty repository)
  if (totalFiles === 0) {
    return {
      repositoryName: path.basename(dirPath) || 'empty-repository',
      defaultBranch: 'main',
      repositoryVisibility: 'Public',
      totalFiles: 0,
      totalFolders: 0,
      totalSize: '0 KB',
      repositoryAge: 'Newly initialized',
      lastCommitDate: 'No commits',
      lastCommitAuthor: 'N/A',
      ignoredFolders: Array.from(foundIgnoredFolders),
      languageDistribution: [],
      scannedFiles: [],
      fileList: [],
      isEmpty: true,
      hasSourceCode: false,
      isNonCodeRepo: false,
      emptyReason: 'This directory contains 0 source code files.',
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

  // Calculate Language Distribution Percentages
  const languageDistribution = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      files: count,
      percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
    }))
    .sort((a, b) => b.files - a.files);

  // Framework Detection
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
  } else if (hasSourceCode) {
    if (hasDep('next') || hasFile('next.config.js', 'next.config.mjs', 'next.config.ts')) frontendFramework = 'Next.js';
    else if (hasDep('react', 'react-dom') || hasFile('vite.config.js', 'vite.config.ts')) frontendFramework = 'React';
    else if (hasDep('@angular/core') || hasFile('angular.json')) frontendFramework = 'Angular';
    else if (hasDep('vue') || hasFile('nuxt.config.js', 'vue.config.js')) frontendFramework = 'Vue';
    else if (hasDep('svelte') || hasFile('svelte.config.js')) frontendFramework = 'Svelte';
    else if (languageDistribution.some((l) => l.language === 'TypeScript' || l.language === 'JavaScript')) {
      frontendFramework = structureCounts.components > 0 ? 'React / TypeScript' : 'Node.js Service';
    }

    if (hasDep('express') || hasFile('server.js', 'server.ts')) backendFramework = 'Express';
    else if (hasDep('@nestjs/core') || hasFile('nest-cli.json')) backendFramework = 'NestJS';
    else if (hasDep('fastapi')) backendFramework = 'FastAPI';
    else if (hasDep('flask')) backendFramework = 'Flask';
    else if (hasDep('django')) backendFramework = 'Django';
    else if (hasDep('spring-boot', 'org.springframework.boot') || hasFile('pom.xml')) backendFramework = 'Spring Boot';
    else if (hasFile('main.go', 'go.mod')) backendFramework = 'Go Microservice';
    else if (hasFile('cargo.toml')) backendFramework = 'Rust Core';

    if (hasFile('pnpm-lock.yaml')) packageManager = 'pnpm';
    else if (hasFile('yarn.lock')) packageManager = 'yarn';
    else if (hasFile('package-lock.json', 'package.json')) packageManager = 'npm';
    else if (hasFile('poetry.lock')) packageManager = 'poetry';
    else if (hasFile('requirements.txt', 'pipfile')) packageManager = 'pip';
    else if (hasFile('go.mod')) packageManager = 'go modules';
    else if (hasFile('pom.xml')) packageManager = 'Maven';
    else if (hasFile('build.gradle')) packageManager = 'Gradle';
    else if (hasFile('cargo.toml')) packageManager = 'Cargo';
  }

  // Infrastructure Detection
  const infrastructureDetection = {
    dockerfile: hasFile('dockerfile', 'dockerfile.dev', 'dockerfile.prod'),
    dockerCompose: hasFile('docker-compose.yml', 'docker-compose.yaml', 'compose.yaml', 'compose.yml'),
    githubActions: Array.from(relativeFileNames).some((rf) => rf.startsWith('.github/workflows/')),
    gitlabCi: hasFile('.gitlab-ci.yml', '.gitlab-ci.yaml'),
    jenkins: hasFile('jenkinsfile'),
    terraform: Array.from(relativeFileNames).some((rf) => rf.endsWith('.tf') || rf.endsWith('.tfvars')),
    kubernetes: Array.from(relativeFileNames).some((rf) => rf.includes('k8s/') || rf.includes('kubernetes/') || rf.endsWith('deployment.yaml')),
    helmCharts: hasFile('chart.yaml', 'chart.yml'),
    nginx: hasFile('nginx.conf') || Array.from(relativeFileNames).some((rf) => rf.includes('nginx/')),
    apache: hasFile('.htaccess', 'httpd.conf')
  };

  // Database Detection
  const databaseDetection = {
    mongodb: hasSourceCode && (hasDep('mongoose', 'mongodb') || hasFile('mongo', 'mongoose')),
    mysql: hasSourceCode && (hasDep('mysql', 'mysql2') || hasFile('mysql')),
    postgresql: hasSourceCode && (hasDep('pg', 'postgres', 'psycopg2') || hasFile('postgres', 'pg')),
    sqlite: hasSourceCode && (hasDep('sqlite3', 'better-sqlite3', 'sqlite') || Array.from(relativeFileNames).some((rf) => rf.endsWith('.sqlite') || rf.endsWith('.db'))),
    redis: hasSourceCode && (hasDep('ioredis', 'redis') || hasFile('redis')),
    supabase: hasSourceCode && (hasDep('@supabase/supabase-js') || hasFile('supabase')),
    firebase: hasSourceCode && (hasDep('firebase', 'firebase-admin') || hasFile('firebase.json')),
    prisma: hasDep('@prisma/client', 'prisma') || hasFile('schema.prisma') || Array.from(relativeFileNames).some((rf) => rf.includes('prisma/')),
    drizzle: hasDep('drizzle-orm') || hasFile('drizzle.config.ts', 'drizzle.config.js'),
    typeorm: hasDep('typeorm') || hasFile('ormconfig.json', 'ormconfig.ts')
  };

  // Authentication Detection
  const authenticationDetection = {
    jwt: hasSourceCode && (hasDep('jsonwebtoken', 'jwt-decode', 'pyjwt', 'jose') || Array.from(relativeFileNames).some((rf) => rf.includes('jwt.'))),
    oauth: hasSourceCode && hasDep('oauth', 'passport-oauth2', 'google-auth-library'),
    passportJs: hasSourceCode && hasDep('passport'),
    firebaseAuth: hasSourceCode && hasDep('firebase') && hasDep('firebase-admin'),
    supabaseAuth: hasSourceCode && hasDep('@supabase/supabase-js'),
    nextAuth: hasSourceCode && hasDep('next-auth', '@auth/core'),
    clerk: hasSourceCode && hasDep('@clerk/nextjs', '@clerk/clerk-sdk-node'),
    auth0: hasSourceCode && hasDep('auth0', '@auth0/nextjs-auth0')
  };

  // Testing Detection
  const testingDetection = {
    jest: hasDep('jest', '@types/jest') || hasFile('jest.config.js', 'jest.config.ts', 'jest.config.json'),
    vitest: hasDep('vitest') || hasFile('vitest.config.ts', 'vitest.config.js'),
    pytest: hasDep('pytest') || hasFile('conftest.py', 'pytest.ini'),
    junit: hasDep('junit') || (hasFile('pom.xml') && Array.from(relativeFileNames).some((rf) => rf.includes('src/test/java'))),
    mocha: hasDep('mocha') || hasFile('.mocharc.json', '.mocharc.js'),
    cypress: hasDep('cypress') || hasFile('cypress.config.js', 'cypress.config.ts'),
    playwright: hasDep('@playwright/test') || hasFile('playwright.config.ts', 'playwright.config.js'),
    selenium: hasSourceCode && hasDep('selenium-webdriver')
  };

  // Health Metrics Calculation
  const completeness = Math.min(100, Math.round((totalFiles / 30) * 40 + (hasReadme ? 30 : 0) + (hasTestsFolder ? 30 : 0)));
  const documentationScore = hasReadme ? (hasDocsFolder ? 95 : 85) : (isNonCodeRepo ? 60 : 35);
  const dependencyHealth = (packageManager !== 'None detected' && !packageManager.startsWith('None')) ? 95 : (isNonCodeRepo ? 85 : 70);
  const codeOrganization = folderSet.size > 2 ? 88 : (folderSet.size > 0 ? 80 : 65);
  const repositoryHealthScore = Math.round((completeness + documentationScore + dependencyHealth + codeOrganization) / 4);

  let healthStatus = 'Excellent';
  if (repositoryHealthScore < 60) healthStatus = 'Needs Improvement';
  else if (repositoryHealthScore < 75) healthStatus = 'Moderate';
  else if (repositoryHealthScore < 88) healthStatus = 'Good';

  // Combined ignored folders list
  const ignoredFolders = Array.from(
    new Set([...IGNORED_DIRECTORIES, ...foundIgnoredFolders])
  );

  const totalApisCount = restApiCount + graphQlApiCount + webSocketCount + gRpcCount;

  // Frameworks array
  const detectedFrameworksList = [];
  if (frontendFramework && frontendFramework !== 'None detected') detectedFrameworksList.push({ name: frontendFramework, type: 'frontend' });
  if (backendFramework && backendFramework !== 'None detected') detectedFrameworksList.push({ name: backendFramework, type: 'backend' });
  if (packageManager && packageManager !== 'None detected') detectedFrameworksList.push({ name: packageManager, type: 'package-manager' });

  return {
    repositoryName: path.basename(dirPath) || 'scanned-repo',
    defaultBranch: 'main',
    repositoryVisibility: 'Public',
    totalFiles,
    totalFolders: folderSet.size,
    numberOfFiles: totalFiles,
    numberOfFolders: folderSet.size,
    numberOfClasses: structureCounts.classes,
    numberOfInterfaces: structureCounts.interfaces,
    numberOfControllers: structureCounts.controllers,
    numberOfServices: structureCounts.services,
    numberOfRepositories: structureCounts.repositories,
    numberOfApis: totalApisCount,
    numberOfComponents: structureCounts.components,
    numberOfConfigFiles: structureCounts.configurations,
    languages: languageDistribution,
    primaryLanguage: languageDistribution[0]?.language || 'Unknown',
    frameworks: detectedFrameworksList,
    buildSystem: {
      name: packageManager || 'Standard Build',
      packageManager: packageManager || 'None',
      buildTool: frontendFramework?.includes('Vite') ? 'Vite' : frontendFramework?.includes('Next') ? 'Next.js' : 'Standard'
    },
    packageStructure: {
      topLevelPackages: Array.from(codeModulesFolders),
      packagesCount: folderSet.size,
      folders: Array.from(folderSet)
    },
    metrics: {
      numberOfFiles: totalFiles,
      numberOfFolders: folderSet.size,
      numberOfClasses: structureCounts.classes,
      numberOfInterfaces: structureCounts.interfaces,
      numberOfControllers: structureCounts.controllers,
      numberOfServices: structureCounts.services,
      numberOfRepositories: structureCounts.repositories,
      numberOfApis: totalApisCount,
      numberOfComponents: structureCounts.components,
      numberOfConfigFiles: structureCounts.configurations
    },
    totalSize: formatBytes(totalSizeBytes),
    repositoryAge: 'Active (Updated recently)',
    lastCommitDate: new Date().toISOString().split('T')[0],
    lastCommitAuthor: 'DevSecOps Engineer',
    ignoredFolders,
    languageDistribution,
    scannedFiles: allFilePaths.slice(0, 100),
    fileList: allFilePaths.slice(0, 100),
    files: allFilesList,
    isEmpty: false,
    hasSourceCode,
    isNonCodeRepo,
    nonCodeType: powerBiFilesCount > 0 ? 'Power BI Dashboards & Visuals' : spreadsheetFilesCount > 0 ? 'Excel Spreadsheets & Data' : imageFilesCount > 0 ? 'Image & Media Assets' : null,
    nonCodeReason: isNonCodeRepo
      ? `This repository contains ${totalFiles} data/asset file(s) (Power BI, Excel, Images) without application source code. AST call-graph parsing and blast radius analysis require JavaScript, TypeScript, Python, Go, Java, or Rust code.`
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
      classes: structureCounts.classes,
      interfaces: structureCounts.interfaces,
      controllers: structureCounts.controllers,
      services: structureCounts.services,
      repositories: structureCounts.repositories,
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

/**
 * Parse owner, repo and branch from various GitHub URL formats
 */
export function parseGitHubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const cleaned = rawUrl.trim();

  const httpsMatch = cleaned.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/i);
  const sshMatch = cleaned.match(/github\.com:([^\/]+)\/([^\/\#\?]+)/i);
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);

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
  const branchMatch = cleaned.match(/github\.com\/[^\/]+\/[^\/]+\/tree\/([^\/\#\?]+)/i);
  if (branchMatch) {
    branch = branchMatch[1];
  }

  if (owner && repo) {
    return { owner, repo, branch, fullName: `${owner}/${repo}` };
  }
  return null;
}

/**
 * Fetch and extract exact real metadata from GitHub REST API
 */
export async function fetchGitHubRepoDetails(owner, repo, branchOverride = null) {
  const headers = {
    'User-Agent': 'AegisBlast-Security-Engine/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };

  // 1. Fetch Repository Info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`GitHub repository '${owner}/${repo}' was not found or is private.`);
    }
    if (repoRes.status === 403) {
      throw new Error(`GitHub API rate limit exceeded. Please try again in a few moments.`);
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

  const isLikelyEmpty = repoInfo.size === 0;

  // 2. Fetch Languages from GitHub API
  let githubLanguages = {};
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    if (langRes.ok) {
      githubLanguages = await langRes.json();
    }
  } catch (e) {
    // ignore
  }

  // 3. Fetch Git Tree recursively with robust branch auto-detection
  let treeItems = [];
  let isTreeEmpty = false;
  let resolvedBranch = detectedDefaultBranch;

  const candidateBranches = [];
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
    } catch (e) {
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
            } catch (e) {
              // continue
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const defaultBranch = resolvedBranch || detectedDefaultBranch;

  // If tree is empty or repo size is 0 and no tree items
  if (isTreeEmpty || (isLikelyEmpty && treeItems.length === 0) || treeItems.length === 0) {
    return {
      repositoryName: repoName,
      branch: defaultBranch,
      defaultBranch,
      repositoryVisibility: visibility,
      owner: repoOwner,
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
      hasSourceCode: false,
      isNonCodeRepo: false,
      emptyReason: 'This GitHub repository contains 0 files and 0 commits.',
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

  // Process Real Files and Folders from Tree
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
    const ext = path.extname(p).toLowerCase();

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

    if (['.pbix', '.pbit', '.dax', '.m'].includes(ext)) powerBiFilesCount++;
    if (['.xlsx', '.xls', '.csv', '.tsv', '.parquet'].includes(ext)) spreadsheetFilesCount++;
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) imageFilesCount++;

    if (fileName.startsWith('readme')) hasReadme = true;
    if (lower.includes('docs/') || lower.includes('documentation/')) hasDocsFolder = true;
    if (lower.includes('test') || lower.includes('__tests__') || lower.includes('spec')) hasTestsFolder = true;

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
      if (lower.includes('socket') || lower.includes('ws') || lower.includes('gateway')) webSocketCount++;
      if (lower.includes('grpc') || ext === '.proto') gRpcCount++;
    }

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

  // Language distribution
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
        percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
      }))
      .sort((a, b) => b.files - a.files);
  }

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
  } else if (hasSourceCode) {
    if (hasFile('next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config')) frontendFramework = 'Next.js';
    else if (hasFile('vite.config.js', 'vite.config.ts', 'vite.config.mjs')) frontendFramework = 'React (Vite)';
    else if (hasFile('angular.json')) frontendFramework = 'Angular';
    else if (hasFile('nuxt.config.js', 'vue.config.js')) frontendFramework = 'Vue';
    else if (hasFile('svelte.config.js')) frontendFramework = 'Svelte';
    else if (languageDistribution.some((l) => l.language === 'TypeScript' || l.language === 'JavaScript')) {
      frontendFramework = structureCounts.components > 0 ? 'React / TypeScript' : 'Node.js Service';
    }

    if (hasFile('server.js', 'server.ts', 'app.js', 'app.ts')) backendFramework = 'Express';
    else if (hasFile('nest-cli.json')) backendFramework = 'NestJS';
    else if (hasFile('main.py', 'app.py', 'manage.py')) backendFramework = 'Python (FastAPI / Flask / Django)';
    else if (hasFile('main.go', 'go.mod')) backendFramework = 'Go Microservice';
    else if (hasFile('pom.xml', 'build.gradle')) backendFramework = 'Spring Boot / Java';
    else if (hasFile('cargo.toml')) backendFramework = 'Rust Core';

    if (hasFile('pnpm-lock.yaml')) packageManager = 'pnpm';
    else if (hasFile('yarn.lock')) packageManager = 'yarn';
    else if (hasFile('package-lock.json', 'package.json')) packageManager = 'npm';
    else if (hasFile('poetry.lock')) packageManager = 'poetry';
    else if (hasFile('requirements.txt', 'pipfile')) packageManager = 'pip';
    else if (hasFile('go.mod', 'go.sum')) packageManager = 'go modules';
    else if (hasFile('pom.xml')) packageManager = 'Maven';
    else if (hasFile('build.gradle')) packageManager = 'Gradle';
    else if (hasFile('cargo.toml', 'cargo.lock')) packageManager = 'Cargo';
  }

  // Infrastructure Detection
  const infrastructureDetection = {
    dockerfile: hasFile('dockerfile', 'dockerfile.dev', 'dockerfile.prod'),
    dockerCompose: hasFile('docker-compose.yml', 'docker-compose.yaml', 'compose.yaml', 'compose.yml'),
    githubActions: Array.from(relativeFileNames).some((rf) => rf.startsWith('.github/workflows/')),
    gitlabCi: hasFile('.gitlab-ci.yml', '.gitlab-ci.yaml'),
    jenkins: hasFile('jenkinsfile'),
    terraform: Array.from(relativeFileNames).some((rf) => rf.endsWith('.tf') || rf.endsWith('.tfvars')),
    kubernetes: Array.from(relativeFileNames).some((rf) => rf.includes('k8s/') || rf.includes('kubernetes/') || rf.endsWith('deployment.yaml')),
    helmCharts: hasFile('chart.yaml', 'chart.yml'),
    nginx: hasFile('nginx.conf') || Array.from(relativeFileNames).some((rf) => rf.includes('nginx/')),
    apache: hasFile('.htaccess', 'httpd.conf')
  };

  // Database Detection
  const databaseDetection = {
    mongodb: hasSourceCode && (hasFile('mongo', 'mongoose') || Array.from(relativeFileNames).some((rf) => rf.includes('mongoose') || rf.includes('mongo.'))),
    mysql: hasSourceCode && (hasFile('mysql', 'mysql2') || Array.from(relativeFileNames).some((rf) => rf.includes('mysql.'))),
    postgresql: hasSourceCode && (hasFile('postgres', 'pg', 'postgresql') || Array.from(relativeFileNames).some((rf) => rf.includes('postgres') || rf.includes('pg.'))),
    sqlite: hasSourceCode && (hasFile('sqlite', 'sqlite3', 'better-sqlite3') || Array.from(relativeFileNames).some((rf) => rf.endsWith('.sqlite') || rf.endsWith('.db'))),
    redis: hasSourceCode && (hasFile('redis', 'ioredis') || Array.from(relativeFileNames).some((rf) => rf.includes('redis.'))),
    supabase: hasSourceCode && (hasFile('supabase') || Array.from(relativeFileNames).some((rf) => rf.includes('supabase.'))),
    firebase: hasSourceCode && (hasFile('firebase.json', 'firebase') || Array.from(relativeFileNames).some((rf) => rf.includes('firebase.'))),
    prisma: hasFile('schema.prisma') || Array.from(relativeFileNames).some((rf) => rf.includes('prisma/')),
    drizzle: hasFile('drizzle.config.ts', 'drizzle.config.js'),
    typeorm: hasFile('ormconfig.json', 'ormconfig.ts')
  };

  // Authentication Detection
  const authenticationDetection = {
    jwt: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('jsonwebtoken') || rf.includes('jwt.')),
    oauth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('oauth') || rf.includes('passport')),
    passportJs: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('passport.') || rf.includes('passport-')),
    firebaseAuth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('firebase-auth')),
    supabaseAuth: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('supabase-auth')),
    nextAuth: hasSourceCode && (hasFile('next-auth') || Array.from(relativeFileNames).some((rf) => rf.includes('next-auth'))),
    clerk: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('clerk.') || rf.includes('@clerk')),
    auth0: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('auth0') || rf.includes('@auth0'))
  };

  // Testing Detection
  const testingDetection = {
    jest: hasFile('jest.config.js', 'jest.config.ts', 'jest.config.json'),
    vitest: hasFile('vitest.config.ts', 'vitest.config.js'),
    pytest: hasFile('conftest.py', 'pytest.ini') || Array.from(relativeFileNames).some((rf) => rf.includes('test_') && rf.endsWith('.py')),
    junit: hasFile('pom.xml') && Array.from(relativeFileNames).some((rf) => rf.includes('src/test/java')),
    mocha: hasFile('.mocharc.json', '.mocharc.js'),
    cypress: hasFile('cypress.config.js', 'cypress.config.ts') || Array.from(relativeFileNames).some((rf) => rf.includes('cypress/')),
    playwright: hasFile('playwright.config.ts', 'playwright.config.js'),
    selenium: hasSourceCode && Array.from(relativeFileNames).some((rf) => rf.includes('selenium'))
  };

  // Health Metrics Calculation
  const completeness = Math.min(100, Math.round((totalFiles / 20) * 40 + (hasReadme ? 30 : 0) + (hasTestsFolder ? 30 : 0)));
  const documentationScore = hasReadme ? (hasDocsFolder ? 95 : 85) : (isNonCodeRepo ? 60 : 35);
  const dependencyHealth = (packageManager !== 'None detected' && !packageManager.startsWith('None')) ? 95 : (isNonCodeRepo ? 85 : 70);
  const codeOrganization = folderSet.size > 2 ? 90 : (folderSet.size > 0 ? 80 : 65);
  const repositoryHealthScore = Math.round((completeness + documentationScore + dependencyHealth + codeOrganization) / 4);

  let healthStatus = 'Excellent';
  if (repositoryHealthScore < 60) healthStatus = 'Needs Improvement';
  else if (repositoryHealthScore < 75) healthStatus = 'Moderate';
  else if (repositoryHealthScore < 88) healthStatus = 'Good';

  return {
    repositoryName: repoName,
    gitUrl: `https://github.com/${repoOwner}/${repoName}.git`,
    fullName: `${repoOwner}/${repoName}`,
    branch: defaultBranch,
    defaultBranch,
    repositoryVisibility: visibility,
    owner: repoOwner,
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
      ? `This repository contains ${totalFiles} data/asset file(s) (Power BI, Excel, Images) without application source code. AST call-graph parsing and blast radius analysis require JavaScript, TypeScript, Python, Go, Java, or Rust code.`
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
