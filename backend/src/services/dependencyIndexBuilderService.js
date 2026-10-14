import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

/**
 * Normalizes file paths with forward slashes and removes leading slashes
 */
function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * Checks if a given path is an external library/package import vs relative or project-internal
 */
function isExternalSpecifier(specifier) {
  if (!specifier) return true;
  const s = specifier.trim();
  if (s.startsWith('.') || s.startsWith('/') || s.startsWith('~') || s.startsWith('@/')) {
    return false;
  }
  return true;
}

/**
 * Multi-Language Dependency Index Builder
 * Analyzes all files in a repository and extracts:
 * - Imports (modules, packages, and internal file imports)
 * - Imported By (inverted dependency mapping)
 * - Extends (class and interface inheritance)
 * - Implements (interface and trait implementation)
 * - Calls (function, method, constructor, and API invocations)
 * - References (types, constants, models, schemas, enums, decorators)
 *
 * Stores the reusable index in memory for fast lookup, graph queries, and impact analysis.
 */
export class DependencyIndex {
  constructor(repoId, repositoryName = 'repository') {
    this.repoId = repoId;
    this.repositoryName = repositoryName;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;

    // File-level Dependency Index: Map<normalizedFilePath, FileDependencyRecord>
    this.files = new Map();

    // Global Symbol Registry: Map<symbolName, Array<SymbolDefinition>>
    this.symbolRegistry = new Map();

    // Graph Nodes and Edges
    this.nodes = [];
    this.edges = [];
    this.edgeSet = new Set();

    // Forward Adjacency: filePath -> Set<importedFilePath>
    this.forwardAdjacency = new Map();
    // Reverse Adjacency: filePath -> Set<importingFilePath>
    this.reverseAdjacency = new Map();

    // Summary Metrics
    this.summary = {
      totalFiles: 0,
      totalImports: 0,
      totalInternalDependencies: 0,
      totalExternalDependencies: 0,
      totalExtends: 0,
      totalImplements: 0,
      totalCalls: 0,
      totalReferences: 0,
      totalClasses: 0,
      totalInterfaces: 0,
      circularDependencies: [],
      isolatedFiles: [],
      entryPoints: []
    };
  }

  /**
   * Get specific file dependency index
   */
  getFileDependencies(filePath) {
    const norm = normalizePath(filePath);
    return this.files.get(norm) || null;
  }

  /**
   * Get all files that this file directly imports / depends on
   */
  getDependencies(filePath) {
    const norm = normalizePath(filePath);
    const set = this.forwardAdjacency.get(norm);
    return set ? Array.from(set) : [];
  }

  /**
   * Get all files that import / depend on this file (dependents)
   */
  getDependents(filePath) {
    const norm = normalizePath(filePath);
    const set = this.reverseAdjacency.get(norm);
    return set ? Array.from(set) : [];
  }

  /**
   * Calculate full blast radius using actual dependencies
   */
  getBlastRadius(filePath, maxDepth = 10) {
    return this.computeBlastRadius(filePath, { maxDepth, algorithm: 'bfs' });
  }

