import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Code2,
  Network,
  ShieldAlert,
  Cpu,
  Lock,
  ChevronRight,
  X,
  Terminal,
  Activity,
  FileCode,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * Standard Ingestion & Analysis Pipeline Stages
 */
export const INGESTION_STAGES = [
  {
    id: 'fetching',
    stageNumber: 1,
    title: 'Fetching',
    fullTitle: 'Fetching & Decompressing Source',
    detail: 'Retrieving repository objects, tree refs & unpackaging source modules',
    icon: Code2,
    threshold: 20
  },
  {
    id: 'parsing',
    stageNumber: 2,
    title: 'Parsing',
    fullTitle: 'Parsing AST & Symbol Tables',
    detail: 'Generating Abstract Syntax Trees, extracting functions, types & decorators',
    icon: FileCode,
    threshold: 40
  },
  {
    id: 'analyzing',
    stageNumber: 3,
    title: 'Analyzing',
    fullTitle: 'Analyzing Call Graph & Blast Radius',
    detail: 'Traversing caller-callee hierarchies and concentric Layer 0–3 propagation',
    icon: Network,
    threshold: 65
  },
  {
    id: 'evaluating',
    stageNumber: 4,
    title: 'Evaluating',
    fullTitle: 'Evaluating Security & Test Coverage',
    detail: 'Scoring concurrency locks, auth guard boundaries & P0 test suites',
    icon: ShieldAlert,
    threshold: 85
  },
  {
    id: 'synthesizing',
    stageNumber: 5,
    title: 'Synthesizing',
    fullTitle: 'Synthesizing DevSecOps Insights',
    detail: 'Formulating neural remediation patches, explanations & risk indices',
    icon: Cpu,
    threshold: 100
  }
];

/**
 * IngestionStatusIndicator Component
 *
 * Provides real-time visibility into the repository ingestion and blast radius analysis lifecycle.
 * Prevents users from interacting with incomplete or stale data by providing clear phase badges,
 * progress bars, stage steppers, and locking indicators.
 *
 * Supported variants:
 * - 'compact': Mini interactive pill for top Navbar header.
 * - 'banner': Informational banner for the top of analysis & dashboard pages.
 * - 'modal': Comprehensive inspection modal with real-time logs and stage breakdown.
 * - 'widget': Embedded summary widget with stages and metrics.
 */
