export const mockRepositories = [
  {
    id: 'repo-1',
    name: 'payment-gateway-service',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/v2-checkout-stripe', 'fix/token-leak-patch', 'refactor/auth-middleware'],
    language: 'TypeScript / Node.js',
    stars: 124,
    lastAnalyzed: '2 hours ago',
    riskScore: 78, // High
    status: 'Needs Review',
    description: 'Core payment processing engine handling Stripe, PayPal, and Apple Pay integrations.',
    commitsCount: 1420,
    dependenciesCount: 84,
    fileCount: 312
  },
  {
    id: 'repo-2',
    name: 'user-auth-microservice',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/oauth2-pkce', 'patch/jwt-expiry'],
    language: 'Go / gRPC',
    stars: 89,
    lastAnalyzed: '1 day ago',
    riskScore: 92, // Critical
    status: 'High Blast Radius',
    description: 'Identity server providing JWT generation, OAuth2 refresh tokens, and RBAC policy enforcement.',
    commitsCount: 980,
    dependenciesCount: 42,
    fileCount: 156
  },
  {
    id: 'repo-3',
    name: 'inventory-ledger-core',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/batch-inventory-sync'],
    language: 'Rust',
    stars: 215,
    lastAnalyzed: '3 days ago',
    riskScore: 34, // Low
    status: 'Safe',
    description: 'High-performance transactional database interface for real-time stock & order ledgering.',
    commitsCount: 2310,
    dependenciesCount: 29,
    fileCount: 94
  },
  {
    id: 'repo-4',
    name: 'notification-dispatcher',
    owner: 'fintech-org',
    branch: 'main',
    branches: ['main', 'feature/whatsapp-bsp-api'],
    language: 'Python / FastAPI',
    stars: 45,
    lastAnalyzed: '5 mins ago',
    riskScore: 61, // Medium
    status: 'Analyzing',
    description: 'Asynchronous event consumer routing email, SMS, push notifications, and webhooks.',
    commitsCount: 640,
    dependenciesCount: 63,
    fileCount: 118
  }
];

export const mockCommits = [
  {
    id: 'c-8f92a1',
    hash: '8f92a1b',
    author: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    timestamp: '2026-07-24 09:42:15',
    message: 'refactor(payment): update Stripe webhooks payload processing & retry backoff strategy',
    filesChangedCount: 4,
    additions: 142,
    deletions: 89,
    riskRating: 'High',
    files: [
      {
        path: 'src/services/StripeWebhookHandler.ts',
        status: 'modified',
        additions: 84,
        deletions: 32,
        risk: 'High',
        impactReason: 'Modifies idempotent payment receipt validation method signature and database transaction lock.',
        functionsModified: ['handlePaymentIntentSucceeded', 'verifyWebhookSignature', 'acquireIdempotencyLock']
      },
      {
        path: 'src/middleware/AuthenticationGuard.ts',
        status: 'modified',
        additions: 29,
        deletions: 14,
        risk: 'Critical',
        impactReason: 'Alters token validation fallback logic; could allow unauthenticated webhooks on dev bypass flags.',
        functionsModified: ['validateBearerToken', 'checkBypassHeader']
      },
      {
        path: 'src/database/models/TransactionLedger.ts',
        status: 'modified',
        additions: 19,
        deletions: 38,
        risk: 'Medium',
        impactReason: 'Removes legacy raw SQL fallback block in favor of ORM entity update.',
        functionsModified: ['updateLedgerStatus']
      },
      {
        path: 'src/config/paymentConfig.ts',
        status: 'modified',
        additions: 10,
        deletions: 5,
        risk: 'Low',
        impactReason: 'Adds configurable timeout parameters for external webhook endpoints.',
        functionsModified: []
      }
    ]
  },
  {
    id: 'c-3b17e4',
    hash: '3b17e4a',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    timestamp: '2026-07-24 07:15:00',
    message: 'feat(auth): integrate OAuth2 PKCE flow for mobile web views',
    filesChangedCount: 6,
    additions: 260,
    deletions: 45,
    riskRating: 'Critical',
    files: [
      {
        path: 'src/auth/pkce.ts',
        status: 'added',
        additions: 150,
        deletions: 0,
        risk: 'High',
        impactReason: 'New cryptographic code challenge generator.',
        functionsModified: ['generateCodeVerifier', 'generateCodeChallenge']
      },
      {
        path: 'src/controllers/AuthController.ts',
        status: 'modified',
        additions: 110,
        deletions: 45,
        risk: 'Critical',
        impactReason: 'Touches core login callback handler used across all client platforms.',
        functionsModified: ['handleOAuthCallback', 'refreshAccessToken']
      }
    ]
  }
];