  /**
   * Compute exact Blast Radius using BFS or DFS traversal on actual dependency index
   * Computes:
   * - Direct dependents (depth = 1)
   * - Indirect dependents (depth >= 2)
   * - Total impacted files (direct + indirect + origin)
   * - Impact chain (step-by-step propagation paths with exact relationships)
   * - Strictly excludes all unrelated files
   *
   * @param {string} filePath - Path of the changed file
   * @param {Object} [options]
   * @param {string} [options.algorithm='bfs'] - 'bfs' (Breadth-First Search) or 'dfs' (Depth-First Search)
   * @param {number} [options.maxDepth=10] - Maximum traversal depth
   * @returns {Object} Full Blast Radius analysis result
   */
  computeBlastRadius(filePath, options = {}) {
    const startTime = Date.now();
    const algorithm = (options.algorithm || 'bfs').toLowerCase() === 'dfs' ? 'dfs' : 'bfs';
    const maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : 10;

    // 1. Resolve source file path in index
    let resolvedSourcePath = null;
    if (filePath) {
      const targetNorm = normalizePath(filePath);
      if (this.files.has(targetNorm)) {
        resolvedSourcePath = targetNorm;
      } else {
        // Try case-insensitive or partial path match
        const lower = targetNorm.toLowerCase();
        for (const k of this.files.keys()) {
          if (k.toLowerCase() === lower || k.endsWith(targetNorm) || targetNorm.endsWith(k)) {
            resolvedSourcePath = k;
            break;
          }
        }
      }
    }

    // If still no source path, pick first entry point or first file
    if (!resolvedSourcePath) {
      if (this.files.size > 0) {
        resolvedSourcePath = this.summary.entryPoints[0] || this.files.keys().next().value;
      }
    }

    if (!resolvedSourcePath || !this.files.has(resolvedSourcePath)) {
      return {
        sourceFile: filePath ? { path: filePath, name: path.basename(filePath) } : null,
        algorithmUsed: algorithm === 'dfs' ? 'DFS Traversal (Depth-First Search)' : 'BFS Traversal (Breadth-First Search)',
        directDependents: [],
        indirectDependents: [],
        totalImpactedFiles: 0,
        directDependentsCount: 0,
        indirectDependentsCount: 0,
        unaffectedFilesCount: this.summary.totalFiles,
        impactChains: [],
        impactTree: null,
        impactedNodes: [],
        impactedEdges: [],
        concentricLayers: [
          { level: 0, name: 'Layer 0: Modified Source File', items: [], nodes: [] },
          { level: 1, name: 'Layer 1: Direct Dependents', items: [], nodes: [] },
          { level: 2, name: 'Layer 2: Downstream Indirect Dependents', items: [], nodes: [] },
          { level: 3, name: 'Layer 3: Global Transitive Scope', items: [], nodes: [] }
        ],
        layers: [],
        impactedLayers: [],
        affectedApis: [],
        affectedServices: [],
        affectedComponents: [],
        affectedDatabaseTables: [],
        affectedTests: [],
        metrics: {
          totalFilesInRepo: this.summary.totalFiles,
          directImpactCount: 0,
          indirectImpactCount: 0,
          totalImpactedCount: 0,
          unaffectedFilesCount: this.summary.totalFiles,
          blastRadiusPercentage: 0,
          maxPropagationDepth: 0,
          riskScore: 0,
          riskLevel: 'LOW',
          executionTimeMs: Date.now() - startTime
        },
        overallRiskScore: 0,
        riskLevel: 'LOW',
        overallRiskIndex: 'LOW (0/100)',
        executionTimeMs: Date.now() - startTime
      };
    }

    const sourceFileRecord = this.files.get(resolvedSourcePath);
    const sourceFileName = path.basename(resolvedSourcePath);

    // 2. Traversal State
    const visited = new Set([resolvedSourcePath]);
    const directDependents = [];
    const indirectDependents = [];
    const impactChains = [];
    const impactedPaths = new Set([resolvedSourcePath]);

    // Tree structure rooted at sourceFile
    const impactTree = {
      path: resolvedSourcePath,
      name: sourceFileName,
      depth: 0,
      impactType: 'origin',
      children: []
    };
    const nodeTreeMap = new Map([[resolvedSourcePath, impactTree]]);

    // Queue / Stack for traversal
    // Each item: { path, depth, pathTrace, stepTrace }
    const queue = [{
      path: resolvedSourcePath,
      depth: 0,
      pathTrace: [resolvedSourcePath],
      stepTrace: []
    }];

    while (queue.length > 0) {
      const current = algorithm === 'dfs' ? queue.pop() : queue.shift();
      if (current.depth >= maxDepth) continue;

      // Get direct dependents that depend on current.path
      const dependentsSet = this.reverseAdjacency.get(current.path) || new Set();
      const dependentPaths = Array.from(dependentsSet);

      for (const depPath of dependentPaths) {
        if (depPath.startsWith('pkg:')) continue; // Skip external third-party packages
        if (!this.files.has(depPath)) continue;

        const depRecord = this.files.get(depPath);
        const depFileName = path.basename(depPath);

        // Extract precise relationship details between depPath and current.path
        const relationships = [];
        const importedSymbols = [];
        const callSites = [];
        const extendsList = [];
        const implementsList = [];

        // 1. Imports
        for (const imp of depRecord.imports || []) {
          if (imp.resolvedPath === current.path) {
            relationships.push({
              type: 'import',
              label: imp.importedSymbols && imp.importedSymbols.length > 0
                ? `imports { ${imp.importedSymbols.join(', ')} }`
                : `imports from ${path.basename(current.path)}`,
              line: imp.line,
              symbols: imp.importedSymbols || []
            });
            if (imp.importedSymbols) {
              importedSymbols.push(...imp.importedSymbols);
            }
          }
        }

        // 2. Extends
        for (const ext of depRecord.extends || []) {
          if (ext.resolvedTargetFile === current.path) {
            relationships.push({
              type: 'extends',
              label: `${ext.className} extends ${ext.superClass}`,
              line: ext.line,
              className: ext.className,
              superClass: ext.superClass
            });
            extendsList.push(ext);
          }
        }

        // 3. Implements
        for (const impl of depRecord.implements || []) {
          if (impl.resolvedTargetFile === current.path) {
            relationships.push({
              type: 'implements',
              label: `${impl.className} implements ${impl.interfaceName}`,
              line: impl.line,
              className: impl.className,
              interfaceName: impl.interfaceName
            });
            implementsList.push(impl);
          }
        }

        // 4. Calls
        for (const call of depRecord.calls || []) {
          if (call.resolvedTargetFile === current.path) {
            relationships.push({
              type: 'call',
              label: `${call.caller || 'module'} calls ${call.callee}()`,
              line: call.line,
              method: call.callee
            });
            callSites.push(call);
          }
        }

        // 5. References
        for (const ref of depRecord.references || []) {
          if (ref.resolvedTargetFile === current.path) {
            relationships.push({
              type: 'reference',
              label: `references ${ref.name}`,
              line: ref.line,
              name: ref.name
            });
          }
        }

        const primaryRelType = relationships[0]?.type || 'dependency';
        const primaryRelLabel = relationships[0]?.label || `depends on ${path.basename(current.path)}`;

        const nextDepth = current.depth + 1;
        const isDirect = nextDepth === 1;
        const nextTrace = [...current.pathTrace, depPath];
        const nextStepTrace = [
          ...current.stepTrace,
          {
            from: current.path,
            fromName: path.basename(current.path),
            to: depPath,
            toName: depFileName,
            depth: nextDepth,
            type: primaryRelType,
            label: primaryRelLabel,
            line: relationships[0]?.line || null,
            allRelationships: relationships
          }
        ];

        // If not visited in this traversal branch
        if (!visited.has(depPath)) {
          visited.add(depPath);
          impactedPaths.add(depPath);

          const impactReason = isDirect
            ? `Directly ${relationships.map((r) => r.label).join(' & ')} at ${depFileName}`
            : `Transitively impacted via ${path.basename(current.path)} (${nextDepth} hops away from ${sourceFileName})`;

          const depData = {
            filePath: depPath,
            fileName: depFileName,
            extension: depRecord.extension,
            depth: nextDepth,
            isDirect,
            impactType: isDirect ? 'direct' : 'indirect',
            impactLevel: isDirect ? 'Direct' : 'Transitive',
            immediateParent: current.path,
            immediateParentName: path.basename(current.path),
            propagationPath: nextTrace,
            propagationSummary: nextTrace.map((p) => path.basename(p)).join(' ➔ '),
            stepTrace: nextStepTrace,
            relationships,
            importedSymbols: Array.from(new Set(importedSymbols)),
            calls: callSites,
            extends: extendsList,
            implements: implementsList,
            impactReason,
            metrics: depRecord.metrics,
            declaredSymbols: depRecord.declaredSymbols
          };

          if (isDirect) {
            directDependents.push(depData);
          } else {
            indirectDependents.push(depData);
          }

          // Build impact chain
          impactChains.push({
            target: depPath,
            targetName: depFileName,
            depth: nextDepth,
            isDirect,
            path: nextTrace,
            summary: nextTrace.map((p) => path.basename(p)).join(' ➔ '),
            steps: nextStepTrace
          });

          // Add to Impact Tree
          const treeNode = {
            path: depPath,
            name: depFileName,
            depth: nextDepth,
            impactType: isDirect ? 'direct' : 'indirect',
            relationship: primaryRelLabel,
            children: []
          };
          nodeTreeMap.set(depPath, treeNode);

          const parentTreeNode = nodeTreeMap.get(current.path);
          if (parentTreeNode) {
            parentTreeNode.children.push(treeNode);
          }

          queue.push({
            path: depPath,
            depth: nextDepth,
            pathTrace: nextTrace,
            stepTrace: nextStepTrace
          });
        }
      }
    }

    const totalImpactedFiles = impactedPaths.size;
    const unaffectedFilesCount = Math.max(0, this.summary.totalFiles - totalImpactedFiles);
    const maxPropagationDepth = Math.max(0, ...directDependents.map((d) => d.depth), ...indirectDependents.map((d) => d.depth));
    const blastRadiusPercentage = Math.min(100, Math.round((totalImpactedFiles / Math.max(1, this.summary.totalFiles)) * 100));

    // 3. Filter Impacted Subgraph (ONLY impacted nodes and edges)
    const impactedNodes = this.nodes.filter((n) => impactedPaths.has(n.path)).map((n) => {
      const isSrc = n.path === resolvedSourcePath;
      const directDep = directDependents.find((d) => d.filePath === n.path);
      const indirectDep = indirectDependents.find((d) => d.filePath === n.path);
      const depth = isSrc ? 0 : directDep ? 1 : (indirectDep?.depth || 2);
      return {
        ...n,
        depth,
        isOrigin: isSrc,
        impactType: isSrc ? 'origin' : directDep ? 'direct' : 'indirect',
        impactLevel: isSrc ? 'Origin' : directDep ? 'Direct' : 'Transitive',
        impactReason: isSrc ? 'Modified Origin File' : (directDep?.impactReason || indirectDep?.impactReason || '')
      };
    });

    const impactedEdges = this.edges.filter((e) => impactedPaths.has(e.source) && impactedPaths.has(e.target));

    // 4. Categorize Real Affected Entities from impacted files
    const affectedApis = [];
    const affectedServices = [];
    const affectedComponents = [];
    const affectedDatabaseTables = [];
    const affectedTests = [];

    for (const p of impactedPaths) {
      const pLower = p.toLowerCase();
      const baseName = path.basename(p);
      const isSrc = p === resolvedSourcePath;
      const impactLabel = isSrc ? 'Origin' : directDependents.some((d) => d.filePath === p) ? 'Direct' : 'Transitive';

      if (pLower.includes('api') || pLower.includes('route') || pLower.includes('controller') || pLower.includes('endpoint') || pLower.includes('webhook') || pLower.includes('router') || pLower.includes('handler')) {
        affectedApis.push({
          path: p,
          name: baseName,
          type: 'HTTP / API Endpoint',
          impact: impactLabel,
          detail: `API route handler in \`${p}\``
        });
      }

      if (pLower.includes('service') || pLower.includes('client') || pLower.includes('worker') || pLower.includes('consumer') || pLower.includes('provider') || pLower.includes('engine')) {
        affectedServices.push({
          path: p,
          name: baseName,
          type: 'Business Service',
          impact: impactLabel,
          detail: `Domain service execution logic in \`${p}\``
        });
      }

      if (pLower.includes('component') || pLower.includes('page') || pLower.includes('view') || pLower.includes('.jsx') || pLower.includes('.tsx') || pLower.includes('.vue') || pLower.includes('.svelte')) {
        affectedComponents.push({
          path: p,
          name: baseName,
          type: 'UI Component',
          impact: impactLabel,
          detail: `Render tree component in \`${p}\``
        });
      }

      if (pLower.includes('db') || pLower.includes('model') || pLower.includes('schema') || pLower.includes('entity') || pLower.includes('table') || pLower.includes('repository') || pLower.includes('store') || pLower.includes('dao')) {
        affectedDatabaseTables.push({
          path: p,
          name: baseName,
          type: 'Data Model / Entity',
          impact: impactLabel,
          detail: `Persistence model schema in \`${p}\``
        });
      }

      if (pLower.includes('test') || pLower.includes('spec') || pLower.includes('__tests__')) {
        affectedTests.push({
          path: p,
          name: baseName,
          type: 'Test Suite',
          impact: impactLabel,
          priority: 'Required'
        });
      }
    }

    // 5. Build Dynamic Concentric Layers
    const layer0Items = [{
      name: sourceFileName,
      path: resolvedSourcePath,
      type: sourceFileRecord.extension,
      impact: 'Origin',
      detail: `Modified origin file with ${sourceFileRecord.metrics.fanOut} outgoing dependencies and ${sourceFileRecord.metrics.fanIn} dependents`
    }];

    const layer1Items = directDependents.map((d) => ({
      name: d.fileName,
      path: d.filePath,
      type: d.extension,
      impact: 'Direct',
      detail: d.impactReason
    }));

    const layer2Items = indirectDependents.filter((d) => d.depth === 2).map((d) => ({
      name: d.fileName,
      path: d.filePath,
      type: d.extension,
      impact: 'Transitive',
      detail: d.impactReason
    }));

    const layer3Items = indirectDependents.filter((d) => d.depth >= 3).map((d) => ({
      name: d.fileName,
      path: d.filePath,
      type: d.extension,
      impact: 'Global Scope',
      detail: d.impactReason
    }));

    const concentricLayers = [
      {
        level: 0,
        name: 'Layer 0: Modified Source File',
        riskColor: 'rose',
        description: `Direct modified origin file in ${this.repositoryName}`,
        items: layer0Items,
        nodes: [resolvedSourcePath]
      },
      {
        level: 1,
        name: 'Layer 1: Direct Dependents (1-Hop)',
        riskColor: 'amber',
        description: `Modules directly importing or calling symbols from ${sourceFileName}`,
        items: layer1Items,
        nodes: directDependents.map((d) => d.filePath)
      },
      {
        level: 2,
        name: 'Layer 2: Downstream Indirect Dependents (2-Hops)',
        riskColor: 'indigo',
        description: 'Transitive callers and services receiving propagated changes',
        items: layer2Items,
        nodes: indirectDependents.filter((d) => d.depth === 2).map((d) => d.filePath)
      },
      {
        level: 3,
        name: 'Layer 3: Global Transitive Scope (3+ Hops)',
        riskColor: 'cyan',
        description: 'High-level application entry points, APIs, or database consumers',
        items: layer3Items,
        nodes: indirectDependents.filter((d) => d.depth >= 3).map((d) => d.filePath)
      }
    ];

    // 6. Dynamic Risk Score Calculation
    let riskScore = Math.min(100, Math.round(blastRadiusPercentage * 0.5) + (directDependents.length * 8) + (maxPropagationDepth * 6));
    if (affectedDatabaseTables.length > 0) riskScore += 12;
    if (affectedApis.length > 0) riskScore += 10;
    riskScore = Math.min(100, Math.max(15, riskScore));

    const riskLevel = riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';

    const executionTimeMs = Date.now() - startTime;

    return {
      repositoryName: this.repositoryName,
      repoId: this.repoId,
      sourceFile: {
        path: resolvedSourcePath,
        name: sourceFileName,
        extension: sourceFileRecord.extension,
        sizeBytes: sourceFileRecord.sizeBytes,
        metrics: sourceFileRecord.metrics,
        declaredSymbols: sourceFileRecord.declaredSymbols
      },
      algorithmUsed: algorithm === 'dfs' ? 'DFS Traversal (Depth-First Search)' : 'BFS Traversal (Breadth-First Search)',
      directDependents,
      indirectDependents,
      totalImpactedFiles,
      directDependentsCount: directDependents.length,
      indirectDependentsCount: indirectDependents.length,
      unaffectedFilesCount,
      impactChains,
      impactTree,
      impactedNodes,
      impactedEdges,
      concentricLayers,
      layers: concentricLayers,
      impactedLayers: concentricLayers.map((l) => ({ layer: l.level, title: l.name, nodes: l.nodes })),
      affectedApis,
      affectedServices,
      affectedComponents,
      affectedDatabaseTables,
      affectedTests,
      metrics: {
        totalFilesInRepo: this.summary.totalFiles,
        directImpactCount: directDependents.length,
        indirectImpactCount: indirectDependents.length,
        totalImpactedCount: totalImpactedFiles,
        unaffectedFilesCount,
        blastRadiusPercentage,
        maxPropagationDepth,
        riskScore,
        riskLevel,
        executionTimeMs
      },
      overallRiskScore: riskScore,
      riskLevel,
      overallRiskIndex: `${riskLevel} (${riskScore}/100)`,
      executionTimeMs
    };
  }

