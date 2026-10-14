import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Sparkles } from 'lucide-react';
import { CommitSelector } from '../components/change-selection/CommitSelector';
import { FileDiffViewer } from '../components/change-selection/FileDiffViewer';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { ProcessingRepositorySkeleton } from '../components/common/Skeleton';
import { EmptyOrInvalidStructureCard } from '../components/common/EmptyOrInvalidStructureCard';
import { IngestionStatusIndicator } from '../components/common/IngestionStatusIndicator';

export const ChangeSelectionPage = () => {
  const {
    runAnalysis,
    isAnalyzing,
    analysisStep,
    analysisProgress,
    selectedRepo,
    repositoryMetadata,
    selectedCommit
  } = useApp();

  if (isAnalyzing) {
    return (
      <ProcessingRepositorySkeleton
        repoName={selectedRepo?.name || 'Repository'}
        step={analysisStep}
        progress={analysisProgress}
      />
    );
  }

  if (!selectedRepo) {
    return (
      <EmptyOrInvalidStructureCard
        customType="empty_repo"
        customTitle="No Repository Selected"
        customMessage="Upload a repository, drag & drop code files, or connect a remote repository to inspect commit history, code diffs, and modified AST functions before triggering blast radius analysis."
      />
    );
  }

  const isZeroFiles = selectedRepo?.totalFiles === 0 || repositoryMetadata?.totalFiles === 0 || repositoryMetadata?.isEmpty;
  const isNonCode = selectedRepo?.isNonCodeRepo || repositoryMetadata?.isNonCodeRepo || selectedRepo?.hasSourceCode === false;

  if (isZeroFiles || isNonCode) {
    return (
      <EmptyOrInvalidStructureCard
        repo={selectedRepo}
        metadata={repositoryMetadata}
      />
    );
  }

  if (!selectedCommit) {
    return (
      <EmptyOrInvalidStructureCard
        repo={selectedRepo}
        metadata={repositoryMetadata}
        customType="empty_graph"
        customTitle="No Commit History Available"
        customMessage={`No commits or diff history found for repository '${selectedRepo.name}'. Make a code change or select a different branch.`}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitCommit className="h-6 w-6 text-cyan-400" /> Commit Change Selection & AST Diff
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspect modified functions and lines of code in repo <span className="text-cyan-300 font-semibold">{selectedRepo?.name}</span>
          </p>
        </div>

        <Button variant="primary" icon={Sparkles} loading={isAnalyzing} onClick={() => runAnalysis()}>
          Execute Blast Radius Analysis
        </Button>
      </div>

      {/* Ingestion Status Progress & Stale Data Indicator Banner */}
      <IngestionStatusIndicator variant="banner" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Commit Selector & File list */}
        <div className="lg:col-span-1">
          <CommitSelector />
        </div>

        {/* Right Column: Interactive Unified Diff Viewer */}
        <div className="lg:col-span-2">
          <FileDiffViewer />
        </div>
      </div>
    </motion.div>
  );
};
