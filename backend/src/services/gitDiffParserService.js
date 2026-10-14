import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import simpleGit from 'simple-git';
import { logger } from '../utils/logger.js';

const execFileAsync = promisify(execFile);

/**
 * Normalizes file paths:
 * - Strips standard Git prefixes like 'a/' or 'b/'
 * - Replaces backslashes with forward slashes
 * - Strips leading slashes and whitespace
 */
export function normalizeGitPath(rawPath) {
  if (!rawPath) return '';
  let clean = String(rawPath).trim().replace(/\\/g, '/');
  if (clean.startsWith('a/') || clean.startsWith('b/')) {
    clean = clean.slice(2);
  }
  return clean.replace(/^\/+/, '');
}

/**
 * Regex patterns for discovering changed symbols across multiple programming languages
 */
const SYMBOL_PATTERNS = [
  // JS / TS / JSX / TSX
  { type: 'class', regex: /(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)/ },
  { type: 'interface', regex: /(?:export\s+)?interface\s+([A-Za-z0-9_$]+)/ },
  { type: 'type', regex: /(?:export\s+)?type\s+([A-Za-z0-9_$]+)\s*=/ },
  { type: 'function', regex: /(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/ },
  { type: 'function', regex: /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
  { type: 'method', regex: /^\s*(?:public|private|protected|static|async)?\s*([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/ },
  { type: 'route', regex: /(?:router|app)\.(get|post|put|delete|patch|all)\(['"]([^'"]+)['"]/i },
  { type: 'variable', regex: /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/ },

  // Python
  { type: 'class', regex: /^class\s+([A-Za-z0-9_$]+)(?:\([^)]*\))?:/ },
  { type: 'function', regex: /(?:async\s+)?def\s+([A-Za-z0-9_$]+)\s*\(/ },

  // Go
  { type: 'function', regex: /^func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_$]+)\s*\(/ },
  { type: 'struct', regex: /^type\s+([A-Za-z0-9_$]+)\s+struct\b/ },
  { type: 'interface', regex: /^type\s+([A-Za-z0-9_$]+)\s+interface\b/ },

  // Java / C#
  { type: 'class', regex: /(?:public|private|protected|static|final|abstract)?\s*class\s+([A-Za-z0-9_$]+)/ },
  { type: 'interface', regex: /(?:public|private|protected)?\s*interface\s+([A-Za-z0-9_$]+)/ },
  { type: 'method', regex: /(?:public|private|protected|static|final|abstract|async)\s+[\w<>\[\], ?]+\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*(?:throws\s+[\w, ]+)?\s*\{/ },

  // Rust
  { type: 'function', regex: /(?:pub\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_$]+)\s*(?:<[^>]+>)?\s*\(/ },
  { type: 'struct', regex: /(?:pub\s+)?struct\s+([A-Za-z0-9_$]+)/ },
  { type: 'trait', regex: /(?:pub\s+)?trait\s+([A-Za-z0-9_$]+)/ },
  { type: 'enum', regex: /(?:pub\s+)?enum\s+([A-Za-z0-9_$]+)/ }
];

/**
 * Git Diff and Patch Parser Service
 * Provides robust parsing of unified diffs and commit SHA comparisons.
 * Extracts modified files, line counts, hunks, and code symbols.
 */
export const gitDiffParserService = {
  /**
   * Parse a standard Git unified diff string into structured file, hunk, and symbol records
   *
   * @param {string} diffText - Raw unified git diff string
   * @returns {Object} Structured diff representation
   */
  parseUnifiedDiff: (diffText) => {
    if (!diffText || typeof diffText !== 'string' || diffText.trim().length === 0) {
      return {
        files: [],
        summary: {
          totalFilesChanged: 0,
          additions: 0,
          deletions: 0,
          changedFilePaths: [],
          statusCounts: {
            modified: 0,
            added: 0,
            deleted: 0,
            renamed: 0,
            copied: 0,
            binary: 0
          }
        },
        allChangedSymbols: []
      };
    }

    const lines = diffText.split(/\r?\n/);
    const files = [];
    let currentFile = null;
    let currentHunk = null;
    let currentOldLine = 0;
    let currentNewLine = 0;

    const finalizeCurrentFile = () => {
      if (!currentFile) return;

      // Finalize current hunk
      if (currentHunk) {
        currentFile.hunks.push(currentHunk);
        currentHunk = null;
      }

      // Deduplicate changed symbols per file
      const symbolMap = new Map();
      for (const sym of currentFile.changedSymbols) {
        const key = `${sym.type}:${sym.name}`;
        if (!symbolMap.has(key)) {
          symbolMap.set(key, sym);
        } else {
          // If already exists, prefer 'modified' or 'added'
          const existing = symbolMap.get(key);
          if (sym.action === 'modified' || (sym.action === 'added' && existing.action === 'deleted')) {
            symbolMap.set(key, sym);
          }
        }
      }
      currentFile.changedSymbols = Array.from(symbolMap.values());
      currentFile.functionsModified = currentFile.changedSymbols
        .filter((s) => s.type === 'function' || s.type === 'method')
        .map((s) => s.name);

      files.push(currentFile);
      currentFile = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Detect start of a new file diff: "diff --git a/... b/..."
      if (line.startsWith('diff --git ')) {
        finalizeCurrentFile();

        const match = line.match(/^diff --git\s+(?:a\/)?(\S+)\s+(?:b\/)?(\S+)/);
        const rawOld = match ? match[1] : '';
        const rawNew = match ? match[2] : '';
        const oldPath = normalizeGitPath(rawOld);
        const newPath = normalizeGitPath(rawNew);
        const resolvedPath = newPath || oldPath;

        currentFile = {
          path: resolvedPath,
          oldPath: oldPath || resolvedPath,
          newPath: newPath || resolvedPath,
          status: 'modified',
          isBinary: false,
          additions: 0,
          deletions: 0,
          hunks: [],
          changedLines: [],
          changedSymbols: [],
          functionsModified: []
        };
        continue;
      }

      // If we haven't encountered a "diff --git" header but hit "--- a/..." and "+++ b/..."
      if (!currentFile && (line.startsWith('--- ') || line.startsWith('+++ '))) {
        let p = line.slice(4).trim();
        if (p.startsWith('a/') || p.startsWith('b/')) p = p.slice(2);
        if (p !== '/dev/null') {
          currentFile = {
            path: normalizeGitPath(p),
            oldPath: normalizeGitPath(p),
            newPath: normalizeGitPath(p),
            status: 'modified',
            isBinary: false,
            additions: 0,
            deletions: 0,
            hunks: [],
            changedLines: [],
            changedSymbols: [],
            functionsModified: []
          };
        }
      }

      if (!currentFile) continue;

      // 2. Detect file status flags
      if (line.startsWith('new file mode ')) {
        currentFile.status = 'added';
        continue;
      }
      if (line.startsWith('deleted file mode ')) {
        currentFile.status = 'deleted';
        continue;
      }
      if (line.startsWith('similarity index ')) {
        // Can be rename or copy
        continue;
      }
      if (line.startsWith('rename from ')) {
        currentFile.status = 'renamed';
        currentFile.oldPath = normalizeGitPath(line.slice(12).trim());
        continue;
      }
      if (line.startsWith('rename to ')) {
        currentFile.status = 'renamed';
        currentFile.newPath = normalizeGitPath(line.slice(10).trim());
        currentFile.path = currentFile.newPath;
        continue;
      }
      if (line.startsWith('copy from ')) {
        currentFile.status = 'copied';
        currentFile.oldPath = normalizeGitPath(line.slice(10).trim());
        continue;
      }
      if (line.startsWith('copy to ')) {
        currentFile.status = 'copied';
        currentFile.newPath = normalizeGitPath(line.slice(8).trim());
        currentFile.path = currentFile.newPath;
        continue;
      }
      if (line.includes('Binary files ') && line.includes(' differ')) {
        currentFile.isBinary = true;
        if (currentFile.status === 'modified') {
          currentFile.status = 'binary';
        }
        continue;
      }

      // 3. Detect --- and +++ lines
      if (line.startsWith('--- ')) {
        const raw = line.slice(4).trim();
        if (raw === '/dev/null') {
          currentFile.status = 'added';
          currentFile.oldPath = null;
        } else {
          currentFile.oldPath = normalizeGitPath(raw);
        }
        continue;
      }
      if (line.startsWith('+++ ')) {
        const raw = line.slice(4).trim();
        if (raw === '/dev/null') {
          currentFile.status = 'deleted';
          currentFile.newPath = null;
        } else {
          currentFile.newPath = normalizeGitPath(raw);
          currentFile.path = currentFile.newPath;
        }
        continue;
      }

      // 4. Detect Hunk Header: @@ -oldStart[,oldLines] +newStart[,newLines] @@ [context]
      if (line.startsWith('@@ ')) {
        if (currentHunk) {
          currentFile.hunks.push(currentHunk);
          currentHunk = null;
        }

        const hunkMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/);
        if (hunkMatch) {
          const oldStart = parseInt(hunkMatch[1], 10);
          const oldLines = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
          const newStart = parseInt(hunkMatch[3], 10);
          const newLines = hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1;
          const headerContext = (hunkMatch[5] || '').trim();

          currentOldLine = oldStart;
          currentNewLine = newStart;

          currentHunk = {
            oldStart,
            oldLines,
            newStart,
            newLines,
            header: headerContext,
            lines: []
          };

          // If the hunk header itself declares an enclosing function / class context
          if (headerContext) {
            extractSymbolsFromLine(headerContext, currentNewLine, 'modified', currentFile.changedSymbols, currentFile.path);
          }
        }
        continue;
      }

      // 5. Lines inside a hunk
      if (currentHunk) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          const content = line.slice(1);
          currentFile.additions++;
          currentHunk.lines.push(line);
          currentFile.changedLines.push({
            type: 'add',
            line: currentNewLine,
            content
          });
          extractSymbolsFromLine(content, currentNewLine, 'added', currentFile.changedSymbols, currentFile.path);
          currentNewLine++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          const content = line.slice(1);
          currentFile.deletions++;
          currentHunk.lines.push(line);
          currentFile.changedLines.push({
            type: 'delete',
            line: currentOldLine,
            content
          });
          extractSymbolsFromLine(content, currentOldLine, 'deleted', currentFile.changedSymbols, currentFile.path);
          currentOldLine++;
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push(line);
          currentOldLine++;
          currentNewLine++;
        } else if (line.startsWith('\\ No newline at end of file')) {
          currentHunk.lines.push(line);
        }
      }
    }

    finalizeCurrentFile();

    // Compute aggregated summary metrics
    const statusCounts = {
      modified: 0,
      added: 0,
      deleted: 0,
      renamed: 0,
      copied: 0,
      binary: 0
    };

    let totalAdditions = 0;
    let totalDeletions = 0;
    const allChangedSymbols = [];

    for (const f of files) {
      totalAdditions += f.additions;
      totalDeletions += f.deletions;
      if (f.isBinary) {
        statusCounts.binary++;
      } else {
        statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
      }

      for (const sym of f.changedSymbols) {
        allChangedSymbols.push({
          ...sym,
          filePath: f.path
        });
      }
    }

    return {
      files,
      summary: {
        totalFilesChanged: files.length,
        additions: totalAdditions,
        deletions: totalDeletions,
        changedFilePaths: files.map((f) => f.path),
        statusCounts
      },
      allChangedSymbols
    };
  },

  /**
   * Extract Git diff between two commit SHAs or branches in a repository directory
   *
   * @param {string} repositoryPath - Local filesystem directory of the git repo
   * @param {string} baseSha - Base commit SHA (older) or commit to compare
   * @param {string} [targetSha] - Target commit SHA (newer) or omitted for single commit diff
   * @returns {Promise<Object>} Parsed diff result
   */
  getDiffBetweenCommits: async (repositoryPath, baseSha, targetSha = null) => {
    if (!repositoryPath || !fs.existsSync(repositoryPath)) {
      logger.warn(`Repository path does not exist: ${repositoryPath}`);
      return gitDiffParserService.parseUnifiedDiff('');
    }

    try {
      const git = simpleGit(repositoryPath);
      let rawDiff = '';

      if (baseSha && targetSha && baseSha !== targetSha) {
        logger.info(`Extracting git diff between ${baseSha} and ${targetSha} in ${repositoryPath}`);
        try {
          rawDiff = await git.diff([`${baseSha}..${targetSha}`]);
        } catch (e1) {
          rawDiff = await git.diff([baseSha, targetSha]);
        }
      } else if (baseSha) {
        logger.info(`Extracting git show diff for commit ${baseSha} in ${repositoryPath}`);
        try {
          rawDiff = await git.show([baseSha, '--format=']);
        } catch (e2) {
          rawDiff = await git.diff([`${baseSha}~1..${baseSha}`]);
        }
      } else {
        // Uncommitted working tree diff
        rawDiff = await git.diff();
      }

      const parsed = gitDiffParserService.parseUnifiedDiff(rawDiff);
      return {
        repositoryPath,
        baseSha,
        targetSha: targetSha || baseSha,
        rawDiffSnippet: rawDiff.slice(0, 1500),
        ...parsed
      };
    } catch (err) {
      logger.warn(`simple-git diff failed in ${repositoryPath}: ${err.message}. Trying child_process...`);
      try {
        const args = baseSha && targetSha
          ? ['diff', `${baseSha}..${targetSha}`]
          : baseSha
          ? ['show', '--format=', baseSha]
          : ['diff'];

        const { stdout } = await execFileAsync('git', args, {
          cwd: repositoryPath,
          maxBuffer: 20 * 1024 * 1024
        });

        const parsed = gitDiffParserService.parseUnifiedDiff(stdout);
        return {
          repositoryPath,
          baseSha,
          targetSha: targetSha || baseSha,
          rawDiffSnippet: stdout.slice(0, 1500),
          ...parsed
        };
      } catch (childErr) {
        logger.warn(`Git CLI diff failed: ${childErr.message}`);
        return {
          repositoryPath,
          baseSha,
          targetSha,
          error: childErr.message,
          ...gitDiffParserService.parseUnifiedDiff('')
        };
      }
    }
  },

  /**
   * Get diff for a single commit hash
   */
  getCommitDiff: async (repositoryPath, commitHash) => {
    return gitDiffParserService.getDiffBetweenCommits(repositoryPath, commitHash);
  },

  /**
   * Helper to normalize input into a list of changed file records
   * Accepts: raw diff string, parsed diff object, or list of file objects/paths
   */
  extractChangedFiles: (diffOrInput) => {
    if (!diffOrInput) return [];
    if (typeof diffOrInput === 'string') {
      const parsed = gitDiffParserService.parseUnifiedDiff(diffOrInput);
      return parsed.files;
    }
    if (diffOrInput.files && Array.isArray(diffOrInput.files)) {
      return diffOrInput.files;
    }
    if (Array.isArray(diffOrInput)) {
      return diffOrInput.map((item) => {
        if (typeof item === 'string') {
          return {
            path: normalizeGitPath(item),
            status: 'modified',
            additions: 1,
            deletions: 0,
            changedSymbols: [],
            hunks: []
          };
        }
        return {
          path: normalizeGitPath(item.path || item.name || ''),
          status: item.status || 'modified',
          additions: item.additions || 0,
          deletions: item.deletions || 0,
          changedSymbols: item.changedSymbols || [],
          hunks: item.hunks || []
        };
      });
    }
    return [];
  }
};

/**
 * Helper to match and extract code symbols from a single line
 */
function extractSymbolsFromLine(codeLine, lineNumber, action, symbolList, filePath) {
  if (!codeLine || typeof codeLine !== 'string') return;
  const trimmed = codeLine.trim();
  if (trimmed.length < 3 || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return;
  }

  for (const { type, regex } of SYMBOL_PATTERNS) {
    const match = trimmed.match(regex);
    if (match) {
      const symbolName = match[1] || match[2];
      if (symbolName && !isReservedKeyword(symbolName)) {
        symbolList.push({
          name: symbolName,
          type,
          line: lineNumber,
          action,
          filePath: filePath || null,
          signature: trimmed.slice(0, 100)
        });
      }
    }
  }
}

/**
 * Filter out common language control keywords that can mimic function names
 */
function isReservedKeyword(name) {
  const keywords = new Set([
    'if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'finally',
    'return', 'throw', 'do', 'try', 'with', 'yield', 'import', 'export',
    'package', 'new', 'typeof', 'instanceof', 'void', 'delete', 'in',
    'break', 'continue', 'debugger', 'default', 'this', 'super'
  ]);
  return keywords.has(name.toLowerCase());
}
