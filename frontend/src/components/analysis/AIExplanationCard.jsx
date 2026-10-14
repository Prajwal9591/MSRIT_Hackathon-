import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  TestTube2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

import { AIInsightsSection } from './AIInsightsSection';

export const AIExplanationCard = () => {
  const { aiExplanation, selectedRepo, selectedFile, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedRecId, setCopiedRecId] = useState(null);
  const [expanded, setExpanded] = useState(true);

  if (!aiExplanation) {
    return <AIInsightsSection forceState="empty" />;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(aiExplanation.suggestedFix || '');
    setCopied(true);
    showToast('Suggested fix code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyRec = (text, id) => {
    navigator.clipboard.writeText(text || '');
    setCopiedRecId(id);
    showToast('Remediation snippet copied!', 'success');
    setTimeout(() => setCopiedRecId(null), 2500);
  };

  const recommendations = aiExplanation.recommendations || [];
  const isAllGoodPractices = recommendations.length > 0 && recommendations.every(r => r.isGoodPractice);

  const baseFileName = selectedFile?.path?.split('/').pop() || 'CoreService.ts';

  const regressionTests = [
    { name: `tests/integration/${baseFileName.replace(/\.[^/.]+$/, '')}.spec.ts`, type: 'Integration Test', priority: 'P0 - Block Release' },
    { name: 'tests/security/AuthGuard.spec.ts', type: 'Security Spec', priority: 'P0 - Block Release' },
    { name: 'tests/contract/PublicApiContract.spec.ts', type: 'API Contract', priority: 'P1 - Release Guard' }
  ];

  const affectedTeams = [
    { name: `${selectedRepo?.name || 'Core'} Engineering Guild`, role: 'Primary Owner', lead: selectedRepo?.owner || 'Prajwal HY' },
    { name: 'DevSecOps & Platform Security', role: 'Security Approver', lead: 'Sarah Chen' },
    { name: 'Downstream Microservices Guild', role: 'API Consumer', lead: 'Marcus Brody' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-indigo-500/30 space-y-5 relative overflow-hidden shadow-2xl"
      id="ai-recommendations-section"
    >
      {/* Glow highlight backdrop */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/30 text-white">
            <Sparkles className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                STEP 7 OF 7
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">AI Recommendations & DevSecOps Remediation</h3>
              <Badge variant="info" className="text-[10px] py-0">
                <Cpu className="h-3 w-3 mr-1" /> {aiExplanation.modelUsed}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gemini-guided architectural explanation, automated refactoring patch, and P0 regression test suites
            </p>
          </div>
        </div>

        {/* Confidence rating & Toggle */}
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
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {aiExplanation.summary}
          </p>

          {/* Architecture Impact Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-cyan-400" /> Architectural & Blast-Radius Rationale
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l-2 border-cyan-500/60">
              {aiExplanation.architectureImpact}
            </p>
          </div>

          {/* Targeted Remediation Recommendations */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Actionable DevSecOps Remediations
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {isAllGoodPractices ? '0 Issues Detected' : `${recommendations.filter(r => !r.isGoodPractice).length} Actionable Fix(es)`}
              </span>
            </div>

            {isAllGoodPractices ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Good Architectural & Security Practices Verified</span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  The repository follows good practices with clean architecture, strict module boundaries, and zero detected vulnerabilities in the blast radius.
                </p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.filter(r => !r.isGoodPractice).map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-cyan-300">{rec.title}</span>
                          {rec.issueType && (
                            <Badge variant={rec.severity === 'Critical' ? 'danger' : 'warning'} className="text-[10px] py-0 px-2">
                              {rec.issueType}
                            </Badge>
                          )}
                          {rec.category && (
                            <span className="text-[10px] font-mono text-slate-400">[{rec.category}]</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {rec.recommendation}
                        </p>
                      </div>

                      {rec.codeFix && (
                        <button
                          onClick={() => handleCopyRec(rec.codeFix, rec.id)}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-200 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0"
                        >
                          {copiedRecId === rec.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedRecId === rec.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>

                    {rec.reason && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="font-semibold text-slate-300">Issue Cause: </span>
                        {rec.reason}
                      </div>
                    )}

                    {rec.codeFix && (
                      <div className="bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-cyan-200/90 border border-slate-800 overflow-x-auto">
                        <pre>{rec.codeFix}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Good Architectural & Security Practices Verified</span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  The repository follows good practices with clean architecture and no detected vulnerabilities.
                </p>
              </div>
            )}
          </div>

          {/* Recommended Regression Tests to Run & Affected Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Regression Test Suite */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TestTube2 className="h-4 w-4 text-emerald-400" /> Recommended Tests to Run
              </h5>
              <div className="space-y-2">
                {regressionTests.map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-300 truncate">{t.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Teams */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-400" /> Affected-Teams Awareness & Sign-off
              </h5>
              <div className="space-y-2">
                {affectedTeams.map((team, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-200 block">{team.name}</span>
                      <span className="text-[11px] text-slate-400">Lead: {team.lead}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {team.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Refactored Fix Code Box */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-indigo-400" /> Gemini Automated Refactored Patch
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
