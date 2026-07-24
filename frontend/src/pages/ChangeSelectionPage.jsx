import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Sparkles, FileCode, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { CommitSelector } from '../components/change-selection/CommitSelector';
import { FileDiffViewer } from '../components/change-selection/FileDiffViewer';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';

export const ChangeSelectionPage = () => {
  const { runAnalysis, isAnalyzing, selectedRepo } = useApp();

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
