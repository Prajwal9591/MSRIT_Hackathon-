import React from 'react';
import { motion } from 'framer-motion';
import { FolderUp, CheckCircle, FileCode, Layers, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { UploadComponent } from '../components/upload/UploadComponent';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const UploadPage = () => {
  const { repositories, setSelectedRepo, setActiveTab, runAnalysis } = useApp();

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
            Ingest local source code or clone remote Git repositories to parse call hierarchy graph
          </p>
        </div>

        <Badge variant="info" className="text-xs px-3 py-1">
          AST Call-Graph Parser Active
        </Badge>
      </div>

      {/* Main Upload Box */}
      <UploadComponent />

      {/* Preset Repositories Quick Analysis */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">Quick Test Sample Codebases</h3>
            <p className="text-xs text-slate-400">Select a sample microservice architecture to launch immediate blast scan</p>
          </div>
          <Sparkles className="h-5 w-5 text-cyan-400 animate-spin-slow" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              onClick={() => {
                setSelectedRepo(repo);
                runAnalysis(repo.id);
              }}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all duration-200 hover:-translate-y-1 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">{repo.language}</span>
                <Badge variant={repo.riskScore > 75 ? 'critical' : 'high'} className="text-[9px]">
                  Risk {repo.riskScore}
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-slate-100 truncate">{repo.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{repo.description}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>Ingest & Scan</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