  /**
   * Export to standard JSON representation for serialization and API responses
   */
  toJSON() {
    const filesObject = {};
    for (const [key, value] of this.files.entries()) {
      filesObject[key] = value;
    }

    const symbolRegistryObject = {};
    for (const [key, value] of this.symbolRegistry.entries()) {
      symbolRegistryObject[key] = value;
    }

    return {
      repoId: this.repoId,
      repositoryName: this.repositoryName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      summary: this.summary,
      files: filesObject,
      symbolRegistry: symbolRegistryObject,
      nodes: this.nodes,
      edges: this.edges
    };
  }
}

/**
 * In-Memory Store for Reusable Dependency Graphs
 */
class DependencyIndexStore {
  constructor() {
    this.indices = new Map(); // repoId -> DependencyIndex
    this.activeRepoId = null;
  }

  set(repoId, index) {
    this.indices.set(repoId, index);
    this.activeRepoId = repoId;
  }

  get(repoId) {
    if (repoId && this.indices.has(repoId)) {
      return this.indices.get(repoId);
    }
    if (this.activeRepoId && this.indices.has(this.activeRepoId)) {
      return this.indices.get(this.activeRepoId);
    }
    return null;
  }

  has(repoId) {
    return this.indices.has(repoId);
  }

  getAll() {
    return Array.from(this.indices.values());
  }

