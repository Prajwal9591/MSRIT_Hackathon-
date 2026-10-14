/**
 * Initial Seed Data for Past Analysis History & Session Snapshots
 */
export const seedAnalysisHistory = [
  {
    id: 'session-arbitrage-engine',
    repoId: 'repo-arbitrage-engine',
    repoName: 'AI-Powered-Real-Time-Arbitrage-Detection-Engine',
    gitUrl: 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git',
    owner: 'Prajwal-S-45',
    branch: 'main',
    branches: ['main', 'develop', 'feature/smart-contract-arbitrage', 'fix/orderbook-depth-latency'],
    commitHash: 'a4f910e',
    commitMsg: 'feat(arbitrage): add cross-exchange orderbook latency analyzer and smart routing',
    author: 'Prajwal-S-45',
    timestamp: '2 hours ago',
    date: new Date(Date.now() - 7200000).toISOString(),
    riskScore: 15,
    riskLevel: 'LOW',
    impactedFilesCount: 3,
    downstreamServicesCount: 2,
    publicEndpointsCount: 4,
    databaseTablesCount: 1,
    language: 'TypeScript',
    sourceType: 'github_url',
    status: 'Completed',
    summary: 'Real-time arbitrage detection using AI with smart contracts and cross-exchange market data analysis.'
  },
  {
    id: 'session-payment-gw',
    repoId: 'repo-1',
    repoName: 'payment-gateway-service',
    gitUrl: 'https://github.com/fintech-org/payment-gateway-service.git',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/v2-checkout-stripe', 'fix/token-leak-patch', 'refactor/auth-middleware'],
    commitHash: '8f92a1b',
    commitMsg: 'refactor(auth): update jwt verification middleware & stripe webhooks',
    author: 'Alex Vance',
    timestamp: '2 hours ago',
    date: new Date(Date.now() - 7200000).toISOString(),
    riskScore: 78,
    riskLevel: 'HIGH',
    impactedFilesCount: 4,
    downstreamServicesCount: 3,
    publicEndpointsCount: 6,
    databaseTablesCount: 2,
    language: 'TypeScript / Node.js',
    sourceType: 'github_url',
    status: 'Completed',
    summary: 'Stripe webhook signature validation modified with optional fallback; high cascading blast radius across payment dispatch and order settlement.'
  },
  {
    id: 'session-user-auth',
    repoId: 'repo-2',
    repoName: 'user-auth-microservice',
    gitUrl: 'https://github.com/fintech-org/user-auth-microservice.git',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/oauth2-pkce', 'patch/jwt-expiry'],
    commitHash: '4d18c9e',
    commitMsg: 'feat(rbac): implement fine-grained role scopes and session refresh token rotation',
    author: 'Prajwal A.',
    timestamp: '1 day ago',
    date: new Date(Date.now() - 86400000).toISOString(),
    riskScore: 92,
    riskLevel: 'CRITICAL',
    impactedFilesCount: 6,
    downstreamServicesCount: 5,
    publicEndpointsCount: 8,
    databaseTablesCount: 4,
    language: 'Go / gRPC',
    sourceType: 'github_url',
    status: 'Completed',
    summary: 'RBAC token validation pipeline updated; critical cascading blast radius across all downstream microservices and API gateways.'
  },
  {
    id: 'session-inventory-ledger',
    repoId: 'repo-3',
    repoName: 'inventory-ledger-core',
    gitUrl: 'https://github.com/fintech-org/inventory-ledger-core.git',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/batch-inventory-sync'],
    commitHash: '7b39a2f',
    commitMsg: 'perf(db): optimize batch stock reservation queries with pessimistic locks',
    author: 'Elena Rostova',
    timestamp: '3 days ago',
    date: new Date(Date.now() - 259200000).toISOString(),
    riskScore: 34,
    riskLevel: 'LOW',
    impactedFilesCount: 2,
    downstreamServicesCount: 1,
    publicEndpointsCount: 2,
    databaseTablesCount: 1,
    language: 'Rust',
    sourceType: 'github_url',
    status: 'Completed',
    summary: 'SQL query index tuning on ledger transactions table. Contained blast radius with minimal downstream side-effects.'
  },
  {
    id: 'session-notification-disp',
    repoId: 'repo-4',
    repoName: 'notification-dispatcher',
    gitUrl: 'https://github.com/fintech-org/notification-dispatcher.git',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/whatsapp-bsp-api'],
    commitHash: 'c2e917d',
    commitMsg: 'feat(webhook): add Twilio & WhatsApp fallback queue consumers',
    author: 'Marcus Chen',
    timestamp: '5 days ago',
    date: new Date(Date.now() - 432000000).toISOString(),
    riskScore: 61,
    riskLevel: 'MEDIUM',
    impactedFilesCount: 3,
    downstreamServicesCount: 2,
    publicEndpointsCount: 4,
    databaseTablesCount: 1,
    language: 'Python / FastAPI',
    sourceType: 'github_url',
    status: 'Completed',
    summary: 'Async webhook dispatcher error handling fallback added. Medium impact on worker consumers and notification queues.'
  }
];

const STORAGE_KEY = 'aegisblast_analysis_history';
const RECENT_URLS_KEY = 'aegisblast_recent_git_urls';

