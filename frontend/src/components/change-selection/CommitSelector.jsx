import React from 'react';
import {
  GitCommit,
  Clock,
  ArrowRight,
  GitBranch,
  FileCode2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const CommitSelector = ({ onNextStep }) => {
  const {
    selectedCommit,
    selectedFile,
    setSelectedFile,
    selectedRepo,
    showToast
  } = useApp();

  const commitFiles = selectedCommit?.files?.length
    ? selectedCommit.files
    : [
        {
          path: 'src/services/CoreService.ts',
          name: 'CoreService.ts',
          status: 'modified',
          additions: 42,
          deletions: 12,
          risk: 'High',
          impactReason: 'Core transactional pipeline & SQL dispatch logic.',
          functionsModified: ['executeQuery', 'processPayload', 'updateLedger']
        },
        {
          path: 'src/middleware/AuthGuard.ts',
          name: 'AuthGuard.ts',
          status: 'modified',
          additions: 18,
          deletions: 4,
          risk: 'Medium',
          impactReason: 'JWT validation & token extraction boundary.',
          functionsModified: ['verifyToken', 'extractClaims']
        },
        {
          path: 'src/routes/UserRoutes.ts',
          name: 'UserRoutes.ts',
          status: 'modified',
          additions: 24,
          deletions: 8,
          risk: 'Medium',
          impactReason: 'REST endpoint dispatch & input parsing.',
          functionsModified: ['getUserProfile', 'updateSettings']
        }
      ];

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    showToast(`Set '${file.name || file.path}' as active changed file for blast radius calculation`, 'success');
  };

  return (
    <div className="space-y-4" id="change-selection-section">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitCommit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                STEP 4 OF 7
              </span>
              <h3 className="text-base font-bold text-slate-100">Select Changed File (Blast Origin)</h3>
              <Badge variant="warning" className="text-[10px]">
                {commitFiles.length} Modified Files
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pick the modified file or commit diff to serve as Layer 0 center for concentric blast radius expansion
            </p>
          </div>
        </div>

        {onNextStep && (
          <Button variant="primary" size="sm" icon={ArrowRight} onClick={onNextStep}>
            Calculate Blast Radius →
          </Button>
        )}
      </div>

      {/* Active Commit Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
            <GitBranch className="h-3.5 w-3.5 text-amber-400" /> {selectedRepo?.branch || 'main'} / Commit: {selectedCommit?.hash || '8f92a1b'}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {selectedCommit?.timestamp || 'Just now'}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-100">{selectedCommit?.message || 'Refactor transaction dispatcher & update security validation logic'}</p>
      </div>

      {/* Modified File Picker List */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Available Modified Files in Commit ({commitFiles.length})
          </h4>
          <span className="text-[11px] text-slate-400">Click any file to recalculate concentric impact layers</span>
        </div>

        <div className="space-y-2">
          {commitFiles.map((file, idx) => {
            const isSelected = selectedFile?.path === file.path || (!selectedFile && idx === 0);

            return (
              <div
                key={file.path || idx}
                onClick={() => handleSelectFile(file)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl border shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <FileCode2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 truncate">
                        {file.path || file.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold">
                          Active Blast Origin (L0)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {file.impactReason || 'Core module subject to change impact analysis'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-emerald-400 font-mono">+{file.additions || 20}</span>{' '}
                    <span className="text-rose-400 font-mono">-{file.deletions || 5}</span>
                  </div>
                  <button
                    className={`px-3 py-1 rounded-xl font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