export const mockDiffContent = `diff --git a/src/services/StripeWebhookHandler.ts b/src/services/StripeWebhookHandler.ts
index 4a8219b..8f92a1b 100644
--- a/src/services/StripeWebhookHandler.ts
+++ b/src/services/StripeWebhookHandler.ts
@@ -24,8 +24,14 @@ export class StripeWebhookHandler {
-  public async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
-    const paymentIntent = event.data.object as Stripe.PaymentIntent;
-    await this.ledgerService.recordPayment(paymentIntent.id, paymentIntent.amount);
+  public async handlePaymentIntentSucceeded(event: Stripe.Event, bypassSignatureCheck = false): Promise<void> {
+    if (!bypassSignatureCheck && !this.verifyWebhookSignature(event)) {
+      throw new Error("Invalid signature verification failed");
+    }
+    const paymentIntent = event.data.object as Stripe.PaymentIntent;
+    
+    // LOCKING: Acquired distributed Redis lock to prevent duplicate webhook delivery
+    const lock = await this.acquireIdempotencyLock(paymentIntent.id);
+    try {
+      await this.ledgerService.recordPayment(paymentIntent.id, paymentIntent.amount, paymentIntent.currency);
+    } finally {
+      await lock.release();
+    }
   }`;

export const mockRiskCards = [
  {
    id: 'risk-1',
    title: 'Security & Auth Boundary',
    level: 'Critical',
    score: 88,
    changeTrend: '+14%',
    color: 'rose',
    summary: 'Optional parameters added to authentication guards could allow signature verification bypass.',
    details: 'Function signature `handlePaymentIntentSucceeded` accepts optional `bypassSignatureCheck` parameter which is exposed in high-level HTTP route controller.',
    affectedFilesCount: 2,
    recommendation: 'Remove default fallback parameter or isolate bypass flag strictly to unit test mocks.'
  },
  {
    id: 'risk-2',
    title: 'Downstream Blast Radius',
    level: 'High',
    score: 76,
    changeTrend: '+8%',
    color: 'amber',
    summary: 'Modifications affect 5 downstream microservices and 12 public API endpoints.',
    details: 'Transaction Ledger model schema change impacts `order-processing-service`, `billing-analytics`, and `customer-portal-api`.',
    affectedFilesCount: 8,
    recommendation: 'Run regression test suite on order lifecycle and verify distributed lock TTL settings.'
  },
  {
    id: 'risk-3',
    title: 'Database & Lock Concurrency',
    level: 'Medium',
    score: 54,
    changeTrend: '-5%',
    color: 'indigo',
    summary: 'Redis idempotency locking added to payment webhook execution path.',
    details: 'Potential performance bottleneck if Redis latency spikes during flash sales. Ensures strict single execution guarantees.',
    affectedFilesCount: 1,
    recommendation: 'Add fallback timeout to Redis lock acquisition to avoid thread pool exhaustion under heavy load.'
  },
  {
    id: 'risk-4',
    title: 'Test Suite Coverage Drop',
    level: 'Low',
    score: 22,
    changeTrend: '0%',
    color: 'emerald',
    summary: 'New error handling paths in webhook signature check lack unit test coverage.',
    details: 'Lines 26-28 in `StripeWebhookHandler.ts` are missing execution branch coverage in Jest test runner.',
    affectedFilesCount: 1,
    recommendation: 'Add mock unit test case simulating tampered HMAC signature header.'
  }
];

export const mockDependencyNodes = [
  { id: 'node-1', label: 'StripeWebhookHandler.ts', type: 'source', category: 'Modified Core', risk: 'High', impact: 'Direct Source' },
  { id: 'node-2', label: 'AuthenticationGuard.ts', type: 'modified', category: 'Middleware', risk: 'Critical', impact: 'Direct Dependency' },
  { id: 'node-3', label: 'TransactionLedger.ts', type: 'modified', category: 'Database Model', risk: 'Medium', impact: 'Direct Dependency' },
  { id: 'node-4', label: 'PaymentRoutes.ts', type: 'downstream', category: 'HTTP Layer', risk: 'High', impact: 'Transitive Impact' },
  { id: 'node-5', label: 'OrderProcessingService', type: 'service', category: 'External Service', risk: 'High', impact: 'gRPC Caller' },
  { id: 'node-6', label: 'BillingAnalyticsWorker', type: 'service', category: 'Queue Consumer', risk: 'Medium', impact: 'Kafka Consumer' },
  { id: 'node-7', label: 'RedisLockProvider.ts', type: 'utility', category: 'Infrastructure', risk: 'Low', impact: 'Utility Dependency' },
  { id: 'node-8', label: 'CustomerPortalAPI', type: 'service', category: 'Public Gateway', risk: 'High', impact: 'REST Client' }
];

export const mockDependencyEdges = [
  { source: 'node-1', target: 'node-2', label: 'uses auth guard', type: 'critical' },
  { source: 'node-1', target: 'node-3', label: 'writes ledger entry', type: 'high' },
  { source: 'node-1', target: 'node-7', label: 'acquires lock', type: 'normal' },
  { source: 'node-4', target: 'node-1', label: 'routes webhook POST', type: 'high' },
  { source: 'node-3', target: 'node-5', label: 'triggers sync', type: 'high' },
  { source: 'node-3', target: 'node-6', label: 'publishes payment.created', type: 'normal' },
  { source: 'node-5', target: 'node-8', label: 'updates status API', type: 'high' }
];

