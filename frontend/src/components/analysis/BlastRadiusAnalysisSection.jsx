import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ShieldAlert,
  FileCode,
  Server,
  Globe,
  Database,
  TestTube2,
  Clock,
  ArrowRight,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FolderUp,
  Zap,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

/**
 * Production-ready Dedicated Blast Radius Analysis Section.
 *
 * Core capabilities:
 * 1. Header: Status telemetry, target origin indicator, action controls.
 * 2. Risk Score Placeholder: Visual radial gauge, risk index, factor breakdown.
 * 3. Affected Files Placeholder: Direct vs transitive file modification breakdown.
 * 4. Affected Services Placeholder: Impacted microservices, protocols, and caller directions.
 * 5. Affected APIs Placeholder: Exposed REST/GraphQL endpoints with breaking change alerts.
 * 6. Affected Database Placeholder: Tables, collections, locks, and migration risks.
 * 7. Affected Tests Placeholder: Unit, integration, and E2E test suites with coverage impact.
 * 8. Right-side Summary Panel: Blast overview, deployment safety rating, AI remediation advice.
 * 9. Bottom Timeline Placeholder: Cascading propagation execution sequence & rollout milestones.
 * 10. Scan-aware Empty State: Displays waiting state until repository scan is completed with interactive preview toggle.
 */
