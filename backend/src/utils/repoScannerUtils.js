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
  '.h': 'C++',

  '.go': 'Go',

  '.rs': 'Rust',

  '.html': 'HTML',
  '.htm': 'HTML',

  '.css': 'CSS',
  '.scss': 'CSS',
  '.sass': 'CSS',

  '.json': 'JSON',

  '.md': 'Markdown',
  '.markdown': 'Markdown',

  '.yaml': 'YAML',
  '.yml': 'YAML',

  '.xml': 'XML'
};

/**
 * Format bytes to readable string (e.g. "4.2 MB", "850 KB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(2)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

/**
 * Scan directory recursively collecting files, folders, size, and language distribution
 */
export function scanDirectoryRecursively(dirPath) {
  let totalFiles = 0;
  const folderSet = new Set();
  const foundIgnoredFolders = new Set();
  let totalSizeBytes = 0;
  const languageCounts = {};

  function traverse(currentPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      const fullPath = path.join(currentPath, name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(name.toLowerCase())) {
          foundIgnoredFolders.add(name);
          continue;
        }
        folderSet.add(fullPath);
        traverse(fullPath);
      } else if (entry.isFile()) {
        totalFiles++;

        try {
          const stats = fs.statSync(fullPath);
          totalSizeBytes += stats.size;
        } catch (e) {
          // ignore stat errors
        }

        const ext = path.extname(name).toLowerCase();
        const language = EXTENSION_TO_LANGUAGE[ext];

        if (language) {
          languageCounts[language] = (languageCounts[language] || 0) + 1;
        }
      }
    }
  }

  traverse(dirPath);

  // Calculate percentage breakdown
  const languageDistribution = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      files: count,
      percentage: totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
    }))
    .sort((a, b) => b.files - a.files);

  // Combine found ignored folders with standard ignored list
  const ignoredFolders = Array.from(
    new Set([...IGNORED_DIRECTORIES, ...foundIgnoredFolders])
  );

  return {
    totalFiles,
    totalFolders: folderSet.size,
    totalSize: formatBytes(totalSizeBytes),
    ignoredFolders,
    languageDistribution
  };
}