  clear(repoId) {
    if (repoId) {
      this.indices.delete(repoId);
      if (this.activeRepoId === repoId) {
        this.activeRepoId = this.indices.keys().next().value || null;
      }
    } else {
      this.indices.clear();
      this.activeRepoId = null;
    }
  }
}

export const inMemoryDependencyIndexStore = new DependencyIndexStore();

/**
 * Service to build and maintain the Dependency Index
 */
export const dependencyIndexBuilderService = {
  /**
   * Main Entry Point: Build Dependency Index from scanned repository data
   * @param {Object} params
   * @param {string} params.repoId - Unique repository ID
   * @param {string} params.repositoryName - Repository name
   * @param {Array<Object>} params.files - List of file objects with { path, content, sizeBytes }
   * @param {string} [params.rootPath] - Optional directory root path
   * @returns {DependencyIndex}
   */
  buildIndex: ({ repoId, repositoryName, files = [], rootPath = null }) => {
    const startTime = Date.now();
    const resolvedRepoId = repoId || `repo-${Date.now()}`;
    const resolvedRepoName = repositoryName || 'repository';

    logger.info(`Building Dependency Index for repo '${resolvedRepoName}' (${resolvedRepoId}) with ${files.length} files`);

    const index = new DependencyIndex(resolvedRepoId, resolvedRepoName);

    // Filter and prepare file list
    const fileEntries = [];
    const filePathSet = new Set();
    const filePathNormalizedMap = new Map(); // lowercase -> original path

    // 1. Initial Pass: Register all valid source and config files
    for (const f of files) {
      if (!f || !f.path) continue;
      const normPath = normalizePath(f.path);
      if (!normPath) continue;

      let content = f.content || '';
      if (!content && f.buffer) {
        try {
          content = f.buffer.toString('utf8');
        } catch (e) {
          content = '';
        }
      } else if (!content && f.filePath && fs.existsSync(f.filePath)) {
        try {
          content = fs.readFileSync(f.filePath, 'utf8');
        } catch (e) {
          content = '';
        }
      } else if (!content && rootPath) {
        const fullDiskPath = path.join(rootPath, normPath);
        if (fs.existsSync(fullDiskPath)) {
          try {
            content = fs.readFileSync(fullDiskPath, 'utf8');
          } catch (e) {
            content = '';
          }
        }
      }

      fileEntries.push({
        path: normPath,
        name: path.basename(normPath),
        ext: path.extname(normPath).toLowerCase(),
        content,
        sizeBytes: f.sizeBytes || f.size || (content ? Buffer.byteLength(content, 'utf8') : 512)
      });

      filePathSet.add(normPath);
      filePathNormalizedMap.set(normPath.toLowerCase(), normPath);
    }

    index.summary.totalFiles = fileEntries.length;

    // Helper: Path Resolver to resolve import specifier to exact repository file path
    const resolveImportPath = (currentFilePath, specifier) => {
      if (!specifier || typeof specifier !== 'string') return null;
      const cleanSpec = specifier.trim().replace(/['"]/g, '');

      // Handle root-relative alias paths e.g. "@/components/Button" or "~/utils"
      if (cleanSpec.startsWith('@/') || cleanSpec.startsWith('~/')) {
        const relativeSubPath = cleanSpec.slice(2);
        const candidatePaths = [
          relativeSubPath,
          `src/${relativeSubPath}`,
          `app/${relativeSubPath}`,
          `lib/${relativeSubPath}`
        ];
        for (const cand of candidatePaths) {
          const resolved = testCandidateExtensions(cand, filePathSet, filePathNormalizedMap);
          if (resolved) return resolved;
        }
      }

      // Handle Relative paths: './', '../'
      if (cleanSpec.startsWith('.')) {
        const currentDir = path.dirname(currentFilePath);
        const combined = path.normalize(path.join(currentDir, cleanSpec)).replace(/\\/g, '/').replace(/^\/+/, '');
        const resolved = testCandidateExtensions(combined, filePathSet, filePathNormalizedMap);
        if (resolved) return resolved;
      }

      // Handle package/namespace matches (e.g. Go, Java, Python packages)
      const sanitizedSpec = cleanSpec.replace(/\./g, '/');
      const cand1 = testCandidateExtensions(sanitizedSpec, filePathSet, filePathNormalizedMap);
      if (cand1) return cand1;

      const cand2 = testCandidateExtensions(`src/${sanitizedSpec}`, filePathSet, filePathNormalizedMap);
      if (cand2) return cand2;

      return null;
    };

    // 2. Pass A: Discover all declared classes, interfaces, functions, and symbols across the repository
    for (const file of fileEntries) {
      const fileExt = file.ext;
      const content = file.content;
      const normPath = file.path;

      // Initialize file dependency record
      const fileRecord = {
        path: normPath,
        name: file.name,
        extension: fileExt,
        sizeBytes: file.sizeBytes,
        imports: [],
        importedBy: [],
        extends: [],
        implements: [],
        calls: [],
        references: [],
        declaredSymbols: {
          classes: [],
          interfaces: [],
          functions: [],
          types: [],
          constants: []
        },
        metrics: {
          importsCount: 0,
          importedByCount: 0,
          extendsCount: 0,
          implementsCount: 0,
          callsCount: 0,
          referencesCount: 0,
          fanIn: 0,
          fanOut: 0
        }
      };

      index.files.set(normPath, fileRecord);

      // Register declared symbols from file content
      extractDeclaredSymbols(fileRecord, content, fileExt, index.symbolRegistry);
    }

    // 3. Pass B: Parse Imports, Extends, Implements, Calls, and References for every file
    for (const file of fileEntries) {
      const normPath = file.path;
      const content = file.content;
      const fileExt = file.ext;
      const fileRecord = index.files.get(normPath);

      if (!content || content.trim().length === 0) continue;

      // Extract Imports
      parseImports(fileRecord, content, fileExt, resolveImportPath, index);

      // Extract Extends (Inheritance)
      parseExtends(fileRecord, content, fileExt, index.symbolRegistry);

      // Extract Implements (Interface / Trait Implementation)
      parseImplements(fileRecord, content, fileExt, index.symbolRegistry);

      // Extract Calls (Function, Method, Constructor, API, DB calls)
      parseCalls(fileRecord, content, fileExt, index.symbolRegistry);

      // Extract References (Types, Models, Schemas, Enums, Constants, Decorators)
      parseReferences(fileRecord, content, fileExt, index.symbolRegistry);
    }

    // 4. Pass C: Build Inverted Dependency ("Imported By") and Adjacency Graph
    for (const [normPath, fileRecord] of index.files.entries()) {
      for (const imp of fileRecord.imports) {
        if (!imp.isExternal && imp.resolvedPath && index.files.has(imp.resolvedPath)) {
          const targetRecord = index.files.get(imp.resolvedPath);

          // Add to importedBy of the target file
          targetRecord.importedBy.push({
            filePath: normPath,
            importedSymbols: imp.importedSymbols || [],
            specifier: imp.specifier,
            line: imp.line
          });

          // Forward & Reverse Adjacency
          if (!index.forwardAdjacency.has(normPath)) {
            index.forwardAdjacency.set(normPath, new Set());
          }
          index.forwardAdjacency.get(normPath).add(imp.resolvedPath);

          if (!index.reverseAdjacency.has(imp.resolvedPath)) {
            index.reverseAdjacency.set(imp.resolvedPath, new Set());
          }
          index.reverseAdjacency.get(imp.resolvedPath).add(normPath);

          // Add Graph Edge
          addEdge(index, normPath, imp.resolvedPath, 'import', `imports from ${path.basename(imp.resolvedPath)}`);
          index.summary.totalInternalDependencies++;
        } else if (imp.isExternal) {
          index.summary.totalExternalDependencies++;
          // External node
          const extNodeId = `pkg:${imp.specifier}`;
          addExternalNode(index, extNodeId, imp.specifier);
          addEdge(index, normPath, extNodeId, 'import', `imports package ${imp.specifier}`);
        }
        index.summary.totalImports++;
      }

      // Add Inheritance & Implementation Edges
      for (const ext of fileRecord.extends) {
        index.summary.totalExtends++;
        if (ext.resolvedTargetFile && ext.resolvedTargetFile !== normPath) {
          addEdge(index, normPath, ext.resolvedTargetFile, 'extends', `${ext.className} extends ${ext.superClass}`);
        }
      }

      for (const impl of fileRecord.implements) {
        index.summary.totalImplements++;
        if (impl.resolvedTargetFile && impl.resolvedTargetFile !== normPath) {
          addEdge(index, normPath, impl.resolvedTargetFile, 'implements', `${impl.className} implements ${impl.interfaceName}`);
        }
      }

      // Add Call Edges
      for (const call of fileRecord.calls) {
        index.summary.totalCalls++;
        if (call.resolvedTargetFile && call.resolvedTargetFile !== normPath) {
          addEdge(index, normPath, call.resolvedTargetFile, 'call', `${call.caller || 'module'} calls ${call.callee}`);
        }
      }

      // Add Reference Edges
      for (const ref of fileRecord.references) {
        index.summary.totalReferences++;
        if (ref.resolvedTargetFile && ref.resolvedTargetFile !== normPath) {
          addEdge(index, normPath, ref.resolvedTargetFile, 'reference', `references ${ref.name}`);
        }
      }
    }

    // 5. Pass D: Compute Metrics, Circular Dependencies, Entry Points, and Graph Nodes
    for (const [normPath, fileRecord] of index.files.entries()) {
      fileRecord.metrics.importsCount = fileRecord.imports.length;
      fileRecord.metrics.importedByCount = fileRecord.importedBy.length;
      fileRecord.metrics.extendsCount = fileRecord.extends.length;
      fileRecord.metrics.implementsCount = fileRecord.implements.length;
      fileRecord.metrics.callsCount = fileRecord.calls.length;
      fileRecord.metrics.referencesCount = fileRecord.references.length;

      fileRecord.metrics.fanOut = fileRecord.imports.filter((i) => !i.isExternal).length;
      fileRecord.metrics.fanIn = fileRecord.importedBy.length;

      // Identify isolated files
      if (fileRecord.metrics.importsCount === 0 && fileRecord.metrics.importedByCount === 0) {
        index.summary.isolatedFiles.push(normPath);
      }

      // Identify entry point candidates (has imports, but imported by few or 0 other files, or standard naming)
      const baseLower = path.basename(normPath).toLowerCase();
      if (
        ['index.js', 'index.ts', 'main.js', 'main.ts', 'server.js', 'server.ts', 'app.js', 'app.ts', 'main.go', 'main.py', 'app.py', 'application.java', 'app.tsx', 'main.rs'].includes(baseLower) ||
        (fileRecord.metrics.importedByCount === 0 && fileRecord.metrics.importsCount > 0)
      ) {
        index.summary.entryPoints.push(normPath);
      }

      // Create Graph Node
      index.nodes.push({
        id: normPath,
        label: path.basename(normPath),
        path: normPath,
        type: categorizeNodeType(normPath, fileRecord),
        category: categorizeNodeCategory(normPath, fileRecord),
        metrics: fileRecord.metrics
      });
    }

    // Detect Circular Dependencies
    index.summary.circularDependencies = detectCycles(index.forwardAdjacency);

    const durationMs = Date.now() - startTime;
    logger.info(`Dependency Index built in ${durationMs}ms: ${index.files.size} files, ${index.edges.length} edges, ${index.summary.totalImports} imports`);

    // Store in global in-memory store
    inMemoryDependencyIndexStore.set(resolvedRepoId, index);

    return index;
  },

  /**
   * Get dependency index for a repository
   */
  getIndex: (repoId) => {
    return inMemoryDependencyIndexStore.get(repoId);
  },

  /**
   * Get specific file dependencies
   */
  getFileDependencies: (repoId, filePath) => {
    const index = inMemoryDependencyIndexStore.get(repoId);
    if (!index) return null;
    return index.getFileDependencies(filePath);
  },

  /**
   * Clear in-memory store
   */
  clearStore: (repoId) => {
    inMemoryDependencyIndexStore.clear(repoId);
  }
};

/**
 * Helper to test candidate file extensions during import resolution
 */
function testCandidateExtensions(basePath, filePathSet, filePathNormalizedMap) {
  const extensionsToTry = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.java', '.rs', '.cs', '.php', '.json'];
  const indexFilesToTry = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.mjs', '/__init__.py', '/mod.rs'];

  for (const ext of extensionsToTry) {
    const testPath = `${basePath}${ext}`.toLowerCase();
    if (filePathNormalizedMap.has(testPath)) {
      return filePathNormalizedMap.get(testPath);
    }
  }

  for (const idx of indexFilesToTry) {
    const testPath = `${basePath}${idx}`.toLowerCase();
    if (filePathNormalizedMap.has(testPath)) {
      return filePathNormalizedMap.get(testPath);
    }
  }

  return null;
}

/**
 * Helper to add a graph edge with de-duplication
 */
function addEdge(index, source, target, type, label) {
  const key = `${source}->${target}:${type}`;
  if (!index.edgeSet.has(key)) {
    index.edgeSet.add(key);
    index.edges.push({
      id: `edge-${index.edges.length + 1}`,
      source,
      target,
      type,
      label,
      weight: type === 'extends' || type === 'implements' ? 3 : type === 'call' ? 2 : 1
    });

    if (!index.forwardAdjacency.has(source)) {
      index.forwardAdjacency.set(source, new Set());
    }
    index.forwardAdjacency.get(source).add(target);

    if (!index.reverseAdjacency.has(target)) {
      index.reverseAdjacency.set(target, new Set());
    }
    index.reverseAdjacency.get(target).add(source);
  }
}

/**
 * Helper to add external package/module node
 */
function addExternalNode(index, id, label) {
  if (!index.nodes.some((n) => n.id === id)) {
    index.nodes.push({
      id,
      label,
      path: label,
      type: 'external',
      category: 'Third-Party Package'
    });
  }
}

/**
 * Categorize node architectural tier
 */
function categorizeNodeType(filePath, fileRecord) {
  const p = filePath.toLowerCase();
  if (p.includes('controller') || p.includes('route') || p.includes('endpoint') || p.includes('view') || p.includes('page')) return 'controller';
  if (p.includes('service') || p.includes('usecase') || p.includes('handler') || p.includes('manager')) return 'service';
  if (p.includes('repository') || p.includes('repo') || p.includes('dao') || p.includes('model') || p.includes('schema') || p.includes('entity')) return 'data-access';
  if (p.includes('middleware') || p.includes('guard') || p.includes('auth') || p.includes('security')) return 'security';
  if (p.includes('util') || p.includes('helper') || p.includes('common') || p.includes('shared')) return 'utility';
  if (p.includes('component') || p.includes('widget') || p.includes('ui')) return 'component';
  if (p.includes('config') || p.includes('.env') || p.includes('settings')) return 'config';
  return 'module';
}

function categorizeNodeCategory(filePath, fileRecord) {
  const p = filePath.toLowerCase();
  if (p.includes('controller') || p.includes('route')) return 'HTTP Controller & API';
  if (p.includes('service')) return 'Core Business Service';
  if (p.includes('model') || p.includes('schema') || p.includes('repository')) return 'Data Model & Persistence';
  if (p.includes('middleware') || p.includes('auth')) return 'Security Middleware';
  if (p.includes('component')) return 'UI Component';
  return 'Source Module';
}

/**
 * Extract declared symbols (classes, interfaces, functions, types) from a file
 */
function extractDeclaredSymbols(fileRecord, content, ext, symbolRegistry) {
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

    // 1. Classes
    const classMatch = trimmed.match(/(?:export\s+(?:default\s+)?)?(?:public|private|protected|abstract|final)?\s*class\s+([A-Za-z0-9_$]+)/);
    if (classMatch) {
      const name = classMatch[1];
      fileRecord.declaredSymbols.classes.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'class', fileRecord.path, lineNum);
    }

    // Python Class
    const pyClassMatch = trimmed.match(/^class\s+([A-Za-z0-9_$]+)(?:\([^)]*\))?:/);
    if (pyClassMatch) {
      const name = pyClassMatch[1];
      fileRecord.declaredSymbols.classes.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'class', fileRecord.path, lineNum);
    }

    // Go / Rust Structs
    const structMatch = trimmed.match(/(?:type\s+([A-Za-z0-9_$]+)\s+struct\b|(?:pub\s+)?struct\s+([A-Za-z0-9_$]+)\b)/);
    if (structMatch) {
      const name = structMatch[1] || structMatch[2];
      fileRecord.declaredSymbols.classes.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'struct', fileRecord.path, lineNum);
    }

    // 2. Interfaces / Traits / Protocols
    const ifaceMatch = trimmed.match(/(?:export\s+)?(?:public|private|protected)?\s*(?:interface|trait|protocol)\s+([A-Za-z0-9_$]+)/);
    if (ifaceMatch) {
      const name = ifaceMatch[1];
      fileRecord.declaredSymbols.interfaces.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'interface', fileRecord.path, lineNum);
    }

    // Go Interface
    const goIfaceMatch = trimmed.match(/type\s+([A-Za-z0-9_$]+)\s+interface\b/);
    if (goIfaceMatch) {
      const name = goIfaceMatch[1];
      fileRecord.declaredSymbols.interfaces.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'interface', fileRecord.path, lineNum);
    }

    // 3. Functions
    const funcMatch = trimmed.match(/(?:export\s+(?:async\s+)?)?function\s+([A-Za-z0-9_$]+)|(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([A-Za-z0-9_$]+)\s*\(|func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_$]+)\s*\(/);
    if (funcMatch) {
      const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4];
      if (name && !['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
        fileRecord.declaredSymbols.functions.push({ name, line: lineNum });
        registerSymbol(symbolRegistry, name, 'function', fileRecord.path, lineNum);
      }
    }

    // 4. Types / Enums / Constants
    const typeMatch = trimmed.match(/(?:export\s+)?type\s+([A-Za-z0-9_$]+)\s*=|enum\s+([A-Za-z0-9_$]+)/);
    if (typeMatch) {
      const name = typeMatch[1] || typeMatch[2];
      fileRecord.declaredSymbols.types.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'type', fileRecord.path, lineNum);
    }

    const constMatch = trimmed.match(/export\s+const\s+([A-Z0-9_]{3,})\b/);
    if (constMatch) {
      const name = constMatch[1];
      fileRecord.declaredSymbols.constants.push({ name, line: lineNum });
      registerSymbol(symbolRegistry, name, 'constant', fileRecord.path, lineNum);
    }
  });
}