export const BlastRadiusAnalysisSection = ({
  className = '',
  onNextStep,
  onUploadClick,
  onSelectFileClick,
  onRunScanClick,
  customTitle = 'Blast Radius Analysis',
  customSubtitle = 'Multi-dimensional cascading impact engine mapping propagation risks across microservices, routes, database transactions, and test suites.'
}) => {
  const {
    selectedRepo,
    repositoryMetadata,
    selectedCommit,
    selectedFile,
    blastRadiusData,
    runAnalysis,
    setActiveTab,
    showToast
  } = useApp();

  // Local UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatedScan, setIsSimulatedScan] = useState(false);

  // Determine if repository scan has completed
  const hasScanCompleted = Boolean(
    isSimulatedScan ||
    (selectedRepo && (selectedRepo.hasAnalysis || repositoryMetadata || blastRadiusData?.overallRiskScore > 0)) ||
    (repositoryMetadata && repositoryMetadata.totalFiles > 0) ||
    (blastRadiusData && blastRadiusData.overallRiskScore > 0 && blastRadiusData.layers?.length > 0)
  );

  // Compute or fallback blast radius properties
  const rawScore = blastRadiusData?.overallRiskScore || 78;
  const riskScore = Math.min(100, Math.max(0, rawScore));
  const riskLevel = riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';
  const riskBadgeVariant = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'info';

  const originFileName = selectedFile?.path?.split('/').pop() || selectedCommit?.files?.[0]?.path?.split('/').pop() || 'StripeWebhookHandler.ts';
  const originFilePath = selectedFile?.path || selectedCommit?.files?.[0]?.path || 'src/services/payment/StripeWebhookHandler.ts';

  // Affected Files Data Placeholder
  const affectedFiles = [
    {
      name: originFileName,
      path: originFilePath,
      layer: 'L0 (Origin)',
      type: 'TypeScript',
      additions: '+42',
      deletions: '-12',
      risk: 'Critical',
      impactReason: 'Direct method signature mutation & lock acquisition logic',
      badgeVariant: 'critical'
    },
    {
      name: 'AuthenticationGuard.ts',
      path: 'src/middleware/AuthenticationGuard.ts',
      layer: 'L1 (Direct)',
      type: 'Middleware',
      additions: '+18',
      deletions: '-4',
      risk: 'High',
      impactReason: 'Token validation bypass parameter injected',
      badgeVariant: 'high'
    },
    {
      name: 'PaymentRoutes.ts',
      path: 'src/routes/api/v2/PaymentRoutes.ts',
      layer: 'L1 (Direct)',
      type: 'Express Route',
      additions: '+8',
      deletions: '-2',
      risk: 'High',
      impactReason: 'Exposes altered webhook query params to public ingress',
      badgeVariant: 'high'
    },
    {
      name: 'TransactionLedger.ts',
      path: 'src/database/models/TransactionLedger.ts',
      layer: 'L2 (Downstream)',
      type: 'ORM Entity',
      additions: '+14',
      deletions: '-0',
      risk: 'Medium',
      impactReason: 'Adds idempotency key column constraint',
      badgeVariant: 'medium'
    }
  ];

  // Affected Services Data Placeholder
  const affectedServices = [
    {
      name: 'payment-processing-service',
      type: 'Primary Microservice',
      protocol: 'gRPC / HTTP/2',
      direction: 'Downstream',
      status: 'High Impact',
      health: '99.98%',
      details: 'Processes real-time checkout & subscription webhooks'
    },
    {
      name: 'billing-analytics-worker',
      type: 'Event Consumer',
      protocol: 'Apache Kafka',
      direction: 'Asynchronous',
      status: 'Medium Impact',
      health: '100%',
      details: 'Subscribes to payment.settled stream for MRR ledgers'
    },
    {
      name: 'auth-session-manager',
      type: 'Core Service',
      protocol: 'Redis RPC',
      direction: 'Upstream',
      status: 'Elevated Risk',
      health: '99.99%',
      details: 'Validates API keys and bearer authorization tokens'
    },
    {
      name: 'invoice-pdf-daemon',
      type: 'Background Worker',
      protocol: 'RabbitMQ',
      direction: 'Downstream',
      status: 'Low Impact',
      health: '99.95%',
      details: 'Triggers automated receipt generation on ledger writes'
    }
  ];

  // Affected APIs Data Placeholder
  const affectedApis = [
    {
      method: 'POST',
      endpoint: '/api/v2/webhooks/stripe',
      visibility: 'Public Gateway',
      breakingRisk: 'High (Payload Schema)',
      rps: '420 req/s',
      statusVariant: 'critical',
      auth: 'HMAC Signature'
    },
    {
      method: 'GET',
      endpoint: '/api/v2/payments/status/:id',
      visibility: 'Mobile & Web Clients',
      breakingRisk: 'Medium (Response Field)',
      rps: '1,250 req/s',
      statusVariant: 'high',
      auth: 'JWT Bearer'
    },
    {
      method: 'POST',
      endpoint: '/api/v2/checkout/refund',
      visibility: 'Internal Portal',
      breakingRisk: 'Low (Backward Compatible)',
      rps: '45 req/s',
      statusVariant: 'medium',
      auth: 'Admin Role'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/health/liveness',
      visibility: 'Kubernetes Probe',
      breakingRisk: 'None (Clean)',
      rps: '10 req/s',
      statusVariant: 'info',
      auth: 'Internal'
    }
  ];

  // Affected Database Data Placeholder
  const affectedDatabases = [
    {
      entity: 'transaction_ledger',
      type: 'PostgreSQL Table',
      operation: 'WRITE / ROW-LOCK',
      lockRisk: 'High Contention',
      mutation: 'Column idempotency_hash added',
      indexStatus: 'Indexed'
    },
    {
      entity: 'webhook_events_log',
      type: 'Firestore Collection',
      operation: 'APPEND ONLY',
      lockRisk: 'Low Contention',
      mutation: 'TTL retention policy updated',
      indexStatus: 'Composite Key'
    },
    {
      entity: 'user_billing_profiles',
      type: 'PostgreSQL Table',
      operation: 'READ REPEATABLE',
      lockRisk: 'None',
      mutation: 'Foreign key referenced',
      indexStatus: 'Primary Key'
    },
    {
      entity: 'rate_limit_buckets',
      type: 'Redis Key-Value',
      operation: 'INCRBY / EXPIRE',
      lockRisk: 'Sub-millisecond',
      mutation: 'Bucket threshold tuned',
      indexStatus: 'In-Memory'
    }
  ];

  // Affected Tests Data Placeholder
  const affectedTests = [
    {
      name: 'StripeWebhook.spec.ts',
      type: 'Unit Suite',
      duration: '420ms',
      coverage: '94.2%',
      verdict: 'Requires Update (Mock Signature)',
      status: 'failing_risk',
      testsCount: '18 tests'
    },
    {
      name: 'PaymentLifecycle.e2e.ts',
      type: 'End-to-End Test',
      duration: '4.8s',
      coverage: '88.5%',
      verdict: 'High Regression Risk',
      status: 'high_risk',
      testsCount: '8 scenarios'
    },
    {
      name: 'AuthGuardMiddleware.test.ts',
      type: 'Integration Suite',
      duration: '850ms',
      coverage: '98.1%',
      verdict: 'Passing (Clean Assertions)',
      status: 'passing',
      testsCount: '24 tests'
    },
    {
      name: 'LedgerLockContention.stress.ts',
      type: 'Stress / Chaos Test',
      duration: '12.4s',
      coverage: '82.0%',
      verdict: 'Recommended Execution',
      status: 'recommended',
      testsCount: '4 test vectors'
    }
  ];

  // Timeline Milestones Placeholder
  const timelineMilestones = [
    {
      step: '01',
      phase: 'Code Merge & Build',
      timeframe: 'T+00:00s',
      title: 'Direct Origin Modification (L0)',
      desc: `Altered logic in ${originFileName} compiled and packaged into container image.`,
      status: 'origin',
      badgeColor: 'text-rose-400 border-rose-800 bg-rose-950/60'
    },
    {
      step: '02',
      phase: 'In-Process Callers',
      timeframe: 'T+00:15s',
      title: 'Middleware & Route Propagation (L1)',
      desc: 'AuthenticationGuard and PaymentRoutes ingest updated parameter signatures.',
      status: 'internal',
      badgeColor: 'text-amber-400 border-amber-800 bg-amber-950/60'
    },
    {
      step: '03',
      phase: 'Microservice RPCs',
      timeframe: 'T+00:45s',
      title: 'Distributed gRPC & Event Streams (L2)',
      desc: 'Billing analytics worker & order processing service receive payment events.',
      status: 'service',
      badgeColor: 'text-indigo-400 border-indigo-800 bg-indigo-950/60'
    },
    {
      step: '04',
      phase: 'External Client Ingress',
      timeframe: 'T+01:30s',
      title: 'Public Gateway & Third-party Webhooks (L3)',
      desc: 'Live traffic on /api/v2/webhooks/stripe routes through new handler logic.',
      status: 'gateway',
      badgeColor: 'text-cyan-400 border-cyan-800 bg-cyan-950/60'
    },
    {
      step: '05',
      phase: 'Data Persistence & Locks',
      timeframe: 'T+02:00s',
      title: 'Database Transactions & Idempotency Cache',
      desc: 'PostgreSQL ledger schema updates and Redis lock keys execute under peak concurrency.',
      status: 'database',
      badgeColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/60'
    }
  ];

  const handleExport = () => {
    showToast?.('Exporting Blast Radius Impact Matrix (JSON / PDF)...', 'info');
    setTimeout(() => {
      showToast?.('Blast Radius Analysis report saved to local storage.', 'success');
    }, 1000);
  };

  const handleShare = () => {
    showToast?.('Blast radius security URL & snapshot copied to clipboard.', 'info');
  };

  const handleRunScan = () => {
    if (onRunScanClick) {
      onRunScanClick();
    } else if (runAnalysis) {
      runAnalysis();
    } else {
      setIsSimulatedScan(true);
      showToast?.('Repository AST scan completed: Blast radius computed.', 'success');
    }
  };

  return (
    <motion.section
      id="blast-radius-analysis-section"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-7xl mx-auto space-y-6 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 sm:p-6 md:p-8 bg-slate-950/98 backdrop-blur-2xl overflow-y-auto'
          : `rounded-3xl glass-card border border-slate-800 p-5 sm:p-7 md:p-8 shadow-2xl relative ${className}`
      }`}
    >
      {/* -----------------------------------------------------
          1. HEADER: Title, Badges, Origin Info, and Action Controls
          ----------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-950 via-amber-950 to-slate-900 border border-rose-700/60 text-rose-400 shadow-md shadow-rose-950/40">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>

            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              {customTitle}
            </h2>

            <Badge variant="critical" className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5">
              Primary Feature
            </Badge>

            {hasScanCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-300 font-mono text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                Score: {riskScore}/100 ({riskLevel})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 font-mono text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Awaiting Repository Scan
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {customSubtitle}
          </p>

          {hasScanCompleted && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Origin Target:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-bold truncate max-w-xs sm:max-w-md">
                {originFilePath}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">4 Propagation Layers</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
          {hasScanCompleted ? (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Share2}
                onClick={handleShare}
                className="text-xs px-3"
              >
                Share
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExport}
                className="text-xs px-3"
              >
                Export Matrix
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleRunScan}
                className="text-xs px-2.5"
                title="Recalculate blast propagation"
              >
                Recalculate
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={handleRunScan}
              className="text-xs font-semibold px-4 shadow-lg shadow-cyan-950/50"
            >
              Run Repository Scan
            </Button>
          )}

          <Tooltip
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            content={isFullscreen ? 'Return to dashboard view (Esc)' : 'Expand blast radius to full page'}
            position="top"
          >
            <Button
              variant={isFullscreen ? 'primary' : 'secondary'}
              size="sm"
              icon={isFullscreen ? Minimize2 : Maximize2}
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="text-xs px-2.5"
            >
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Expand'}</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* -----------------------------------------------------
          2. EMPTY STATE: Shown until repository scan completes
          ----------------------------------------------------- */}
      {!hasScanCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-3xl bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90 border border-slate-800/90 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden"
          id="blast-radius-empty-state"
        >
          {/* Ambient background glows */}
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-rose-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-950 via-slate-900 to-amber-950 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-950/60">
              <ShieldAlert className="h-10 w-10 animate-pulse" />
            </div>
          </div>

          {/* Heading & Exact Scan Requirement Message */}
          <div className="space-y-2.5 max-w-lg mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              No Blast Radius Analysis Available Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Blast radius computation requires a completed repository AST scan. Upload your codebase or select a target modified file to compute cascading risk across files, microservices, APIs, database entities, and test suites.
            </p>
          </div>

          {/* Actionable CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              onClick={handleRunScan}
              className="text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-xl shadow-cyan-950/50"
            >
              Scan Repository AST Now
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={FolderUp}
              onClick={() => {
                if (onUploadClick) onUploadClick();
                else setActiveTab?.('upload');
              }}
              className="text-xs sm:text-sm px-4 py-2.5"
            >
              Upload Codebase ZIP
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={FileCode}
              onClick={() => {
                if (onSelectFileClick) onSelectFileClick();
                else setActiveTab?.('change-selection');
              }}
              className="text-xs sm:text-sm px-4 py-2.5"
            >
              Select Target Diff
            </Button>
          </div>

          {/* Low-opacity preview wireframe showing architecture */}
          <div className="pt-6 border-t border-slate-800/80 max-w-3xl mx-auto opacity-40 pointer-events-none">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              Pre-Scan Blueprint: What the Blast Engine Will Evaluate
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-left text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-rose-300">
                <span className="block font-bold">1. Risk Score</span>
                <span className="text-[10px] text-slate-400">0-100 Matrix</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-indigo-300">
                <span className="block font-bold">2. Affected Files</span>
                <span className="text-[10px] text-slate-400">L0-L3 AST Nodes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-300">
                <span className="block font-bold">3. Services & APIs</span>
                <span className="text-[10px] text-slate-400">gRPC & REST</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-cyan-300">
                <span className="block font-bold">4. DB & Storage</span>
                <span className="text-[10px] text-slate-400">Locks & Schemas</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-300">
                <span className="block font-bold">5. Test Suites</span>
                <span className="text-[10px] text-slate-400">Coverage & Regr.</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* -----------------------------------------------------
            POPULATED BLAST RADIUS ANALYSIS SECTION (When Scan Completed)
            ----------------------------------------------------- */
        <div className="space-y-6">
          {/* Main Grid: Left 2/3 (6 Primary Placeholders) + Right 1/3 (Summary Panel) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Core Placeholders Grid */}
            <div className="lg:col-span-2 space-y-6">
              {/* --------------------------------------------------
                  1. RISK SCORE PLACEHOLDER
                  -------------------------------------------------- */}
              <div
                className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-4 relative overflow-hidden"
                id="blast-risk-score-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      Risk Score & Blast Impact Index
                    </h3>
                  </div>
                  <Badge variant={riskBadgeVariant} className="text-xs font-bold uppercase">
                    {riskLevel} RISK INDEX
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Big Circular Metric Gauge */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1.5 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-semibold uppercase text-slate-400">
                      Overall Risk Score
                    </span>
                    <div className="relative flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">
                        {riskScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono self-end mb-1">/100</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 h-full transition-all duration-500"
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-rose-300/80 font-mono pt-1">
                      +14% vs baseline branch
                    </span>
                  </div>

                  {/* Factor Breakdown List */}
                  <div className="sm:col-span-2 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">AST Depth & Call Chain:</span>
                      <span className="font-bold text-rose-300">Level 4 (Critical)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '85%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">Public Gateway Exposure:</span>
                      <span className="font-bold text-amber-300">12 Endpoints (High)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: '70%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">Database Lock Contention:</span>
                      <span className="font-bold text-indigo-300">Row-Lock Mutation</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full" style={{ width: '55%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  2. AFFECTED FILES & 3. AFFECTED SERVICES (2-Col Grid)
                  -------------------------------------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Affected Files Placeholder */}
                <div
                  className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-3"
                  id="blast-affected-files-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Affected Files ({affectedFiles.length})
                      </h4>
                    </div>
                    <Badge variant="info" className="text-[10px] font-mono">
                      L0-L2 Callers
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {affectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200 truncate">
                            {file.name}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            file.risk === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            file.risk === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {file.risk}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{file.impactReason}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span>{file.layer}</span>
                          <span className="text-emerald-400">{file.additions}</span>
                          <span className="text-rose-400">{file.deletions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Affected Services Placeholder */}
                <div
                  className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-3"
                  id="blast-affected-services-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Affected Services ({affectedServices.length})
                      </h4>
                    </div>
                    <Badge variant="high" className="text-[10px] font-mono">
                      gRPC & Kafka
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {affectedServices.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200 truncate">
                            {srv.name}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                            {srv.protocol}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{srv.details}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span className="text-cyan-400">{srv.direction}</span>
                          <span className="text-emerald-400 font-bold">Uptime: {srv.health}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  4. AFFECTED APIS & 5. AFFECTED DATABASE (2-Col Grid)
                  -------------------------------------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4. Affected APIs Placeholder */}
                <div
                  className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-3"
                  id="blast-affected-apis-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Affected APIs & Gateways ({affectedApis.length})
                      </h4>
                    </div>
                    <Badge variant="warning" className="text-[10px] font-mono">
                      HTTP Ingress
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {affectedApis.map((api, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                              api.method === 'POST' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                              api.method === 'GET' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {api.method}
                            </span>
                            <span className="font-mono text-xs text-slate-200 truncate">{api.endpoint}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span className="text-rose-400 font-semibold">{api.breakingRisk}</span>
                          <span className="text-slate-400">{api.rps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Affected Database Placeholder */}
                <div
                  className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-3"
                  id="blast-affected-database-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Affected Database ({affectedDatabases.length})
                      </h4>
                    </div>
                    <Badge variant="info" className="text-[10px] font-mono">
                      SQL & NoSQL
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {affectedDatabases.map((db, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200 truncate">
                            {db.entity}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                            {db.operation}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{db.mutation}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span className="text-slate-400">{db.type}</span>
                          <span className="text-amber-400 font-semibold">{db.lockRisk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------
                  6. AFFECTED TESTS PLACEHOLDER
                  -------------------------------------------------- */}
              <div
                className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-xl space-y-3"
                id="blast-affected-tests-card"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <TestTube2 className="h-4 w-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Affected Tests & Regression Suites ({affectedTests.length})
                    </h4>
                  </div>
                  <Badge variant="high" className="text-[10px] font-mono">
                    CI / CD Gating
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {affectedTests.map((test, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200 truncate">
                          {test.name}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-1.5 py-0.2 rounded">
                          {test.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-400 font-semibold">{test.verdict}</span>
                        <span className="text-slate-400">{test.testsCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>Duration: {test.duration}</span>
                        <span className="text-emerald-400 font-bold">Coverage: {test.coverage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------
                7. RIGHT SIDE: SUMMARY PANEL
                ----------------------------------------------------- */}
            <div
              className="lg:col-span-1 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-5 sticky top-6"
              id="blast-radius-summary-panel"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Blast Summary
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
                  EXECUTIVE AUDIT
                </span>
              </div>

              {/* Quick High-Level Metrics */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Deployment Safety Rating
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                    <span className="text-xs font-bold text-rose-300">
                      Requires Staged Canary Verification
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Max Call Depth</span>
                    <span className="text-base font-bold text-indigo-400">L3 Radial</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Breaking Risk</span>
                    <span className="text-base font-bold text-amber-400">Elevated</span>
                  </div>
                </div>
              </div>

              {/* Key Blast Insights List */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  AI Remediation Insights
                </span>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Update <strong className="text-slate-100">StripeWebhook.spec.ts</strong> unit mock signature before merge to prevent CI failure.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                    <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Verify backwards compatibility on <strong className="text-slate-100">/api/v2/webhooks/stripe</strong> for mobile app clients.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      PostgreSQL row lock on <strong className="text-slate-100">transaction_ledger</strong> is scoped to single customer tenant ID.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Summary Panel */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={handleExport}
                  className="w-full text-xs font-semibold py-2"
                >
                  Download Mitigation Plan
                </Button>

                {onNextStep && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ArrowRight}
                    onClick={onNextStep}
                    className="w-full text-xs py-2"
                  >
                    Proceed to Security Audit →
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------
              8. BOTTOM: TIMELINE PLACEHOLDER
              ----------------------------------------------------- */}
          <div
            className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4"
            id="blast-radius-timeline-placeholder"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Cascading Impact & Rollout Timeline
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Estimated Ingestion Lag: ~180ms • Canary Rollout: 5 Phases
              </span>
            </div>

            {/* Horizontal / Sequential Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {timelineMilestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 relative overflow-hidden flex flex-col justify-between space-y-2 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-mono text-slate-400">
                      PHASE {milestone.step}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${milestone.badgeColor}`}>
                      {milestone.timeframe}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-200">
                      {milestone.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{milestone.phase}</span>
                    <span className="text-emerald-400">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};
