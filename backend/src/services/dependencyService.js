export const dependencyService = {
  getDependencyGraph: (repoId) => {
    return {
      repoId: repoId || 'repo-1',
      nodeCount: 8,
      edgeCount: 7,
      nodes: [
        { id: 'node-1', label: 'StripeWebhookHandler.ts', type: 'source', category: 'Modified Core', risk: 'High' },
        { id: 'node-2', label: 'AuthenticationGuard.ts', type: 'modified', category: 'Middleware', risk: 'Critical' },
        { id: 'node-3', label: 'TransactionLedger.ts', type: 'modified', category: 'Database Model', risk: 'Medium' },
        { id: 'node-4', label: 'PaymentRoutes.ts', type: 'downstream', category: 'HTTP Layer', risk: 'High' },
        { id: 'node-5', label: 'OrderProcessingService', type: 'service', category: 'External Service', risk: 'High' },
        { id: 'node-6', label: 'BillingAnalyticsWorker', type: 'service', category: 'Queue Consumer', risk: 'Medium' },
        { id: 'node-7', label: 'RedisLockProvider.ts', type: 'utility', category: 'Infrastructure', risk: 'Low' },
        { id: 'node-8', label: 'CustomerPortalAPI', type: 'service', category: 'Public Gateway', risk: 'High' }
      ],
      edges: [
        { source: 'node-1', target: 'node-2', label: 'uses auth guard', type: 'critical' },
        { source: 'node-1', target: 'node-3', label: 'writes ledger entry', type: 'high' },
        { source: 'node-1', target: 'node-7', label: 'acquires lock', type: 'normal' },
        { source: 'node-4', target: 'node-1', label: 'routes webhook POST', type: 'high' },
        { source: 'node-3', target: 'node-5', label: 'triggers sync', type: 'high' },
        { source: 'node-3', target: 'node-6', label: 'publishes payment.created', type: 'normal' },
        { source: 'node-5', target: 'node-8', label: 'updates status API', type: 'high' }
      ]
    };
  }
};
