import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// Cache storage directory path
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const CACHE_FILE_PATH = path.join(STORAGE_DIR, 'metadata_cache.json');

export const metadataLoaderService = {
  /**
   * Helper to generate quick MD5 hash of file content or metadata
   */
  computeHash: (content) => {
    return crypto.createHash('md5').update(content || '').digest('hex');
  },

  /**
   * Load metadata cache from JSON storage file
   */
  loadCache: () => {
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.warn(`Failed to read metadata cache file: ${err.message}`);
    }
    return { repoId: 'default', fileHashes: {}, fileMetadataMap: {}, lastScannedAt: null };
  },

  /**
   * Persist metadata cache to disk efficiently
   */
  saveCache: (cacheData) => {
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Failed to save metadata cache: ${err.message}`);
    }
  },

  /**
   * AST / Regex Code Parser to extract Functions, Classes, Interfaces, Imports, Exports, Routes
   */
  extractFileAST: (filePath, codeContent = '') => {
    const fileName = path.basename(filePath).toLowerCase();
    const isConfig = fileName.startsWith('.env') || fileName.includes('config') || fileName.endsWith('.json') || fileName.endsWith('.yaml') || fileName.endsWith('.yml');
    const isDatabase = fileName.includes('db') || fileName.includes('orm') || fileName.includes('model') || fileName.includes('schema') || fileName.includes('migration') || fileName.endsWith('.sql');
    const isController = fileName.includes('controller');
    const isService = fileName.includes('service');

    const functions = [];
    const classes = [];
    const interfaces = [];
    const imports = [];
    const exports = [];
    const routes = [];

    const lines = codeContent.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Extract Imports
      if (trimmed.startsWith('import ') || trimmed.includes('require(')) {
        const match = trimmed.match(/import\s+.*?from\s+['"](.*?)['"]/) || trimmed.match(/require\(['"](.*?)['"]\)/);
        if (match) {
          imports.push({ line: lineNum, source: match[1], raw: trimmed });
        }
      }

      // Extract Exports
      if (trimmed.startsWith('export ') || trimmed.startsWith('module.exports')) {
        exports.push({ line: lineNum, statement: trimmed.slice(0, 80) });
      }

      // Extract Functions (function foo(), const foo = (), async method())
      const funcMatch = trimmed.match(/(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/) ||
                        trimmed.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(/) ||
                        trimmed.match(/([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*:\s*[^{]+\{/);
      if (funcMatch && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        functions.push({ line: lineNum, name: funcMatch[1] });
      }

      // Extract Classes
      const classMatch = trimmed.match(/class\s+([a-zA-Z0-9_$]+)/);
      if (classMatch) {
        classes.push({ line: lineNum, name: classMatch[1] });
      }

      // Extract Interfaces
      const interfaceMatch = trimmed.match(/interface\s+([a-zA-Z0-9_$]+)/);
      if (interfaceMatch) {
        interfaces.push({ line: lineNum, name: interfaceMatch[1] });
      }

      // Extract API Routes (router.get, app.post, etc.)
      const routeMatch = trimmed.match(/(router|app)\.(get|post|put|delete|patch)\(['"](.*?)['"]/i);
      if (routeMatch) {
        routes.push({ line: lineNum, method: routeMatch[2].toUpperCase(), path: routeMatch[3] });
      }
    });

    return {
      filePath,
      isConfig,
      isDatabase,
      isController,
      isService,
      functions,
      classes,
      interfaces,
      imports,
      exports,
      routes
    };
  },

  /**
   * Perform Full or Incremental Metadata Scan over a File List or Directory
   */
  scanCodebase: ({ repoId = 'repo-1', files = [], forceRefresh = false }) => {
    const startTime = Date.now();
    const cache = forceRefresh ? { repoId, fileHashes: {}, fileMetadataMap: {} } : metadataLoaderService.loadCache();

    let cacheHits = 0;
    let filesParsedCount = 0;

    const fileMetadataMap = cache.fileMetadataMap || {};
    const fileHashes = cache.fileHashes || {};

    const sampleFiles = files.length > 0 ? files : metadataLoaderService.getSampleFiles();

    sampleFiles.forEach((file) => {
      const filePath = file.path;
      const content = file.content || `// Content for ${filePath}\nexport class SampleService {}\nexport function handleRequest() {}\nrouter.get('/api', (req, res) => {});`;
      const currentHash = metadataLoaderService.computeHash(content);

      // Incremental Check: If hash matches cached version, reuse!
      if (!forceRefresh && fileHashes[filePath] === currentHash && fileMetadataMap[filePath]) {
        cacheHits++;
      } else {
        // Parse File AST
        const ast = metadataLoaderService.extractFileAST(filePath, content);
        fileHashes[filePath] = currentHash;
        fileMetadataMap[filePath] = ast;
        filesParsedCount++;
      }
    });

    // Save updated cache JSON
    const updatedCache = {
      repoId,
      lastScannedAt: new Date().toISOString(),
      fileHashes,
      fileMetadataMap
    };
    metadataLoaderService.saveCache(updatedCache);

    const scanDurationMs = Date.now() - startTime;

    // Aggregate summary lists
    const allFunctions = [];
    const allClasses = [];
    const allInterfaces = [];
    const allRoutes = [];
    const configFiles = [];
    const databaseFiles = [];
    const controllerFiles = [];
    const serviceFiles = [];

    Object.values(fileMetadataMap).forEach((meta) => {
      meta.functions.forEach((f) => allFunctions.push({ file: meta.filePath, ...f }));
      meta.classes.forEach((c) => allClasses.push({ file: meta.filePath, ...c }));
      meta.interfaces.forEach((i) => allInterfaces.push({ file: meta.filePath, ...i }));
      meta.routes.forEach((r) => allRoutes.push({ file: meta.filePath, ...r }));

      if (meta.isConfig) configFiles.push(meta.filePath);
      if (meta.isDatabase) databaseFiles.push(meta.filePath);
      if (meta.isController) controllerFiles.push(meta.filePath);
      if (meta.isService) serviceFiles.push(meta.filePath);
    });

    return {
      repoId,
      incremental: {
        totalFilesScanned: sampleFiles.length,
        cacheHits,
        filesParsedCount,
        scanDurationMs,
        cacheStatus: cacheHits > 0 ? 'INCREMENTAL_HIT' : 'FULL_SCAN'
      },
      summary: {
        totalFunctions: allFunctions.length,
        totalClasses: allClasses.length,
        totalInterfaces: allInterfaces.length,
        totalRoutes: allRoutes.length,
        totalConfigFiles: configFiles.length,
        totalDatabaseFiles: databaseFiles.length,
        totalControllers: controllerFiles.length,
        totalServices: serviceFiles.length
      },
      extractedMetadata: {
        functions: allFunctions,
        classes: allClasses,
        interfaces: allInterfaces,
        routes: allRoutes,
        configFiles,
        databaseFiles,
        controllerFiles,
        serviceFiles
      }
    };
  },

  /**
   * Sample code files for fallback demonstration
   */
  getSampleFiles: () => [
    {
      path: 'src/services/StripeWebhookHandler.ts',
      content: `import { Injectable } from '@nestjs/common';\nimport { TransactionLedger } from '../database/models/TransactionLedger';\n\nexport interface StripeWebhookPayload {\n  id: string;\n  amount: number;\n}\n\nexport class StripeWebhookHandler {\n  async handlePaymentIntentSucceeded(event: StripeWebhookPayload) {\n    const ledger = new TransactionLedger();\n    return ledger.record(event);\n  }\n}`
    },
    {
      path: 'src/middleware/AuthenticationGuard.ts',
      content: `import { ExpressMiddleware } from 'express';\n\nexport interface AuthConfig {\n  secret: string;\n}\n\nexport class AuthenticationGuard {\n  public validateToken(token: string): boolean {\n    return token.length > 0;\n  }\n}`
    },
    {
      path: 'src/database/models/TransactionLedger.ts',
      content: `export class TransactionLedger {\n  public record(payload: any) {\n    return { id: 1, status: 'RECORDED' };\n  }\n}`
    },
    {
      path: 'src/routes/PaymentRoutes.ts',
      content: `import { Router } from 'express';\nconst router = Router();\nrouter.post('/api/v2/webhooks/stripe', (req, res) => {});\nrouter.get('/api/v2/payments/status/:id', (req, res) => {});\nexport default router;`
    },
    {
      path: 'src/config/paymentConfig.ts',
      content: `export const paymentConfig = {\n  stripeApiKey: process.env.STRIPE_API_KEY,\n  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET\n};`
    }
  ]
};
