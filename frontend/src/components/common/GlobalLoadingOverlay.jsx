import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Minimize2,
  XCircle,
  Terminal,
  Layers,
  Network,
  Cpu,
  ShieldAlert,
  GitBranch,
  Code2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * Global Loading State Component
 * Overlays the UI when blast radius analysis is in progress,
 * keeping the user informed of real-time compilation, AST parsing,
 * dependency graph extraction, and AI risk evaluation.
 */
export const GlobalLoadingOverlay = () => {
  const {
    isAnalyzing,
    analysisProgress,
    analysisStep,
    analysisLogs = [],
    selectedRepo,
    isOverlayMinimized,
    setIsOverlayMinimized,
    cancelAnalysis
  } = useApp();

  if (!isAnalyzing || isOverlayMinimized) {
    return null;
  }

  const repoName = selectedRepo?.name || 'repository';
  const branchName = selectedRepo?.branch || 'main';
  const language = selectedRepo?.language || 'TypeScript';

  const pipelinePhases = [
    {
      id: 1,
      title: 'AST Parsing & Lexical Mapping',
      detail: 'Extracting functions, exports, imports & syntax trees',
      icon: Code2,
      threshold: 20
    },
    {
      id: 2,
      title: 'Dependency & Call Graph Generation',
      detail: 'Traversing inter-module caller-callee relationships',
      icon: Network,
      threshold: 40
    },
    {
      id: 3,
      title: 'Concentric Blast Radius Propagation',
      detail: 'Computing Layer 0 to Layer 3 cascading depth',
      icon: Layers,
      threshold: 65
    },
    {
      id: 4,
      title: 'Architectural Risk & Test Mapping',
      detail: 'Scoring concurrency locks, auth guards & P0 tests',
      icon: ShieldAlert,
      threshold: 85
    },
    {
      id: 5,
      title: 'AI Security Remediation Synthesis',
      detail: 'Generating neural patch recommendations & rationale',
      icon: Cpu,
      threshold: 100
    }
  ];

  return (
    <AnimatePresence>
      <div
        id="global-analysis-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md transition-all duration-300 select-none overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden"
        >
          {/* Ambient Glow Background Effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-2xl bg-cyan-400 opacity-30 animate-ping" />
                <Sparkles className="h-6 w-6 text-cyan-300 animate-spin" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
                    Processing Repository
                  </h3>
                  <Badge variant="info" className="text-[10px] font-mono py-0.5">
                    <GitBranch className="h-3 w-3 mr-1 inline" /> {branchName}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-800">
                    {language}
                  </span>
                </div>
                <p className="text-xs text-cyan-300 font-mono font-medium mt-0.5">
                  {repoName}
                </p>
              </div>
            </div>

            {/* Quick action buttons: Minimize & Cancel */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOverlayMinimized(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-all text-xs flex items-center gap-1.5"
                title="Minimize overlay to inspect background skeleton screen"
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Minimize</span>
              </button>
              {cancelAnalysis && (
                <button
                  onClick={cancelAnalysis}
                  className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 transition-all text-xs"
                  title="Cancel analysis"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Status Pill */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-400 flex items-center gap-2 font-semibold">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                {analysisStep || 'Traversing AST call graph & calculating blast propagation...'}
              </span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {analysisProgress}%
              </span>
            </div>

            {/* High-Resolution Pulsing Gradient Progress Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 animate-pulse shadow-lg shadow-cyan-500/30"
                style={{ width: `${Math.max(analysisProgress, 8)}%` }}
              />
            </div>
          </div>

          {/* 5-Phase Pipeline Stepper */}
          <div className="space-y-2.5 relative z-10">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Blast Radius Pipeline Stages
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pipelinePhases.map((phase, idx) => {
                const isCompleted = analysisProgress >= phase.threshold;
                const isCurrent = !isCompleted && (idx === 0 || analysisProgress >= pipelinePhases[idx - 1].threshold);
                const IconComponent = phase.icon;

                return (
                  <div
                    key={phase.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCompleted
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                        : isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      ) : (
                        <IconComponent className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {idx + 1}. {phase.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {phase.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Analysis Terminal / Logs Console */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Compiler & AST Stream Logs</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">Live</span>
            </div>
            <div className="font-mono text-[11px] text-slate-300 space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {analysisLogs && analysisLogs.length > 0 ? (
                analysisLogs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-cyan-500 text-[10px]">›</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-cyan-500 text-[10px]">›</span>
                    <span>[AST] Tokenizing repository source tree modules...</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <span className="text-cyan-500 text-[10px]">›</span>
                    <span>[GRAPH] Extracting symbol callers and route endpoints...</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 relative z-10">
            <span className="text-[11px] text-slate-400">
              Analysis in progress. You can minimize to inspect the live skeleton screen.
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={Minimize2}
              onClick={() => setIsOverlayMinimized(true)}
              className="text-xs"
            >
              View Background Skeleton
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
