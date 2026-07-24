import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const AIExplanationCard = () => {
  const { aiExplanation, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(aiExplanation.suggestedFix);
    setCopied(true);
    showToast('Suggested fix code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-indigo-500/30 space-y-5 relative overflow-hidden shadow-2xl"
    >
      {/* Glow highlight backdrop */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/30">
            <Sparkles className="h-5 w-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">AI Architectural Explanation</h3>
              <Badge variant="info" className="text-[10px] py-0">
                <Cpu className="h-3 w-3 mr-1" /> {aiExplanation.modelUsed}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Deep neural code synthesis & vulnerability rationale</p>
          </div>
        </div>

        {/* Confidence rating */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-1.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Confidence Score</span>
            <span className="text-sm font-extrabold font-mono text-cyan-400">{aiExplanation.confidenceScore}%</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Main summary */}
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {aiExplanation.summary}
          </p>

          {/* Architecture Impact Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-cyan-400" /> Architectural & Security Rationale
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-cyan-500/60">
              {aiExplanation.architectureImpact}
            </p>
          </div>

          {/* Risk Breakdown & Positive Aspects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Factors */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> High Risk Vectors Detected
              </h5>
              <div className="space-y-2">
                {(aiExplanation?.riskBreakdown || []).map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-300">
                    <span className="font-semibold text-rose-300">{item.category}:</span> {item.description}
                  </div>
                ))}
              </div>
            </div>

            {/* Positive Improvements */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Code Security Enhancements
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {(aiExplanation?.positiveAspects || []).map((pos, idx) => (
                  <li key={idx}>{pos}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Fix Code Box */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-indigo-400" /> Suggested Refactored Fix
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Code Fix'}
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-200 overflow-x-auto">
              <pre>{aiExplanation?.suggestedFix || '// No suggested code fix provided'}</pre>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