export const mockBlastRadiusData = {
  sourceCommit: 'c-8f92a1',
  overallRiskIndex: 'HIGH (78/100)',
  directImpactCount: 3,
  downstreamServicesCount: 5,
  publicEndpointsCount: 12,
  databaseTablesCount: 2,
  layers: [
    {
      level: 0,
      name: 'Layer 0: Modified Source Files',
      description: 'Files directly updated in this commit',
      riskColor: 'rose',
      items: [
        { name: 'StripeWebhookHandler.ts', type: 'TypeScript', impact: 'High', detail: 'Signature & Lock handling changed' },
        { name: 'AuthenticationGuard.ts', type: 'TypeScript', impact: 'Critical', detail: 'Bypass flag parameter added' }
      ]
    },
    {
      level: 1,
      name: 'Layer 1: Direct Internal Dependents',
      description: 'Classes & services importing modified methods directly',
      riskColor: 'amber',
      items: [
        { name: 'PaymentRoutes.ts', type: 'Express Controller', impact: 'High', detail: 'Exposes altered handler parameters' },
        { name: 'TransactionLedger.ts', type: 'TypeORM Model', impact: 'Medium', detail: 'Modifies SQL update behavior' },
        { name: 'RedisLockProvider.ts', type: 'Cache Utility', impact: 'Low', detail: 'Called for idempotency acquisition' }
      ]
    },
    {
      level: 2,
      name: 'Layer 2: Downstream Microservices',
      description: 'Distributed services consuming events or API endpoints',
      riskColor: 'indigo',
      items: [
        { name: 'order-processing-service', type: 'gRPC Service', impact: 'High', detail: 'Relies on payment ledger status confirmation' },
        { name: 'billing-analytics-worker', type: 'Kafka Consumer', impact: 'Medium', detail: 'Processes payment metadata streams' },
        { name: 'invoice-generator-daemon', type: 'Cron Job', impact: 'Low', detail: 'Reads transaction ledger records hourly' }
      ]
    },
    {
      level: 3,
      name: 'Layer 3: Public APIs & Client Gateways',
      description: 'User-facing endpoints and third-party webhooks',
      riskColor: 'cyan',
      items: [
        { name: 'POST /api/v2/webhooks/stripe', type: 'Public Webhook', impact: 'Critical', detail: 'Entry point for external Stripe triggers' },
        { name: 'GET /api/v2/payments/status/:id', type: 'REST API', impact: 'High', detail: 'Used by Mobile iOS/Android apps' },
        { name: 'POST /api/v2/checkout/refund', type: 'REST API', impact: 'Medium', detail: 'Internal admin portal endpoint' }
      ]
    }
  ]
};

export const mockAiExplanation = {
  summary: 'Analysis of commit 8f92a1b reveals a critical vulnerability vector in payment signature verification alongside positive idempotency locking enhancements.',
  architectureImpact: 'The change introduces a optional `bypassSignatureCheck` boolean parameter into `StripeWebhookHandler.handlePaymentIntentSucceeded`. Because the upstream Express router forwards request query flags without validation, an attacker could potentially invoke webhook endpoints with simulated payloads bypassing cryptographic HMAC checks.',
  positiveAspects: [
    'Implemented distributed Redis locks preventing double-spend idempotency bugs during concurrent webhook retries.',
    'Updated ORM model usage replacing raw string SQL queries.'
  ],
  riskBreakdown: [
    {
      category: 'Authentication Bypass',
      severity: 'Critical',
      description: 'The parameter `bypassSignatureCheck` defaults to false, but parameter pollution in HTTP body payload may toggle it to true in loose JS runtime parsing.'
    },
    {
      category: 'Distributed Lock Timeout',
      severity: 'Medium',
      description: 'If Redis connection drops during lock acquisition, `acquireIdempotencyLock` throws an unhandled exception resulting in HTTP 500 error.'
    }
  ],
  suggestedFix: `// RECOMMENDED FIX in src/services/StripeWebhookHandler.ts
// Do NOT accept bypass flag in production handler signature
public async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
  // Always enforce HMAC verification
  if (!this.verifyWebhookSignature(event)) {
    throw new SecurityException("Stripe HMAC signature verification failed");
  }
  
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const lock = await this.acquireIdempotencyLock(paymentIntent.id, { timeoutMs: 3000 });
  try {
    await this.ledgerService.recordPayment(paymentIntent.id, paymentIntent.amount, paymentIntent.currency);
  } finally {
    await lock.release();
  }
}`,
  confidenceScore: 96,
  modelUsed: 'Antigravity Code Security Engine (Gemini 3.6 Flash)'
};

export const mockSettings = {
  aiProvider: 'Antigravity AI Engine (Default)',
  apiKey: 'sk-antigravity-prod-****-8f92',
  sensitivityThreshold: 'Strict (High Precision)',
  autoScanPullRequests: true,
  notifySlack: true,
  notifyEmail: false,
  slackWebhookUrl: 'https://hooks.slack.com/services/T00/B00/XXXX',
  deepAnalysisMode: true,
  maxBlastRadiusDepth: 3,
  ignorePatterns: 'node_modules/, *.spec.ts, dist/'
};
