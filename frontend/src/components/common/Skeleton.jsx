import React from 'react';
import {
  Sparkles,
  Network,
  Cpu,
  Target
} from 'lucide-react';

/**
 * Base shimmer pulse line/block
 */
export const Skeleton = ({ className = '', style = {}, shimmer = true }) => (
  <div
    className={`rounded-xl overflow-hidden relative ${
      shimmer ? 'bg-slate-800/60 animate-shimmer' : 'animate-pulse bg-slate-800/70'
    } ${className}`}
    style={style}
  />
);

/**
 * Skeleton for Risk Metrics Cards
 */
export const RiskCardsSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { title: 'API Schema Validation', color: 'border-cyan-500/20' },
        { title: 'Concurrency & Locking', color: 'border-indigo-500/20' },
        { title: 'Exception Boundaries', color: 'border-amber-500/20' },
        { title: 'Token & Auth Integrity', color: 'border-rose-500/20' }
      ].map((item, i) => (
        <div
          key={i}
          className={`p-5 rounded-3xl bg-slate-900/80 border ${item.color} space-y-3 shadow-lg relative overflow-hidden`}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for AI Explanation / Audit Report
 */
export const AIExplanationSkeleton = () => (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-5 shadow-2xl relative overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
          <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-7 w-36 rounded-full" />
    </div>

    <div className="space-y-3 pt-1">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>

    {/* Key Positive Aspects */}
    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
      <Skeleton className="h-4 w-36" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>

    {/* Suggested Remediation Code Block Wireframe */}
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for Blast Radius Layers
 */
export const BlastRadiusSkeleton = () => (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-rose-400 animate-pulse" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>

    {/* Layer Level Tab Wireframes (L0 to L3) */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((lvl) => (
        <div key={lvl} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-2.5 w-full" />
        </div>
      ))}
    </div>

    {/* Impacted items list wireframes */}
    <div className="space-y-2.5 pt-1">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for Dependency & Call Graph
 */
export const DependencyGraphSkeleton = () => (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-cyan-400 animate-pulse" />
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>

    {/* Simulated Interactive Graph Canvas Wireframe */}
    <div className="h-72 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-2 text-center w-36 shadow-lg">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-2 w-16 mx-auto" />
        </div>
        <Skeleton className="h-1 w-12 sm:w-16 rounded-full" />
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2 text-center w-40 shadow-lg">
          <Skeleton className="h-3 w-24 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-2 w-20 mx-auto" />
        </div>
        <Skeleton className="h-1 w-12 sm:w-16 rounded-full" />
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2 text-center w-36 shadow-lg">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-4 w-28 mx-auto" />
          <Skeleton className="h-2 w-16 mx-auto" />
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-2 text-xs text-cyan-400 font-mono">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Synthesizing dynamic call-graph topology...</span>
      </div>
    </div>
  </div>
);

/**
 * Comprehensive 'Processing Repository...' Skeleton Screen
 * Replaces static data placeholders with an active, pulsing multi-phase wireframe screen.
 */
export const ProcessingRepositorySkeleton = ({
  repoName = 'Repository',
  step = 'Processing AST call graph traversal & risk propagation...',
  progress = 45
}) => {
  const phases = [
    { title: 'AST Parsing & Lexical Mapping', desc: 'Tokenizing source tree' },
    { title: 'Dependency Call Graph', desc: 'Extracting symbol callers' },
    { title: 'Blast Radius Propagation', desc: 'Computing L0-L3 depth' },
    { title: 'Architectural Risk Scoring', desc: 'Evaluating CVE & locks' },
    { title: 'AI Remediation Synthesis', desc: 'Generating security fixes' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      {/* 1. Prominent 'Processing Repository...' Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-2xl bg-cyan-400 opacity-25 animate-ping" />
              <Sparkles className="h-6 w-6 relative text-cyan-300 animate-spin" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Analysis Pipeline Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  {progress}% Completed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                Processing Repository: <span className="text-cyan-300 font-mono">{repoName}</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Analyzing AST call-graphs, evaluating multi-tier dependency propagation, and running AI architectural risk simulations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="truncate max-w-[200px]">{step}</span>
            </div>
          </div>
        </div>

        {/* High-Resolution Pulsing Gradient Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 animate-pulse"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span>AST Tokenizer Ingested</span>
            <span>Target: Complete Blast Radius Map</span>
          </div>
        </div>

        {/* Multi-Phase Pipeline Step Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {phases.map((phase, idx) => {
            const isDone = progress >= ((idx + 1) * 20);
            const isCurrent = !isDone && progress >= (idx * 20);

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isDone
                        ? 'bg-emerald-400'
                        : isCurrent
                        ? 'bg-cyan-400 animate-ping'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-[10px] font-bold font-mono uppercase truncate">
                    Step 0{idx + 1}
                  </span>
                </div>
                <div className="text-[11px] font-semibold truncate">{phase.title}</div>
                <div className="text-[9px] text-slate-400 truncate">{phase.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Challenge Outcome Summary Placeholder Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3"
          >
            <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Section Skeletons Replacing Static Data */}
      <RiskCardsSkeleton />
      <AIExplanationSkeleton />
      <BlastRadiusSkeleton />
      <DependencyGraphSkeleton />
    </div>
  );
};

/**
 * Backward compatibility alias
 */
export const AnalysisProcessingSkeleton = ProcessingRepositorySkeleton;
export const AnalysisResultsSkeleton = ProcessingRepositorySkeleton;

/**
 * Dashboard Overview Skeleton
 */
export const DashboardOverviewSkeleton = () => (
  <div className="space-y-6">
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-2/3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-32 rounded-xl" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>

    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Change Selection Skeleton
 */
export const ChangeSelectionSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-9 w-44 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-5 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Upload Ingestion Skeleton Screen
 */
export const UploadIngestionSkeleton = ({ currentStep = 'Scanning Files' }) => (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-6 shadow-2xl">
    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs animate-spin">
          ⚡
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Scanning & Parsing Code Base...</h3>
          <p className="text-xs text-cyan-400 font-mono animate-pulse">{currentStep}</p>
        </div>
      </div>
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>

    {/* Shimmer Progress Bar */}
    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 animate-pulse w-3/4 transition-all duration-500" />
    </div>

    {/* Component Skeleton Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
);