function registerSymbol(symbolRegistry, name, kind, definingFile, line) {
  if (!symbolRegistry.has(name)) {
    symbolRegistry.set(name, []);
  }
  symbolRegistry.get(name).push({
    name,
    kind,
    definingFile,
    line
  });
}

/**
 * Parse Imports across multiple languages
 */
function parseImports(fileRecord, content, ext, resolveImportPath, index) {
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // 1. ES Module Imports: import ... from '...' OR export ... from '...'
    const esmMatch = trimmed.match(/(?:import\s+(?:([\w*\s{},$]+)\s+from\s+)?|export\s+(?:([\w*\s{},$]+)\s+from\s+)?)['"]([^'"]+)['"]/);
    if (esmMatch) {
      const clause = esmMatch[1] || esmMatch[2] || '';
      const specifier = esmMatch[3];
      const isExt = isExternalSpecifier(specifier);
      const resolvedPath = isExt ? null : resolveImportPath(fileRecord.path, specifier);
      const symbols = extractImportSymbols(clause);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: isExt || !resolvedPath,
        importedSymbols: symbols,
        importType: 'esm',
        line: lineNum
      });
      return;
    }

    // 2. CommonJS require: require('...') or import('...')
    const cjsMatch = trimmed.match(/(?:require|import)\(['"]([^'"]+)['"]\)/);
    if (cjsMatch) {
      const specifier = cjsMatch[1];
      const isExt = isExternalSpecifier(specifier);
      const resolvedPath = isExt ? null : resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: isExt || !resolvedPath,
        importedSymbols: ['*'],
        importType: 'commonjs',
        line: lineNum
      });
      return;
    }

    // 3. Python: from foo import bar OR import foo
    const pyFromMatch = trimmed.match(/^from\s+([^\s]+)\s+import\s+([^#\n]+)/);
    if (pyFromMatch) {
      const specifier = pyFromMatch[1];
      const symbolNames = pyFromMatch[2].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]);
      const isExt = !specifier.startsWith('.');
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: symbolNames,
        importType: 'python',
        line: lineNum
      });
      return;
    }

    const pyImportMatch = trimmed.match(/^import\s+([^\s,#]+)/);
    if (pyImportMatch) {
      const specifier = pyImportMatch[1].split(/\s+as\s+/)[0];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: ['*'],
        importType: 'python',
        line: lineNum
      });
      return;
    }

    // 4. Java / Kotlin: import com.example.service.UserService;
    const javaImportMatch = trimmed.match(/^import\s+(?:static\s+)?([A-Za-z0-9_.]+);/);
    if (javaImportMatch) {
      const specifier = javaImportMatch[1];
      const parts = specifier.split('.');
      const symbol = parts[parts.length - 1];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: [symbol],
        importType: 'java',
        line: lineNum
      });
      return;
    }

    // 5. Go: import "..." or import ( ... )
    const goImportMatch = trimmed.match(/import\s+(?:\w+\s+)?["']([^"']+)["']/);
    if (goImportMatch) {
      const specifier = goImportMatch[1];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: ['*'],
        importType: 'go',
        line: lineNum
      });
      return;
    }

    // 6. C# / .NET: using System; using MyProject.Services;
    const csUsingMatch = trimmed.match(/^using\s+([A-Za-z0-9_.]+);/);
    if (csUsingMatch) {
      const specifier = csUsingMatch[1];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: ['*'],
        importType: 'csharp',
        line: lineNum
      });
      return;
    }

    // 7. Rust: use crate::models::User;
    const rustUseMatch = trimmed.match(/^use\s+([A-Za-z0-9_:]+)(?:\{([^}]+)\})?;/);
    if (rustUseMatch) {
      const specifier = rustUseMatch[1];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier.replace(/::/g, '/'));

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: rustUseMatch[2] ? rustUseMatch[2].split(',').map((s) => s.trim()) : ['*'],
        importType: 'rust',
        line: lineNum
      });
      return;
    }

    // 8. C / C++: #include "..." or #include <...>
    const cIncludeMatch = trimmed.match(/^#include\s+["<]([^">]+)[">]/);
    if (cIncludeMatch) {
      const specifier = cIncludeMatch[1];
      const resolvedPath = resolveImportPath(fileRecord.path, specifier);

      fileRecord.imports.push({
        specifier,
        resolvedPath,
        isExternal: !resolvedPath,
        importedSymbols: ['*'],
        importType: 'c_include',
        line: lineNum
      });
    }
  });
}

