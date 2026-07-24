export const metadataService = {
  getRepoMetadata: (repoId) => {
    return {
      repoId: repoId || 'repo-1',
      name: 'payment-gateway-service',
      owner: 'fintech-org',
      defaultBranch: 'main',
      branches: ['main', 'feature/v2-checkout-stripe', 'fix/token-leak-patch'],
      language: 'TypeScript / Node.js',
      stars: 124,
      fileCount: 312,
      dependenciesCount: 84,
      latestCommit: {
        hash: '8f92a1b',
        author: 'Alex Vance',
        message: 'refactor(payment): update Stripe webhooks payload processing & retry backoff strategy',
        timestamp: '2026-07-24 09:42:15'
      }
    };
  },

  getCommitDiff: (commitHash) => {
    return {
      commitHash: commitHash || '8f92a1b',
      author: 'Alex Vance',
      files: [
        { path: 'src/services/StripeWebhookHandler.ts', risk: 'High', additions: 84, deletions: 32 },
        { path: 'src/middleware/AuthenticationGuard.ts', risk: 'Critical', additions: 29, deletions: 14 },
        { path: 'src/database/models/TransactionLedger.ts', risk: 'Medium', additions: 19, deletions: 38 },
        { path: 'src/config/paymentConfig.ts', risk: 'Low', additions: 10, deletions: 5 }
      ]
    };
  }
};
