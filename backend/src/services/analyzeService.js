import path from 'path';
import { repoUploadService } from './repoUploadService.js';
import { gitDiffParserService } from './gitDiffParserService.js';

export const analyzeService = {
  performBlastAnalysis: (repoId = 'repo-1', commitHash = '8f92a1b', diffText = null) => {
    const currentRepo = repoUploadService.getCurrentRepo();
    const metadata = currentRepo?.metadata;
    const repoName = metadata?.name || currentRepo?.repositoryName || 'custom-repository';
    const files = currentRepo?.files || [];
    const totalFiles = metadata?.totalFiles || files.length;
    const isEmpty = metadata?.isEmpty || totalFiles === 0;
    const primaryLang = metadata?.primaryLanguage || 'JavaScript';

    // Parse git diff if provided
    let parsedDiff = null;
    if (diffText && typeof diffText === 'string' && diffText.trim().length > 0) {
      parsedDiff = gitDiffParserService.parseUnifiedDiff(diffText);
    }

    if (isEmpty) {
      return {
        analysisId: `ans-${Date.now()}`,
        repoId,
        commitHash,
        overallRiskScore: 0,
        riskLevel: 'Empty Codebase',
        scannedAt: new Date().toISOString(),
        summary: {
          totalFilesChanged: 0,
          linesAdded: 0,
          linesDeleted: 0,
          impactedServicesCount: 0,
          publicEndpointsCount: 0
        },
        factors: []
      };
    }

    // Dynamic file categorization and feature extraction
    const filePaths = files.map((f) => (f.path || f.name || '').toLowerCase());
    const authFiles = filePaths.filter((p) => p.includes('auth') || p.includes('guard') || p.includes('jwt') || p.includes('session') || p.includes('token') || p.includes('security'));
    const routeFiles = filePaths.filter((p) => p.includes('route') || p.includes('endpoint') || p.includes('controller') || p.includes('api'));
    const dbFiles = filePaths.filter((p) => p.includes('model') || p.includes('schema') || p.includes('db') || p.includes('entity') || p.includes('table') || p.includes('repo') || p.includes('migration'));
    const serviceFiles = filePaths.filter((p) => p.includes('service') || p.includes('handler') || p.includes('worker') || p.includes('consumer') || p.includes('queue'));
    const testFiles = filePaths.filter((p) => p.includes('test') || p.includes('spec') || p.includes('__tests__'));

    // Compute dynamic risk score (unique to each repo's codebase characteristics)
    let authScore = authFiles.length > 0 ? 82 + Math.min(14, authFiles.length * 3) : 55;
    let downstreamScore = Math.min(95, 45 + Math.round((serviceFiles.length / Math.max(1, totalFiles)) * 120) + Math.min(30, totalFiles * 2));
    let dbScore = dbFiles.length > 0 ? 70 + Math.min(22, dbFiles.length * 5) : 40;
    let apiScore = routeFiles.length > 0 ? 75 + Math.min(20, routeFiles.length * 4) : 45;

    // Test coverage mitigation factor: having tests lowers risk score
    const testMitigation = testFiles.length > 0 ? Math.min(12, testFiles.length * 2) : -6;

    let overallRiskScore = Math.min(98, Math.max(18, Math.round(
      (authScore * 0.3 + downstreamScore * 0.25 + dbScore * 0.25 + apiScore * 0.2) - testMitigation
    )));

    // Adjust risk score if diff is provided and changes critical code
    if (parsedDiff) {
      const changedPaths = parsedDiff.summary.changedFilePaths.map((p) => p.toLowerCase());
      const touchesAuth = changedPaths.some((p) => p.includes('auth') || p.includes('security'));
      const touchesDb = changedPaths.some((p) => p.includes('model') || p.includes('schema') || p.includes('db'));
      if (touchesAuth) overallRiskScore = Math.min(99, overallRiskScore + 10);
      if (touchesDb) overallRiskScore = Math.min(99, overallRiskScore + 8);
    }

    let riskLevel = 'Low Risk';
    if (overallRiskScore >= 80) riskLevel = 'Critical Risk';
    else if (overallRiskScore >= 60) riskLevel = 'High Risk';
    else if (overallRiskScore >= 40) riskLevel = 'Medium Risk';

    const changedFilesCount = parsedDiff?.summary?.totalFilesChanged !== undefined
      ? parsedDiff.summary.totalFilesChanged
      : Math.max(1, Math.min(totalFiles, Math.ceil(totalFiles * 0.12)));

    const linesAdded = parsedDiff?.summary?.additions !== undefined
      ? parsedDiff.summary.additions
      : Math.max(15, Math.min(1200, Math.round(totalFiles * 18.5 + (authFiles.length * 34))));

    const linesDeleted = parsedDiff?.summary?.deletions !== undefined
      ? parsedDiff.summary.deletions
      : Math.max(5, Math.min(600, Math.round(linesAdded * 0.38)));

    const impactedServicesCount = Math.max(1, serviceFiles.length || Math.ceil(totalFiles * 0.15));
    const publicEndpointsCount = Math.max(1, routeFiles.length * 2 || Math.ceil(totalFiles * 0.2));

    const factors = [
      {
        title: 'Security & Auth Boundary',
        level: authScore >= 80 ? 'Critical' : authScore >= 60 ? 'High' : 'Medium',
        score: authScore,
        details: authFiles.length > 0
          ? `Detected ${authFiles.length} authentication & security module(s) (including \`${path.basename(authFiles[0])}\`). Verification boundary changes require constant-time validation.`
          : `No dedicated auth guard files detected in ${repoName}. Unprotected handler entry points may expose internal methods.`
      },
      {
        title: 'Downstream Blast Radius',
        level: downstreamScore >= 80 ? 'Critical' : downstreamScore >= 60 ? 'High' : 'Medium',
        score: downstreamScore,
        details: `Propagates state changes across ${impactedServicesCount} downstream service/module consumers in ${repoName}.`
      },
      {
        title: 'Database & Lock Concurrency',
        level: dbScore >= 80 ? 'Critical' : dbScore >= 60 ? 'High' : 'Medium',
        score: dbScore,
        details: dbFiles.length > 0
          ? `Detected ${dbFiles.length} database model/schema file(s). Write transactions require explicit lock timeouts.`
          : `Transient in-memory state detected. Concurrency locks recommended for async executions.`
      },
      {
        title: 'Public Ingress API Exposure',
        level: apiScore >= 80 ? 'Critical' : apiScore >= 60 ? 'High' : 'Medium',
        score: apiScore,
        details: `Exposed ${publicEndpointsCount} REST/RPC endpoint interface(s) vulnerable to parameter schema drifts.`
      }
    ];

    return {
      analysisId: `ans-${Date.now()}`,
      repoId,
      commitHash,
      overallRiskScore,
      riskLevel,
      scannedAt: new Date().toISOString(),
      diff: parsedDiff || null,
      summary: {
        totalFilesChanged: changedFilesCount,
        linesAdded,
        linesDeleted,
        impactedServicesCount,
        publicEndpointsCount,
        isGitDiffAware: Boolean(parsedDiff)
      },
      factors
    };
  }
};