export const IngestionStatusIndicator = ({
  variant = 'compact',
  showLockNotice = true,
  className = '',
  onReSync
}) => {
  const {
    isAnalyzing,
    analysisProgress = 0,
    analysisStep = '',
    analysisLogs = [],
    selectedRepo,
    selectedCommit,
    runAnalysis,
    ingestionStatus,
    ingestionModalOpen,
    setIngestionModalOpen,
    cancelAnalysis,
    repositoryMetadata
  } = useApp();

  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalVisible = ingestionModalOpen !== undefined ? ingestionModalOpen : localModalOpen;
  const setModalVisible = setIngestionModalOpen || setLocalModalOpen;

  // Resolve current active phase ('fetching', 'parsing', 'analyzing', 'evaluating', 'synthesizing', 'completed', 'stale', 'idle')
  const activePhaseId = isAnalyzing
    ? analysisProgress < 22
      ? 'fetching'
      : analysisProgress < 45
      ? 'parsing'
      : analysisProgress < 70
      ? 'analyzing'
      : analysisProgress < 90
      ? 'evaluating'
      : 'synthesizing'
    : ingestionStatus?.isStale
    ? 'stale'
    : selectedRepo
    ? 'completed'
    : 'idle';

  const currentStage = INGESTION_STAGES.find((s) => s.id === activePhaseId) || {
    id: activePhaseId,
    stageNumber: activePhaseId === 'completed' ? 5 : 0,
    title: activePhaseId === 'stale' ? 'Stale' : activePhaseId === 'completed' ? 'Synchronized' : 'Idle',
    fullTitle:
      activePhaseId === 'stale'
        ? 'Stale / Out of Sync Data'
        : activePhaseId === 'completed'
        ? 'Fully Synchronized & Ready'
        : 'Awaiting Ingestion',
    detail:
      activePhaseId === 'stale'
        ? 'Code changes or commit switched. Re-analyze to prevent stale blast radius metrics.'
        : activePhaseId === 'completed'
        ? 'AST call graphs and blast radius topology are fully parsed and up to date.'
        : 'Select or upload a repository to begin ingestion.',
    icon: activePhaseId === 'stale' ? AlertTriangle : activePhaseId === 'completed' ? CheckCircle2 : Clock
  };

  const repoName = selectedRepo?.name || 'Repository';
  const branchName = selectedRepo?.branch || 'main';
  const commitHash = selectedCommit?.hash || selectedRepo?.lastCommitHash || '8f92a1b';
  const totalFiles = repositoryMetadata?.totalFiles || selectedRepo?.totalFiles || 42;
  const filesParsed = isAnalyzing
    ? Math.min(Math.round((analysisProgress / 100) * totalFiles), totalFiles)
    : totalFiles;

  const handleSyncClick = (e) => {
    if (e) e.stopPropagation();
    if (onReSync) {
      onReSync();
    } else if (runAnalysis) {
      runAnalysis(selectedRepo?.id);
    }
  };

  // =========================================================================
  // 1. COMPACT VARIANT (Used in Navbar header)
  // =========================================================================
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setModalVisible(true)}
          className={`relative flex items-center gap-2 h-9 px-3 rounded-xl transition-all duration-200 border shadow-sm select-none group focus:outline-none ${
            isAnalyzing
              ? 'bg-cyan-950/60 hover:bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-cyan-500/10'
              : ingestionStatus?.isStale
              ? 'bg-amber-950/50 hover:bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-amber-500/10'
              : selectedRepo
              ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
              : 'bg-slate-900/50 border-slate-800/70 text-slate-400'
          } ${className}`}
          title="Click to view full Ingestion & Analysis pipeline status"
          aria-label="Ingestion Status Indicator"
        >
          {/* Status Icon / Spinner */}
          <div className="relative flex items-center justify-center shrink-0">
            {isAnalyzing ? (
              <>
                <span className="absolute h-3.5 w-3.5 rounded-full bg-cyan-400 opacity-40 animate-ping" />
                <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
              </>
            ) : ingestionStatus?.isStale ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />
            ) : selectedRepo ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Clock className="h-4 w-4 text-slate-500" />
            )}
          </div>

          {/* Status Label & Active Phase */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold tracking-wide">
              {isAnalyzing ? (
                <span className="flex items-center gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                    {currentStage.title}:
                  </span>
                  <span className="font-mono text-cyan-300">{analysisProgress}%</span>
                </span>
              ) : ingestionStatus?.isStale ? (
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <span>Data Stale</span>
                  <span className="hidden sm:inline text-[10px] font-normal text-amber-400/80 font-mono">(Sync)</span>
                </span>
              ) : selectedRepo ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="text-emerald-400 font-semibold">Synced</span>
                  <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">(Ready)</span>
                </span>
              ) : (
                <span className="text-slate-400">No Repo</span>
              )}
            </span>
          </div>

          {/* Mini progress bar on compact when analyzing */}
          {isAnalyzing && (
            <div className="hidden sm:block w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-900/60 shrink-0">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(analysisProgress, 10)}%` }}
              />
            </div>
          )}

          {/* Quick open hint */}
          <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
        </button>

        {/* Ingestion Status Inspection Modal */}
        <IngestionInspectionModal
          isOpen={isModalVisible}
          onClose={() => setModalVisible(false)}
          activePhaseId={activePhaseId}
          currentStage={currentStage}
          repoName={repoName}
          branchName={branchName}
          commitHash={commitHash}
          analysisProgress={analysisProgress}
          analysisStep={analysisStep}
          analysisLogs={analysisLogs}
          isAnalyzing={isAnalyzing}
          isStale={ingestionStatus?.isStale}
          staleReason={ingestionStatus?.staleReason}
          onSync={handleSyncClick}
          cancelAnalysis={cancelAnalysis}
          filesParsed={filesParsed}
          totalFiles={totalFiles}
        />
      </>
    );
  }

  // =========================================================================
  // 2. BANNER VARIANT (Used at top of Dashboards & Results Pages)
  // =========================================================================
  if (variant === 'banner') {
    if (!isAnalyzing && !ingestionStatus?.isStale) {
      // Synchronized subtle banner
      return (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
              Ingestion Status:
              <span className="text-emerald-400 font-mono font-bold">Synchronized & Validated</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              AST Call Graph topology up to date for <strong className="text-slate-300">{repoName}</strong> ({commitHash})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalVisible(true)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
            >
              <Info className="h-3 w-3" /> View Pipeline Stages
            </button>
            <Button
              variant="outline"
              size="xs"
              icon={RefreshCw}
              onClick={handleSyncClick}
              className="text-[11px]"
            >
              Re-sync AST
            </Button>
          </div>

          <IngestionInspectionModal
            isOpen={isModalVisible}
            onClose={() => setModalVisible(false)}
            activePhaseId={activePhaseId}
            currentStage={currentStage}
            repoName={repoName}
            branchName={branchName}
            commitHash={commitHash}
            analysisProgress={analysisProgress}
            analysisStep={analysisStep}
            analysisLogs={analysisLogs}
            isAnalyzing={isAnalyzing}
            isStale={ingestionStatus?.isStale}
            staleReason={ingestionStatus?.staleReason}
            onSync={handleSyncClick}
            cancelAnalysis={cancelAnalysis}
            filesParsed={filesParsed}
            totalFiles={totalFiles}
          />
        </div>
      );
    }

    if (ingestionStatus?.isStale) {
      // Stale data alert banner
      return (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-lg shadow-amber-500/5 space-y-3 ${className}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-200">
                    Stale Workspace Data Detected
                  </h4>
                  <Badge variant="high" className="text-[10px] font-mono py-0.5">
                    OUT OF SYNC
                  </Badge>
                </div>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {ingestionStatus.staleReason ||
                    'Repository commits, branches, or file selections were modified since the last AST scan. Metrics may not reflect current code state.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={handleSyncClick}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Re-Ingest & Synchronize
              </Button>
              <button
                onClick={() => setModalVisible(true)}
                className="p-2 rounded-xl text-amber-400 hover:text-amber-200 hover:bg-amber-900/40 border border-amber-500/30 transition-all text-xs"
                title="Inspect Ingestion Pipeline"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showLockNotice && (
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/60 p-2 rounded-xl border border-amber-500/20 font-mono">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Interactive mutations and export actions are flagged to avoid saving unverified stale blast radiuses.</span>
            </div>
          )}

          <IngestionInspectionModal
            isOpen={isModalVisible}
            onClose={() => setModalVisible(false)}
            activePhaseId={activePhaseId}
            currentStage={currentStage}
            repoName={repoName}
            branchName={branchName}
            commitHash={commitHash}
            analysisProgress={analysisProgress}
            analysisStep={analysisStep}
            analysisLogs={analysisLogs}
            isAnalyzing={isAnalyzing}
            isStale={ingestionStatus?.isStale}
            staleReason={ingestionStatus?.staleReason}
            onSync={handleSyncClick}
            cancelAnalysis={cancelAnalysis}
            filesParsed={filesParsed}
            totalFiles={totalFiles}
          />
        </motion.div>
      );
    }

    // Active Ingestion / Analysis Progress Banner
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-cyan-500/50 shadow-xl shadow-cyan-500/10 space-y-4 ${className}`}
      >
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0">
              <span className="absolute h-full w-full rounded-2xl bg-cyan-400 opacity-20 animate-ping" />
              <Sparkles className="h-5 w-5 text-cyan-300 animate-spin" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Ingestion & Analysis Status:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {currentStage.fullTitle}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({analysisProgress}% complete)
                </span>
              </div>
              <p className="text-xs text-cyan-400/90 font-mono mt-0.5 truncate max-w-xl">
                › {analysisStep || 'Traversing AST call graph hierarchy & calculating blast propagation...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setModalVisible(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-950 border border-cyan-500/30 transition-all shadow-sm"
            >
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>View Live Logs</span>
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/30"
              style={{ width: `${Math.max(analysisProgress, 8)}%` }}
            />
          </div>
        </div>

        {/* 5-Stage Stepper Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {INGESTION_STAGES.map((stage, idx) => {
            const isDone = analysisProgress >= stage.threshold;
            const isCur = !isDone && (idx === 0 || analysisProgress >= INGESTION_STAGES[idx - 1].threshold);
            const IconComp = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : isCur
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800/70 text-slate-500'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isCur ? (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  ) : (
                    <IconComp className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold truncate">
                    {stage.stageNumber}. {stage.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Protection / Locking Notice */}
        {showLockNotice && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-cyan-300/80 bg-cyan-950/40 px-3 py-2 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Data Guard Active:</strong> Modifications and exports are temporarily paused until AST compilation finishes to prevent incomplete or stale results.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 shrink-0 hidden sm:inline">
              Parsed {filesParsed}/{totalFiles} files
            </span>
          </div>
        )}

        <IngestionInspectionModal
          isOpen={isModalVisible}
          onClose={() => setModalVisible(false)}
          activePhaseId={activePhaseId}
          currentStage={currentStage}
          repoName={repoName}
          branchName={branchName}
          commitHash={commitHash}
          analysisProgress={analysisProgress}
          analysisStep={analysisStep}
          analysisLogs={analysisLogs}
          isAnalyzing={isAnalyzing}
          isStale={ingestionStatus?.isStale}
          staleReason={ingestionStatus?.staleReason}
          onSync={handleSyncClick}
          cancelAnalysis={cancelAnalysis}
          filesParsed={filesParsed}
          totalFiles={totalFiles}
        />
      </motion.div>
    );
  }

  // =========================================================================
  // 3. WIDGET / CARD VARIANT (Used in Settings or Repository Cards)
  // =========================================================================
  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-cyan-400" /> Ingestion Status
        </span>
        <Badge
          variant={isAnalyzing ? 'info' : ingestionStatus?.isStale ? 'high' : 'success'}
          className="text-[10px] font-mono"
        >
          {currentStage.title}
        </Badge>
      </div>

      <p className="text-xs text-slate-400">{currentStage.detail}</p>

      {isAnalyzing && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-cyan-400">
            <span>{analysisStep || 'Processing...'}</span>
            <span>{analysisProgress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">
          Last sync: {ingestionStatus?.lastSynchronizedAt || 'Just now'}
        </span>
        <Button variant="outline" size="xs" icon={RefreshCw} onClick={handleSyncClick}>
          Re-sync
        </Button>
      </div>
    </div>
  );
};

