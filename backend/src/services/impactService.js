import { impactAnalysisEngineService } from './impactAnalysisEngineService.js';
import { repoUploadService } from './repoUploadService.js';

export const impactService = {
  /**
   * Get Blast Radius Layers for a given repository and optional changed file or diff
   */
  getBlastRadiusLayers: (
    commitHash = '8f92a1b',
    filePath = null,
    repoId = null,
    diffText = null,
    baseSha = null,
    targetSha = null,
    changedFiles = null
  ) => {
    const currentRepo = repoUploadService.getCurrentRepo();
    const resolvedRepoId = repoId || currentRepo?.id || currentRepo?.repoId || 'active-repo';

    const result = impactAnalysisEngineService.calculateImpact({
      changedFile: filePath,
      repoId: resolvedRepoId,
      commitHash,
      diffText,
      baseSha,
      targetSha,
      changedFiles,
      algorithm: 'bfs'
    });

    return {
      commitHash: result.input?.commitHash || commitHash,
      repositoryName: result.repositoryName || currentRepo?.name || 'repository',
      sourceCommit: commitHash,
      sourceFile: result.sourceFile,
      sourceFiles: result.sourceFiles || (result.sourceFile ? [result.sourceFile] : []),
      diff: result.diff || null,
      diffSummary: result.diffSummary || null,
      changedSymbols: result.changedSymbols || [],
      overallRiskIndex: result.overallRiskIndex || 'LOW (0/100)',
      overallRiskScore: result.overallRiskScore || 0,
      riskLevel: result.riskLevel || 'LOW',
      directImpactCount: result.directDependentsCount || 0,
      indirectImpactCount: result.indirectDependentsCount || 0,
      totalImpactedCount: result.totalImpactedFiles || 0,
      downstreamServicesCount: result.indirectDependentsCount || 0,
      publicEndpointsCount: result.affectedApis?.length || 0,
      databaseTablesCount: result.affectedDatabaseTables?.length || 0,
      directDependents: result.directDependents || [],
      indirectDependents: result.indirectDependents || [],
      totalImpactedFiles: result.totalImpactedFiles || 0,
      impactChains: result.impactChains || [],
      impactTree: result.impactTree,
      impactedNodes: result.impactedNodes || [],
      impactedEdges: result.impactedEdges || [],
      unaffectedFilesCount: result.unaffectedFilesCount || 0,
      metrics: result.metrics,
      layers: result.layers || [],
      concentricLayers: result.concentricLayers || result.layers || [],
      impactedLayers: result.impactedLayers || [],
      affectedFiles: result.affectedFiles || [],
      affectedApis: result.affectedApis || [],
      affectedServices: result.affectedServices || [],
      affectedComponents: result.affectedComponents || [],
      affectedDatabaseTables: result.affectedDatabaseTables || [],
      affectedTests: result.affectedTests || []
    };
  }
};