function extractImportSymbols(clause) {
  if (!clause || !clause.trim()) return ['*'];
  const symbols = [];
  const cleaned = clause.trim();

  // default import e.g. "React, { useState, useEffect }"
  if (cleaned.includes('{')) {
    const parts = cleaned.split('{');
    const defaultPart = parts[0].replace(',', '').trim();
    if (defaultPart) symbols.push(defaultPart);

    const namedPart = parts[1].replace('}', '').trim();
    namedPart.split(',').forEach((sym) => {
      const s = sym.trim().split(/\s+as\s+/)[0];
      if (s) symbols.push(s);
    });
  } else if (cleaned.startsWith('* as ')) {
    symbols.push(cleaned.replace('* as ', '').trim());
  } else {
    symbols.push(cleaned);
  }

  return symbols;
}

/**
 * Parse Class / Interface Extends (Inheritance)
 */
function parseExtends(fileRecord, content, ext, symbolRegistry) {
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // JS/TS: class Foo extends Bar OR interface IFoo extends IBar, IBaz
    const extendsMatch = trimmed.match(/(?:class|interface)\s+([A-Za-z0-9_$]+)\s+extends\s+([A-Za-z0-9_$,\s]+?)(?:\s+implements\s+|[\{\(]|$)/);
    if (extendsMatch) {
      const className = extendsMatch[1];
      const superClasses = extendsMatch[2].split(',').map((s) => s.trim()).filter(Boolean);
      for (const superClass of superClasses) {
        const resolved = resolveSymbolLocation(superClass, symbolRegistry);
        fileRecord.extends.push({
          className,
          superClass,
          resolvedTargetFile: resolved?.definingFile || null,
          kind: trimmed.includes('interface ') ? 'interface' : 'class',
          line: lineNum
        });
      }
      return;
    }

    // Python: class Foo(Bar, Baz):
    const pyExtendsMatch = trimmed.match(/^class\s+([A-Za-z0-9_$]+)\s*\(([^)]+)\)\s*:/);
    if (pyExtendsMatch) {
      const className = pyExtendsMatch[1];
      const bases = pyExtendsMatch[2].split(',').map((s) => s.trim()).filter((s) => s && s !== 'object' && s !== 'abc.ABC');
      for (const base of bases) {
        const resolved = resolveSymbolLocation(base, symbolRegistry);
        fileRecord.extends.push({
          className,
          superClass: base,
          resolvedTargetFile: resolved?.definingFile || null,
          kind: 'class',
          line: lineNum
        });
      }
      return;
    }

    // Java / C# / C++: class Foo : Bar OR class Foo extends Bar
    const javaExtendsMatch = trimmed.match(/class\s+([A-Za-z0-9_$]+)\s*(?:extends|:)\s*([A-Za-z0-9_$]+)/);
    if (javaExtendsMatch) {
      const className = javaExtendsMatch[1];
      const superClass = javaExtendsMatch[2];
      const resolved = resolveSymbolLocation(superClass, symbolRegistry);
      fileRecord.extends.push({
        className,
        superClass,
        resolvedTargetFile: resolved?.definingFile || null,
        kind: 'class',
        line: lineNum
      });
    }
  });
}

