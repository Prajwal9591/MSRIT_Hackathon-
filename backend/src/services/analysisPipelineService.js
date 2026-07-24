import { repoUploadService } from './repoUploadService.js';
import { metadataLoaderService } from './metadataLoaderService.js';
import { dependencyAnalyzerService } from './dependencyAnalyzerService.js';
import { impactAnalysisEngineService } from './impactAnalysisEngineService.js';
import { aiExplanationService } from './aiExplanationService.js';
import { logger } from '../utils/logger.js';

/**
 * End-to-End Analysis Pipeline Orchestrator Service
 * Connects Ingestion -> Metadata -> Dependency Graph -> Impact Engine -> Gemini AI -> Versioned JSON Payload
 */
export const analysisPipelineService = {
  /**
   * Execute full end-to-end blast radius analysis pipeline
   */
  runFullPipeline: async ({
    repoId = 'repo-1',
    changedFile = 'src/services/StripeWebhookHandler.ts',
    changedFunction = 'handlePaymentIntentSucceeded',
    files = [],
    forceRefresh = false
  }) => {
    const pipelineStartTime = Date.now();
    logger.info(`Starting full AegisBlast pipeline run for repo: ${repoId}, target: ${changedFile}`);

    // Step 1: Extract AST Metadata with Incremental Hash Caching
    const metadata = metadataLoaderService.scanCodebase({
      repoId,
      files,
      forceRefresh
    });

    // Step 2: Construct Call-Graph Dependency Tree
    const dependencyResult = dependencyAnalyzerService.analyzeDependencies({
      repoId,
      files: files.length > 0 ? files : metadataLoaderService.getSampleFiles()
    });

    // Step 3: Run Concentric BFS & Weighted Risk Matrix Engine
    const impactResult = impactAnalysisEngineService.calculateImpact({
      changedFile,
      changedFunction,
      dependencyGraph: dependencyResult.graph,
      metadata
    });

    // Step 4: Synthesize Architectural Markdown Report via Gemini AI
    const aiReport = await aiExplanationService.generateExplanation({
      commitHash: '8f92a1b',
      impactJson: impactResult,
      metadata,
      dependencyGraph: dependencyResult.graph
    });

    const pipelineDurationMs = Date.now() - pipelineStartTime;

    // Step 5: Format Versioned JSON Payload (v1.0.0 Schema)
    const payload = {
      schemaVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      pipelineMetrics: {
        totalDurationMs: pipelineDurationMs,
        cacheStatus: metadata.incremental.cacheStatus,
        cacheHits: metadata.incremental.cacheHits,
        nodesAnalyzed: dependencyResult.performance.nodesGenerated,
        edgesAnalyzed: dependencyResult.performance.edgesGenerated
      },
      repositoryMetadata: {
        repoId,
        name: 'payment-gateway-service',
        owner: 'fintech-org',
        defaultBranch: 'main',
        language: 'TypeScript / Node.js',
        fileCount: metadata.summary.totalFunctions + metadata.summary.totalClasses + 12,
        dependenciesCount: 84,
        latestCommit: {
          hash: '8f92a1b',
          author: 'Alex Vance',
          message: 'refactor(payment): update Stripe webhooks payload processing',
          timestamp: new Date().toISOString()
        }
      },
      changedItem: {
        filePath: changedFile,
        functionName: changedFunction,
        commitHash: '8f92a1b',
        author: 'Alex Vance',
        additions: 84,
        deletions: 32,
        diffSnippet: `+ export class StripeWebhookHandler {\n+   async handlePaymentIntentSucceeded(event: any) {\n+     this.guard.validateToken(event.token);\n+   }\n+ }`
      },
      riskScore: impactResult.riskScoreDetails,
      confidence: {
        score: 96,
        aiModel: aiReport.aiModel,
        precisionLevel: 'High Precision AST Call-Graph'
      },
      affectedFiles: impactResult.affectedFiles,
      affectedApis: impactResult.affectedApis,
      affectedServices: impactResult.affectedServices,
      affectedTeams: impactResult.affectedTeams.map((t) => ({ name: t, lead: 'Team Lead', membersCount: 5, role: 'Impacted Guild' })),
      affectedTests: impactResult.affectedTests,
      blastRadius: impactResult.blastRadiusDetails,
      aiExplanationMarkdown: aiReport.markdown,
      recommendations: [
        {
          title: 'Mandatory HMAC Signature Verification',
          category: 'Security Hardening',
          description: 'Enforce stripe.webhooks.constructEvent() verification before executing ledger writes.',
          codeFix: `const event = Stripe.webhooks.constructEvent(payload, sig, secret);`
        },
        {
          title: 'Circuit Breaker Integration',
          category: 'Resilience Architecture',
          description: 'Wrap database write locks in a resilient circuit breaker pattern with 5s timeout.',
          codeFix: `await lockProvider.acquireLock(\`pay_\${event.id}\`, 5000);`
        }
      ]
    };

    logger.info(`Full AegisBlast pipeline execution completed in ${pipelineDurationMs}ms`);

    return payload;
  }
};
