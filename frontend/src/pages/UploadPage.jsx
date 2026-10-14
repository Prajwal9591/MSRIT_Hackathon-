import React from 'react';
import { motion } from 'framer-motion';
import { FolderUp, LayoutDashboard, Activity, CheckCircle2 } from 'lucide-react';
import { UploadComponent } from '../components/upload/UploadComponent';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const UploadPage = () => {
  const {
    repositoryMetadata,
    selectedRepo,
    setActiveTab,
    runAnalysis
  } = useApp();

  const activeName = selectedRepo?.name || repositoryMetadata?.repositoryName;

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
            <FolderUp className="h-6 w-6 text-cyan-400" /> Repository Upload & Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ingest local source code or clone remote Git repositories to parse call hierarchy graphs
          </p>
        </div>

        <Badge variant="info" className="text-xs px-3 py-1">
          AST Call-Graph Parser Active
        </Badge>
      </div>

      {/* Main Upload Box */}
      <UploadComponent />

      {/* Quick Navigation to Ingested Repository Dashboard */}
      {activeName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass-card border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Repository <span className="text-cyan-300 font-mono">{activeName}</span> Ingested Successfully
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              View the unified Repository Dashboard for architecture telemetry, technology stack, dependency graphs, and blast radius risk scores.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              icon={LayoutDashboard}
              onClick={() => setActiveTab('dashboard')}
              className="text-xs"
            >
              Open Dashboard
            </Button>
            <Button
              variant="primary"
              icon={Activity}
              onClick={() => {
                if (selectedRepo?.id) {
                  runAnalysis(selectedRepo.id);
                } else {
                  setActiveTab('analysis-results');
                }
              }}
              className="text-xs shadow-lg shadow-cyan-500/20"
            >
              Launch Scan
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