/**
 * Parse Interface / Trait Implements
 */
function parseImplements(fileRecord, content, ext, symbolRegistry) {
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // JS/TS/Java/C#: class Foo implements IFoo, IBar
    const implMatch = trimmed.match(/class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+[A-Za-z0-9_$]+)?\s+implements\s+([A-Za-z0-9_$,\s]+?)(?:[\{\(]|$)/);
    if (implMatch) {
      const className = implMatch[1];
      const interfaces = implMatch[2].split(',').map((s) => s.trim()).filter(Boolean);
      for (const iface of interfaces) {
        const resolved = resolveSymbolLocation(iface, symbolRegistry);
        fileRecord.implements.push({
          className,
          interfaceName: iface,
          resolvedTargetFile: resolved?.definingFile || null,
          line: lineNum
        });
      }
      return;
    }

    // Rust: impl TraitName for StructName
    const rustImplMatch = trimmed.match(/^impl\s+([A-Za-z0-9_]+)\s+for\s+([A-Za-z0-9_]+)/);
    if (rustImplMatch) {
      const interfaceName = rustImplMatch[1];
      const className = rustImplMatch[2];
      const resolved = resolveSymbolLocation(interfaceName, symbolRegistry);
      fileRecord.implements.push({
        className,
        interfaceName,
        resolvedTargetFile: resolved?.definingFile || null,
        line: lineNum
      });
    }
  });
}

/**
 * Parse Calls (Functions, Methods, Constructors, API, DB queries)
 */
