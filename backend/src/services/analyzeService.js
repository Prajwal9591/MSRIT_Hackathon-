export const analyzeService = {
  performBlastAnalysis: (repoId = 'repo-1', commitHash = '8f92a1b') => {
    return {
      analysisId: `ans-${Date.now()}`,
      repoId,
      commitHash,
      overallRiskScore: 78,
      riskLevel: 'High Risk',
      scannedAt: new Date().toISOString(),
      summary: {
        totalFilesChanged: 4,
        linesAdded: 142,
        linesDeleted: 89,
        impactedServicesCount: 5,
        publicEndpointsCount: 12
      },
      factors: [
        { title: 'Security & Auth Boundary', level: 'Critical', score: 88, details: 'Optional bypass flag exposed in handler signature.' },
        { title: 'Downstream Blast Radius', level: 'High', score: 76, details: 'Modifies 5 downstream microservices and 12 public endpoints.' },
        { title: 'Database & Lock Concurrency', level: 'Medium', score: 54, details: 'Redis idempotency locking added to payment webhook execution path.' },
        { title: 'Test Suite Coverage Drop', level: 'Low', score: 22, details: 'New signature error handling path lacks branch coverage.' }
      ]
    };
  }
};
