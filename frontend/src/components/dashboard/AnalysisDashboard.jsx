import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Activity,
  FileCode,
  Globe,
  Server,
  TestTube2,
  Users,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Code2,
  ExternalLink,
  Lock,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const AnalysisDashboard = () => {
  const {
    selectedRepo,
    selectedCommit,
    setActiveTab,
    runAnalysis,
    isAnalyzing
  } = useApp();

  const [activeTableTab, setActiveTableTab] = useState('files'); // 'files' | 'apis' | 'services' | 'tests' | 'teams'

  // Comprehensive analysis data
  const metrics = {
    changedFile: 'src/services/StripeWebhookHandler.ts',
    changedFunction: 'handlePaymentIntentSucceeded',
    additions: 84,
    deletions: 32,
    riskScore: 88,
    riskLevel: 'CRITICAL',
    confidenceScore: 96,
    blastRadiusScore: 92,
    blastRadiusScope: 'System-Wide (Multi-Microservice & DB)',
    affectedFilesCount: 7,
    affectedApisCount: 3,
    affectedServicesCount: 2,
    affectedTestsCount: 2,
    affectedTeamsCount: 4
  };

  const affectedFiles = [
    { path: 'src/services/StripeWebhookHandler.ts', layer: 'L0 (Origin)', risk: 'Critical', additions: 84, deletions: 32, status: 'Modified' },
    { path: 'src/middleware/AuthenticationGuard.ts', layer: 'L1 (Direct)', risk: 'Critical', additions: 29, deletions: 14, status: 'Modified' },
    { path: 'src/database/models/TransactionLedger.ts', layer: 'L1 (Direct)', risk: 'Medium', additions: 19, deletions: 38, status: 'Impacted' },
    { path: 'src/config/paymentConfig.ts', layer: 'L1 (Direct)', risk: 'Low', additions: 10, deletions: 5, status: 'Impacted' },
    { path: 'src/routes/PaymentRoutes.ts', layer: 'L2 (API Gateway)', risk: 'High', additions: 45, deletions: 12, status: 'Impacted' },
    { path: 'microservices/order-processing/worker.ts', layer: 'L2 (Microservice)', risk: 'High', additions: 0, deletions: 0, status: 'Transitive' },
    { path: 'database/migrations/20260724_transaction_locks.sql', layer: 'L3 (Database)', risk: 'Critical', additions: 15, deletions: 0, status: 'Transitive' }
  ];

  const affectedApis = [
    { endpoint: 'POST /api/v2/webhooks/stripe', protocol: 'REST / HTTPS', auth: 'Bypassed (Warning)', risk: 'Critical' },
    { endpoint: 'GET /api/v2/payments/status/:id', protocol: 'REST / HTTPS', auth: 'JWT Token Required', risk: 'Medium' },
    { endpoint: 'gRPC stream /order.v1.OrderService/ProcessPayment', protocol: 'gRPC / HTTP2', auth: 'mTLS Client Cert', risk: 'High' }
  ];

  const affectedServices = [
    { name: 'payment-gateway-service', type: 'Node.js Express API', region: 'us-east-1', status: 'Direct Target', risk: 'Critical' },
    { name: 'order-processing-service', type: 'Go Microservice', region: 'us-east-1', status: 'Transitive Event Listener', risk: 'High' }
  ];

  const recommendedTests = [
    { testSuite: 'tests/integration/StripeWebhook.spec.ts', type: 'Integration Test', framework: 'Jest / Supertest', priority: 'P0 - Block Release' },
    { testSuite: 'tests/integration/AuthenticationGuard.spec.ts', type: 'Security Spec', framework: 'Jest', priority: 'P0 - Block Release' }
  ];

  const affectedTeams = [
    { name: 'Payments & Checkout Guild', lead: 'Alex Vance', members: 6, role: 'Primary Owner' },
    { name: 'DevSecOps & Platform Security', lead: 'Sarah Chen', members: 4, role: 'Security Approver' },
    { name: 'Core Backend Services Team', lead: 'Marcus Brody', members: 8, role: 'Impacted Service Owner' },
    { name: 'Data Engineering Guild', lead: 'Elena Rostova', members: 5, role: 'Database Admin' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> High Blast Radius Detected
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target Commit: <strong className="text-cyan-300">{selectedCommit?.hash || '8f92a1b'}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Code Change Blast Radius & Architectural Risk Dashboard
            </h2>

            {/* Changed File Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400">Changed File:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
                <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                {metrics.changedFile}
              </span>
              <span className="text-xs font-mono text-emerald-400">+{metrics.additions}</span>
              <span className="text-xs font-mono text-rose-400">-{metrics.deletions}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              icon={Layers}
              onClick={() => setActiveTab('change-selection')}
            >
              Inspect Diff
            </Button>
            <Button
              variant="primary"
              icon={Sparkles}
              loading={isAnalyzing}
              onClick={() => runAnalysis()}
            >
              Re-Scan Blast Radius
            </Button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards (Risk Score, Blast Radius, Confidence Score, Affected Services) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Risk Score */}
        <div className="p-5 rounded-3xl glass-card border border-rose-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Risk Score</span>
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-rose-400">{metrics.riskScore} <span className="text-xs text-slate-500">/ 100</span></span>
            <Badge variant="critical" className="text-[10px] uppercase font-bold">{metrics.riskLevel}</Badge>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-rose-500 h-full w-[88%]" />
          </div>
        </div>

        {/* Card 2: Blast Radius */}
        <div className="p-5 rounded-3xl glass-card border border-amber-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Blast Radius</span>
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-amber-400">{metrics.blastRadiusScore}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Layer 3 Propagation</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full w-[92%]" />
          </div>
        </div>

        {/* Card 3: Confidence Score */}
        <div className="p-5 rounded-3xl glass-card border border-indigo-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Confidence Score</span>
            <Cpu className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">{metrics.confidenceScore}%</span>
            <Badge variant="info" className="text-[10px]">Gemini 1.5 Flash</Badge>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[96%]" />
          </div>
        </div>

        {/* Card 4: Impact Summary Stats */}
        <div className="p-5 rounded-3xl glass-card border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Downstream Scope</span>
            <Layers className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-mono pt-1">
            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-lg font-bold text-slate-100">{metrics.affectedFilesCount}</span>
              <span className="block text-[9px] text-slate-400 font-sans">Files</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-lg font-bold text-slate-100">{metrics.affectedApisCount}</span>
              <span className="block text-[9px] text-slate-400 font-sans">APIs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Propagation & Weight Distribution Visual Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Propagation Progress */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" /> Concentric Layer Propagation Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Layer 0: Changed Entity (Origin)</span>
                <span className="font-mono text-cyan-400">1 File</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Layer 1: Direct Callers & Dependencies</span>
                <span className="font-mono text-indigo-400">3 Files</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[75%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Layer 2: Downstream APIs & Microservices</span>
                <span className="font-mono text-amber-400">2 Services / 3 APIs</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[60%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Layer 3: Database Writes & Redis Mutex Locks</span>
                <span className="font-mono text-rose-400">1 DB Table / 1 Lock</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Weight Matrix Breakdown Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" /> Multi-Factor Risk Weight Matrix
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Security Guard & Authentication Impact</span>
              <Badge variant="critical" className="font-mono">35% Weight</Badge>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Database Write Locks & Idempotency</span>
              <Badge variant="high" className="font-mono">25% Weight</Badge>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Public REST / gRPC API Exposure</span>
              <Badge variant="high" className="font-mono">20% Weight</Badge>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Concentric Blast Radius Scope</span>
              <Badge variant="info" className="font-mono">20% Weight</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Data Tables Section */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
        {/* Table Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTableTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTableTab === 'files'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" /> Affected Files ({affectedFiles.length})
          </button>

          <button
            onClick={() => setActiveTableTab('apis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTableTab === 'apis'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" /> Affected APIs ({affectedApis.length})
          </button>

          <button
            onClick={() => setActiveTableTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTableTab === 'services'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" /> Affected Services ({affectedServices.length})
          </button>

          <button
            onClick={() => setActiveTableTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTableTab === 'tests'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TestTube2 className="h-4 w-4" /> Recommended Tests ({recommendedTests.length})
          </button>

          <button
            onClick={() => setActiveTableTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTableTab === 'teams'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" /> Affected Teams ({affectedTeams.length})
          </button>
        </div>

        {/* Tab 1: Affected Files Table */}
        {activeTableTab === 'files' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">File Path</th>
                  <th className="px-4 py-3">Impact Layer</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Lines (+/-)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {affectedFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="px-4 py-3 font-mono text-slate-100 flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-cyan-400" /> {file.path}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{file.layer}</td>
                    <td className="px-4 py-3">
                      <Badge variant={file.risk === 'Critical' ? 'critical' : file.risk === 'High' ? 'high' : 'low'}>
                        {file.risk}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-emerald-400">+{file.additions}</span> / <span className="text-rose-400">-{file.deletions}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{file.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Affected APIs Table */}
        {activeTableTab === 'apis' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Endpoint Route</th>
                  <th className="px-4 py-3">Protocol</th>
                  <th className="px-4 py-3">Auth Guard Status</th>
                  <th className="px-4 py-3">Risk Vector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {affectedApis.map((api, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="px-4 py-3 font-mono text-cyan-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" /> {api.endpoint}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{api.protocol}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{api.auth}</td>
                    <td className="px-4 py-3">
                      <Badge variant={api.risk === 'Critical' ? 'critical' : 'high'}>{api.risk}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Affected Services Table */}
        {activeTableTab === 'services' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Microservice Name</th>
                  <th className="px-4 py-3">Tech Stack</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Downstream Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {affectedServices.map((svc, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="px-4 py-3 font-mono text-slate-100 flex items-center gap-2">
                      <Server className="h-3.5 w-3.5 text-indigo-400" /> {svc.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{svc.type}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{svc.region}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{svc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Recommended Tests Table */}
        {activeTableTab === 'tests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Test Suite File Path</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Framework</th>
                  <th className="px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recommendedTests.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="px-4 py-3 font-mono text-emerald-300 flex items-center gap-2">
                      <TestTube2 className="h-3.5 w-3.5 text-emerald-400" /> {t.testSuite}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{t.type}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{t.framework}</td>
                    <td className="px-4 py-3">
                      <Badge variant="critical">{t.priority}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Affected Teams Table */}
        {activeTableTab === 'teams' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Engineering Guild / Team</th>
                  <th className="px-4 py-3">Team Lead</th>
                  <th className="px-4 py-3">Engineers</th>
                  <th className="px-4 py-3">Ownership Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {affectedTeams.map((team, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="px-4 py-3 font-mono text-slate-100 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-cyan-400" /> {team.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{team.lead}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{team.members} Engineers</td>
                    <td className="px-4 py-3">
                      <Badge variant={idx === 0 ? 'critical' : 'info'}>{team.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