function parseCalls(fileRecord, content, ext, symbolRegistry) {
  const lines = content.split('\n');
  const seenCalls = new Set();

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

    // 1. Constructor Instantiations: new ClassName(...)
    const newMatches = trimmed.matchAll(/new\s+([A-Z][A-Za-z0-9_$]+)\s*\(/g);
    for (const match of newMatches) {
      const className = match[1];
      const callKey = `${lineNum}:new ${className}`;
      if (!seenCalls.has(callKey)) {
        seenCalls.add(callKey);
        const resolved = resolveSymbolLocation(className, symbolRegistry);
        fileRecord.calls.push({
          caller: 'constructor',
          callee: className,
          receiver: null,
          method: 'constructor',
          callType: 'constructor',
          resolvedTargetFile: resolved?.definingFile || null,
          line: lineNum,
          rawSnippet: trimmed.slice(0, 100)
        });
      }
    }

    // 2. Object Method Invocations: obj.method(...)
    const methodMatches = trimmed.matchAll(/([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\s*\(/g);
    for (const match of methodMatches) {
      const receiver = match[1];
      const method = match[2];
      if (['if', 'while', 'for', 'catch', 'switch'].includes(receiver) || ['log', 'error', 'warn'].includes(method)) continue;

      const fullCallee = `${receiver}.${method}`;
      const callKey = `${lineNum}:${fullCallee}`;
      if (!seenCalls.has(callKey)) {
        seenCalls.add(callKey);

        // Detect call type (API, Database, Service, Method)
        let callType = 'method';
        if (['router', 'app'].includes(receiver) && ['get', 'post', 'put', 'delete', 'patch', 'use'].includes(method)) {
          callType = 'api';
        } else if (['db', 'prisma', 'sequelize', 'mongoose', 'repository', 'repo'].includes(receiver.toLowerCase()) || ['find', 'findOne', 'findById', 'save', 'insert', 'update', 'delete', 'query'].includes(method)) {
          callType = 'database';
        } else if (receiver.toLowerCase().includes('service') || receiver.toLowerCase().includes('client') || receiver.toLowerCase().includes('api')) {
          callType = 'service';
        }

        const resolved = resolveSymbolLocation(receiver, symbolRegistry) || resolveSymbolLocation(method, symbolRegistry);

        fileRecord.calls.push({
          caller: null,
          callee: fullCallee,
          receiver,
          method,
          callType,
          resolvedTargetFile: resolved?.definingFile || null,
          line: lineNum,
          rawSnippet: trimmed.slice(0, 100)
        });
      }
    }

    // 3. Direct Function Calls: foo(...)
    const funcCallMatches = trimmed.matchAll(/(?:^|[^a-zA-Z0-9_$.])([a-zA-Z0-9_$]+)\s*\(/g);
    for (const match of funcCallMatches) {
      const funcName = match[1];
      if (['if', 'while', 'for', 'switch', 'catch', 'function', 'class', 'return', 'import', 'require', 'typeof', 'sizeof'].includes(funcName)) continue;

      const callKey = `${lineNum}:${funcName}`;
      if (!seenCalls.has(callKey)) {
        seenCalls.add(callKey);
        const resolved = resolveSymbolLocation(funcName, symbolRegistry);
        if (resolved || ['fetch', 'axios', 'exec', 'spawn'].includes(funcName)) {
          fileRecord.calls.push({
            caller: null,
            callee: funcName,
            receiver: null,
            method: funcName,
            callType: ['fetch', 'axios'].includes(funcName) ? 'api' : 'function',
            resolvedTargetFile: resolved?.definingFile || null,
            line: lineNum,
            rawSnippet: trimmed.slice(0, 100)
          });
        }
      }
    }
  });
}

/**
 * Parse References (Types, Models, Schemas, Enums, Constants, Decorators)
 */
function parseReferences(fileRecord, content, ext, symbolRegistry) {
  const lines = content.split('\n');
  const seenRefs = new Set();

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // 1. Decorators / Annotations: @Controller, @Injectable, @Entity, @Override
    const decoratorMatches = trimmed.matchAll(/@([A-Za-z0-9_$]+)/g);
    for (const match of decoratorMatches) {
      const name = match[1];
      const refKey = `${lineNum}:@${name}`;
      if (!seenRefs.has(refKey)) {
        seenRefs.add(refKey);
        const resolved = resolveSymbolLocation(name, symbolRegistry);
        fileRecord.references.push({
          name: `@${name}`,
          kind: 'decorator',
          resolvedTargetFile: resolved?.definingFile || null,
          isLocal: resolved?.definingFile === fileRecord.path,
          line: lineNum,
          context: trimmed.slice(0, 80)
        });
      }
    }

    // 2. Type Annotations / Generics: : TypeName, <TypeName>, as TypeName
    const typeRefMatches = trimmed.matchAll(/(?::\s*|<|as\s+)([A-Z][A-Za-z0-9_$]+)(?:>|\b)/g);
    for (const match of typeRefMatches) {
      const typeName = match[1];
      if (['String', 'Number', 'Boolean', 'Object', 'Array', 'Any', 'Void', 'Promise', 'Record', 'Set', 'Map'].includes(typeName)) continue;

      const refKey = `${lineNum}:${typeName}`;
      if (!seenRefs.has(refKey)) {
        seenRefs.add(refKey);
        const resolved = resolveSymbolLocation(typeName, symbolRegistry);
        fileRecord.references.push({
          name: typeName,
          kind: 'type',
          resolvedTargetFile: resolved?.definingFile || null,
          isLocal: resolved?.definingFile === fileRecord.path,
          line: lineNum,
          context: trimmed.slice(0, 80)
        });
      }
    }

    // 3. Constants / Enums: UPPER_CASE_IDENTIFIERS
    const constRefMatches = trimmed.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g);
    for (const match of constRefMatches) {
      const constName = match[1];
      if (['TRUE', 'FALSE', 'NULL', 'UNDEFINED', 'JSON', 'HTTP', 'REST', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(constName)) continue;

      const refKey = `${lineNum}:${constName}`;
      if (!seenRefs.has(refKey)) {
        seenRefs.add(refKey);
        const resolved = resolveSymbolLocation(constName, symbolRegistry);
        if (resolved) {
          fileRecord.references.push({
            name: constName,
            kind: 'constant',
            resolvedTargetFile: resolved.definingFile,
            isLocal: resolved.definingFile === fileRecord.path,
            line: lineNum,
            context: trimmed.slice(0, 80)
          });
        }
      }
    }
  });
}

/**
 * Resolve a symbol name to its defining file
 */
function resolveSymbolLocation(symbolName, symbolRegistry) {
  if (!symbolName || !symbolRegistry.has(symbolName)) return null;
  const list = symbolRegistry.get(symbolName);
  return list && list.length > 0 ? list[0] : null;
}

/**
 * Cycle Detection (Tarjan's / DFS for Circular Dependencies)
 */
function detectCycles(adjacencyMap) {
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];

  function dfs(node, pathArr) {
    visited.add(node);
    recStack.add(node);
    pathArr.push(node);

    const neighbors = adjacencyMap.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, pathArr);
      } else if (recStack.has(neighbor)) {
        const cycleStartIndex = pathArr.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycle = pathArr.slice(cycleStartIndex).concat(neighbor);
          cycles.push(cycle);
        }
      }
    }

    recStack.delete(node);
    pathArr.pop();
  }

  for (const node of adjacencyMap.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles.slice(0, 20); // Cap at 20 cycles for performance
}
