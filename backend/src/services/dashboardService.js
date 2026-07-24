import { repoUploadService } from './repoUploadService.js';

export const dashboardService = {
  getDashboardMetrics: () => {
    const currentRepo = repoUploadService.getCurrentRepo();
    const activeScans = [
      {
        id: 'scan-101',
        repoName: 'payment-gateway-service',
        changedFile: 'src/services/StripeWebhookHandler.ts',
        riskScore: 88,
        riskLevel: 'CRITICAL',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'scan-102',
        repoName: 'user-auth-microservice',
        changedFile: 'src/guards/OAuth2Guard.ts',
        riskScore: 74,
        riskLevel: 'HIGH',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    if (currentRepo?.metadata) {
      activeScans.unshift({
        id: `scan-${Date.now()}`,
        repoName: currentRepo.metadata.name,
        changedFile: currentRepo.files?.[0]?.path || 'src/server.js',
        riskScore: 78,
        riskLevel: 'HIGH',
        timestamp: currentRepo.metadata.scannedAt || new Date().toISOString()
      });
    }

    return {
      activeRepositoriesCount: currentRepo ? 5 : 4,
      overallBlastRiskIndex: 78,
      riskLevel: 'HIGH',
      downstreamMicroservicesCount: 14,
      aiSecurityEngine: {
        model: 'Antigravity Code Security Engine (Gemini 3.6 Flash)',
        status: 'ACTIVE',
        precision: 'High AST Precision'
      },
      quickStats: {
        totalFilesScanned: 1420 + (currentRepo?.metadata?.totalFiles || 0),
        totalApisMonitored: 42 + Math.ceil((currentRepo?.metadata?.totalFiles || 0) * 0.2),
        totalDatabaseTablesLocked: 8,
        totalTeamsNotified: 5
      },
      recentScans: activeScans
    };
  }
};
