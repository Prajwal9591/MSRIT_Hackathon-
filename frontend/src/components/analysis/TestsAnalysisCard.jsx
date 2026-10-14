import React, { useState } from 'react';
import {
  TestTube2,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  FileCode,
  Layers
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const TestsAnalysisCard = ({ testsData }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'P0' | 'P1'

  const data = testsData || {};
  const testSuites = data.testSuites || [
    {
      id: 'test-1',
      name: 'CoreService.spec.ts',
      path: 'tests/unit/CoreService.spec.ts',
      type: 'Unit Test Suite',
      priority: 'P0 - Blocking',
      status: 'Must Run (Blocking)',
      command: 'npm test -- tests/unit/CoreService.spec.ts',
      duration: '1.2s',
      coverage: 92,
      reason: 'Direct unit tests covering altered execution handler signature and input validation.'
    },
    {
      id: 'test-2',
      name: 'BillingController.spec.ts',
      path: 'tests/integration/BillingController.spec.ts',
      type: 'Integration Test Suite',
      priority: 'P0 - Blocking',
      status: 'Must Run (Blocking)',
      command: 'npm test -- tests/integration/BillingController.spec.ts',
      duration: '2.4s',
      coverage: 85,
      reason: 'Direct dependent test suite verifying contract integrity with modified CoreService.'
    },
    {
      id: 'test-3',
      name: 'AuthGuard.spec.ts',
      path: 'tests/unit/AuthGuard.spec.ts',
      type: 'Security Spec',
      priority: 'P1 - High',
      status: 'High Priority',
      command: 'npm test -- tests/unit/AuthGuard.spec.ts',
      duration: '1.1s',
      coverage: 88,
      reason: 'Validates token authentication boundaries and session guard contracts.'
    },
    {
      id: 'test-4',
      name: 'CheckoutFlow.e2e.ts',
      path: 'tests/e2e/CheckoutFlow.e2e.ts',
      type: 'E2E Regression Flow',
      priority: 'P2 - Medium',
      status: 'Recommended',
      command: 'npm test -- tests/e2e/CheckoutFlow.e2e.ts',
      duration: '5.8s',
      coverage: 74,
      reason: 'End-to-end downstream workflow exercising end-to-end transactional checkout.'
    }
  ];

  const filteredSuites = testSuites.filter((suite) => {
    if (filterPriority === 'all') return true;
    return suite.priority.includes(filterPriority);
  });

  const handleCopyCommand = (command, id) => {
    navigator.clipboard?.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalSuites = data.totalSuites || testSuites.length;
  const p0Count = data.p0Count || testSuites.filter(t => t.priority.includes('P0')).length;
  const p1Count = data.p1Count || testSuites.filter(t => t.priority.includes('P1')).length;
  const coverageEst = data.coverageEstimate || 84;
  const estDuration = data.estimatedExecutionTimeSec || '10.5';

  return (
    <div id="tests-analysis-card" className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
            <TestTube2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Tests Analysis & Automated Test Selection
              </h3>
              <Badge variant="warning" size="sm">
                {p0Count} P0 Blocking
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted regression test impact mapping based on changed AST nodes and call graph reachability
            </p>
          </div>
        </div>

        {/* Global Test Run Command */}
        <button
          onClick={() => handleCopyCommand(
            `npm test -- ${testSuites.filter(t => t.priority.includes('P0')).map(t => t.path).join(' ')}`,
            'all-p0'
          )}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          {copiedId === 'all-p0' ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>P0 Command Copied</span>
            </>
          ) : (
            <>
              <Terminal className="h-3.5 w-3.5" />
              <span>Copy P0 CI Command</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Impacted Test Suites</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1 flex items-baseline gap-1.5">
            {totalSuites}
            <span className="text-xs font-normal text-slate-400">files</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-mono">
            {p0Count} Critical P0 • {p1Count} High P1
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Blast Coverage Confidence</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">
            {coverageEst}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across impacted functions
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Est. Targeted CI Runtime</div>
          <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 mt-1 flex items-baseline gap-1">
            ~{estDuration}s
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            vs. ~180s full test suite
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Test Selection Optimization</div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-400 mt-1">
            94%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            CI compute cycles saved
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-amber-400" />
          Recommended Test Suites ({filteredSuites.length})
        </span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              filterPriority === 'all'
                ? 'bg-slate-800 text-slate-100 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({testSuites.length})
          </button>
          <button
            onClick={() => setFilterPriority('P0')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              filterPriority === 'P0'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P0 Only ({p0Count})
          </button>
          <button
            onClick={() => setFilterPriority('P1')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
              filterPriority === 'P1'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P1 Only ({p1Count})
          </button>
        </div>
      </div>

      {/* Test Suites List */}
      <div className="space-y-2.5">
        {filteredSuites.map((suite) => {
          const isP0 = suite.priority.includes('P0');
          return (
            <div
              key={suite.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isP0
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isP0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                    <FileCode className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-200 truncate">
                        {suite.path}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isP0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {suite.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {suite.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {suite.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="text-right mr-1">
                    <span className="text-[10px] text-slate-500 block">Est. Run</span>
                    <span className="text-xs font-mono font-medium text-slate-300">{suite.duration}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCommand(suite.command, suite.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                    title="Copy npm test command"
                  >
                    {copiedId === suite.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command Preview */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span className="truncate text-slate-400">$ {suite.command}</span>
                <span className="text-emerald-400 shrink-0 text-[10px] font-bold">
                  {suite.coverage}% line coverage
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coverage Gap Warning if present */}
      {data.uncoveredAreas && data.uncoveredAreas.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-200">Untested Coverage Gap Detected:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-300/90">
              {data.uncoveredAreas.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
