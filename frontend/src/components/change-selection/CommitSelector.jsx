import React, { useState } from 'react';
import {
  GitCommit,
  GitBranch,
  User,
  Clock,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const CommitSelector = () => {
  const { selectedCommit, setSelectedCommit, selectedFile, setSelectedFile } = useApp();
  const [selectedFilesMap, setSelectedFilesMap] = useState({
    'src/services/StripeWebhookHandler.ts': true,
    'src/middleware/AuthenticationGuard.ts': true,
    'src/database/models/TransactionLedger.ts': true,
    'src/config/paymentConfig.ts': false
  });

  const toggleFile = (path) => {
    setSelectedFilesMap((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Active Commit Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit className="h-4 w-4 text-cyan-400" /> Active Commit Info
          </span>
          <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            {selectedCommit.hash}
          </span>
        </div>

        <p className="text-sm font-bold text-slate-100">{selectedCommit.message}</p>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <img src={selectedCommit.avatar} alt="Author" className="h-5 w-5 rounded-full object-cover" />
            <span className="text-slate-300 font-semibold">{selectedCommit.author}</span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {selectedCommit.timestamp}
          </span>
        </div>
      </div>

      {/* File Selection Checklist */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Modified Files ({selectedCommit.files.length})
          </h4>
          <span className="text-[10px] text-slate-400">Select files to include in blast analysis</span>
        </div>

        <div className="space-y-1.5">
          {selectedCommit.files.map((file) => {
            const isChecked = !!selectedFilesMap[file.path];
            const isSelectedFile = selectedFile?.path === file.path;

            return (
              <div
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelectedFile
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFile(file.path);
                    }}
                    className="text-cyan-400 focus:outline-none"
                  >
                    {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-500" />}
                  </button>
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{file.path}</span>
                </div>

                <Badge
                  variant={
                    file.risk === 'Critical'
                      ? 'critical'
                      : file.risk === 'High'
                      ? 'high'
                      : file.risk === 'Medium'
                      ? 'medium'
                      : 'low'
                  }
                  className="text-[9px] px-1.5 py-0 shrink-0"
                >
                  {file.risk}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