/**
 * IngestionInspectionModal
 * Detailed popover/modal breaking down all 5 pipeline phases and live logs.
 */
function IngestionInspectionModal({
  isOpen,
  onClose,
  currentStage,
  repoName,
  branchName,
  commitHash,
  analysisProgress,
  analysisStep,
  analysisLogs,
  isAnalyzing,
  isStale,
  staleReason,
  onSync,
  cancelAnalysis,
  filesParsed,
  totalFiles
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] my-auto overflow-hidden"
        >
          {/* Sticky Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                    Repository Ingestion & AST Pipeline
                  </h3>
                  <Badge
                    variant={isAnalyzing ? 'info' : isStale ? 'high' : 'success'}
                    className="text-[10px] font-mono py-0.5"
                  >
                    {isAnalyzing ? 'IN PROGRESS' : isStale ? 'OUT OF SYNC' : 'SYNCHRONIZED'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                  Target: <span className="text-cyan-300 font-semibold">{repoName}</span> ({branchName} @ {commitHash})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Modal Body Container */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Current Phase Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <currentStage.icon className="h-4 w-4 text-cyan-400" />
                  Current Phase: <span className="text-cyan-300 font-mono">{currentStage.fullTitle}</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {isAnalyzing ? `${analysisProgress}%` : isStale ? 'Stale' : '100%'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isStale
                  ? staleReason || 'Repository state was changed without running AST analysis. Trigger a synchronization below.'
                  : currentStage.detail}
              </p>

              {isAnalyzing && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Step: {analysisStep || 'Compiling AST...'}</span>
                    <span>{filesParsed}/{totalFiles} files analyzed</span>
                  </div>
                </div>
              )}
            </div>

            {/* 5-Stage Stepper Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pipeline Stages Lifecycle
              </h4>
              <div className="space-y-2">
                {INGESTION_STAGES.map((stage) => {
                  const isCompleted = isAnalyzing ? analysisProgress >= stage.threshold : !isStale;
                  const isCurrent = isAnalyzing && !isCompleted && analysisProgress >= (stage.threshold - 25);
                  const Icon = stage.icon;

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <div className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold flex items-center gap-2">
                            <span>{stage.stageNumber}. {stage.fullTitle}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {stage.detail}
                          </p>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-semibold shrink-0">
                        {isCompleted ? (
                          <span className="text-emerald-400">PASSED</span>
                        ) : isCurrent ? (
                          <span className="text-cyan-400">{analysisProgress}%</span>
                        ) : (
                          <span className="text-slate-600">PENDING</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compiler Logs */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Ingestion & AST Stream Logs
                </span>
                <span className="text-[10px] text-cyan-400/80">Real-Time</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 space-y-1 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                {analysisLogs && analysisLogs.length > 0 ? (
                  analysisLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-500 text-[10px]">›</span>
                      <span className="truncate">{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No active stream logs. Ingestion pipeline is idle.</div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-900/95 shrink-0">
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-slate-200">{currentStage.title}</strong>
            </span>

            <div className="flex items-center gap-2">
              {isAnalyzing && cancelAnalysis && (
                <Button variant="outline" size="sm" onClick={cancelAnalysis} className="text-rose-400 border-rose-900">
                  Cancel Analysis
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                loading={isAnalyzing}
                onClick={() => {
                  if (onSync) onSync();
                  onClose();
                }}
              >
                {isAnalyzing ? 'Ingesting...' : 'Run Ingestion Sync'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Teleport modal to document.body to break free from any parent transform / backdrop-filter contexts
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
