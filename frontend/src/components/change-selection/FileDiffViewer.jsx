import React from 'react';
import { FileCode, AlertCircle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const FileDiffViewer = () => {
  const { selectedFile, diffContent } = useApp();

  if (!selectedFile) return null;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
      {/* File Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono">{selectedFile.path}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{selectedFile.impactReason}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            +{selectedFile.additions}
          </span>
          <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
            -{selectedFile.deletions}
          </span>
          <Badge variant={selectedFile.risk.toLowerCase()} className="text-xs">
            {selectedFile.risk} Risk
          </Badge>
        </div>
      </div>

      {/* Impacted Functions */}
      {selectedFile.functionsModified && selectedFile.functionsModified.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Modified AST Functions:</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedFile.functionsModified.map((fn) => (
              <span key={fn} className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                {fn}()
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Syntax Diff Block */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs shadow-inner">
        <div className="bg-slate-900/90 px-4 py-2 text-slate-400 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span>Unified Diff Inspector</span>
          <span>UTF-8 • TypeScript</span>
        </div>
        <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed">
          {diffContent.split('\n').map((line, i) => {
            const isAdd = line.startsWith('+') && !line.startsWith('+++');
            const isDel = line.startsWith('-') && !line.startsWith('---');
            const isHeader = line.startsWith('@@') || line.startsWith('diff');

            return (
              <div
                key={i}
                className={`px-2 py-0.5 rounded ${
                  isAdd
                    ? 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
                    : isDel
                    ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500'
                    : isHeader
                    ? 'text-cyan-400 font-bold bg-slate-900/60 my-1'
                    : 'text-slate-400'
                }`}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
