import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Download, RefreshCw, Sparkles, ShieldCheck, Share2 } from 'lucide-react';
import { RiskCards } from '../components/analysis/RiskCards';
import { AIExplanationCard } from '../components/analysis/AIExplanationCard';
import { BlastRadiusCard } from '../components/analysis/BlastRadiusCard';
import { DependencyGraph } from '../components/analysis/DependencyGraph';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';

export const AnalysisResultsPage = () => {
  const { runAnalysis, isAnalyzing, selectedRepo, showToast } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" /> Blast Radius Analysis & Security Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive call-graph traversal for <span className="text-cyan-300 font-mono">{selectedRepo?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} loading={isAnalyzing} onClick={() => runAnalysis()}>
            Re-run Analysis
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => showToast('Exported complete PDF Audit Report', 'success')}>
            Export Full Report
          </Button>
        </div>
      </div>

      {/* 1. Risk Breakdown Cards */}
      <RiskCards />

      {/* 2. AI Explanation Card */}
      <AIExplanationCard />

      {/* 3. Blast Radius Card */}
      <BlastRadiusCard />

      {/* 4. Dependency Graph */}
      <DependencyGraph />
    </motion.div>
  );
};