const FINTECH_SEEDS = [
  'payment-gateway-service',
  'user-auth-microservice',
  'inventory-ledger-core',
  'notification-dispatcher'
];

/**
 * Safely load analysis history from localStorage, defaulting to initial seeds,
 * and actively sanitizing any legacy records where fintech-org was erroneously assigned.
 */
export function getSavedAnalysisHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasFixes = false;

        const sanitized = parsed.map((item) => {
          if (item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine') {
            if (item.gitUrl?.includes('fintech-org') || item.owner === 'fintech-org' || !item.gitUrl) {
              hasFixes = true;
              return {
                ...item,
                gitUrl: 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git',
                owner: 'Prajwal-S-45'
              };
            }
          } else if (item.gitUrl && item.gitUrl.includes('fintech-org') && !FINTECH_SEEDS.includes(item.repoName)) {
            // Restore genuine user owner from gitUrl or fallback
            hasFixes = true;
            const genuineOwner = (item.owner && item.owner !== 'fintech-org') ? item.owner : 'custom';
            return {
              ...item,
              owner: genuineOwner,
              gitUrl: `https://github.com/${genuineOwner}/${item.repoName}.git`
            };
          }
          return item;
        });

        // Ensure session-arbitrage-engine is present at top if missing
        if (!sanitized.some((s) => s.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine')) {
          sanitized.unshift(seedAnalysisHistory[0]);
          hasFixes = true;
        }

        if (hasFixes) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch {
            // ignore
          }
        }
        return sanitized;
      }
    }
  } catch (e) {
    console.warn('Failed to load analysis history from localStorage:', e);
  }
  return seedAnalysisHistory;
}

/**
 * Safely persist analysis history to localStorage
 */
export function saveAnalysisHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save analysis history to localStorage:', e);
  }
}

/**
 * Get tracked recent URLs from localStorage, merged with initial seeds
 */
export function getSavedRecentUrls() {
  try {
    const saved = localStorage.getItem(RECENT_URLS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize legacy entries and attach syncStatus
        return parsed.map((item) => {
          let syncStatus = item.syncStatus;
          if (!syncStatus) {
            if (item.repoName === 'user-auth-microservice') syncStatus = 'pending';
            else syncStatus = 'success';
          }

          if (item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine' || item.gitUrl?.includes('AI-Powered-Real-Time-Arbitrage-Detection-Engine')) {
            return {
              ...item,
              gitUrl: 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git',
              owner: 'Prajwal-S-45',
              syncStatus
            };
          }
          return {
            ...item,
            syncStatus
          };
        });
      }
    }
  } catch (e) {
    console.warn('Failed to read recent URLs from localStorage:', e);
  }

  // Initial defaults demonstrating synchronization statuses
  return [
    {
      gitUrl: 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git',
      repoName: 'AI-Powered-Real-Time-Arbitrage-Detection-Engine',
      owner: 'Prajwal-S-45',
      branch: 'main',
      syncStatus: 'success'
    },
    {
      gitUrl: 'https://github.com/fintech-org/payment-gateway-service.git',
      repoName: 'payment-gateway-service',
      owner: 'fintech-org',
      branch: 'main',
      syncStatus: 'success'
    },
    {
      gitUrl: 'https://github.com/fintech-org/user-auth-microservice.git',
      repoName: 'user-auth-microservice',
      owner: 'fintech-org',
      branch: 'main',
      syncStatus: 'pending'
    }
  ];
}

/**
 * Persist a recently entered or scanned GitHub URL
 */
export function saveRecentUrl({ gitUrl, repoName, owner, branch, syncStatus = 'success' }) {
  if (!gitUrl || typeof gitUrl !== 'string') return;
  try {
    const current = getSavedRecentUrls();
    const normalizedNew = gitUrl.trim().toLowerCase().replace(/\.git$/, '');
    const filtered = current.filter((u) => u.gitUrl?.trim().toLowerCase().replace(/\.git$/, '') !== normalizedNew);

    const newItem = {
      gitUrl: gitUrl.trim(),
      repoName: repoName || gitUrl.split('/').pop().replace('.git', '') || 'repository',
      owner: owner || (gitUrl.match(/(?:github\.com[/:])([^/]+)/i)?.[1] || 'custom'),
      branch: branch || 'main',
      syncStatus: syncStatus || 'success',
      savedAt: new Date().toISOString()
    };

    const updated = [newItem, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save recent URL:', e);
  }
}

/**
 * Update the synchronization status of a specific recent URL
 * ('success' | 'pending' | 'failed')
 */
export function updateRecentUrlSyncStatus(gitUrl, syncStatus) {
  if (!gitUrl || typeof gitUrl !== 'string') return;
  try {
    const current = getSavedRecentUrls();
    const normalizedTarget = gitUrl.trim().toLowerCase().replace(/\.git$/, '');
    const updated = current.map((item) => {
      const normalizedItem = item.gitUrl?.trim().toLowerCase().replace(/\.git$/, '');
      if (normalizedItem === normalizedTarget) {
        return {
          ...item,
          syncStatus
        };
      }
      return item;
    });

    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to update recent URL sync status:', e);
  }
}

