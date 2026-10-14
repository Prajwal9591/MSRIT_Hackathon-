import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  FileCode2,
  CheckCircle2,
  Copy,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const SecurityAuditCard = ({ onNextStep }) => {
  const {
    securityAudit,
    selectedRepo,
    selectedFile,
    blastRadiusData,
    showToast
  } = useApp();

  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showCleanFiles, setShowCleanFiles] = useState(true);

  // Issues list memoized
  const issues = useMemo(() => securityAudit?.issues || [], [securityAudit?.issues]);
  const totalCount = issues.length;
  const isClean = securityAudit?.passed || totalCount === 0;

  // Impacted files list from blast radius
  const impactedFilesList = useMemo(() => {
    if (securityAudit?.impactedFilesReport?.length) {
      return securityAudit.impactedFilesReport;
    }
    const layers = blastRadiusData?.layers || [];
    const collected = [];
    layers.forEach((layer) => {
      (layer.items || []).forEach((item) => {
        const p = item.name || item.path || '';
        const matchingIssues = issues.filter(
          (i) => i.filePath === p || p.endsWith(i.filePath) || i.filePath?.endsWith(p)
        );
        collected.push({
          path: p,
          name: p.split('/').pop(),
          layer: layer.level,
          layerName: layer.name,
          status: matchingIssues.length > 0 ? 'VULNERABLE' : 'CLEAN',
          issuesCount: matchingIssues.length,
          issues: matchingIssues
        });
      });
    });
    return collected.length > 0
      ? collected
      : [
          {
            path: selectedFile?.path || 'src/services/CoreService.ts',
            name: (selectedFile?.path || 'CoreService.ts').split('/').pop(),
            layer: 0,
            layerName: 'Layer 0: Changed File',
            status: issues.length > 0 ? 'VULNERABLE' : 'CLEAN',
            issuesCount: issues.length,
            issues
          }
        ];
  }, [securityAudit, blastRadiusData, issues, selectedFile]);

  // Filter issues based on active tabs
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSev = selectedSeverity === 'ALL' || issue.severity === selectedSeverity;
      const matchCat = selectedCategory === 'ALL' || issue.category === selectedCategory;
      return matchSev && matchCat;
    });
  }, [issues, selectedSeverity, selectedCategory]);

  // Unique categories in detected issues
  const detectedCategories = useMemo(() => {
    const set = new Set(issues.map((i) => i.category));
    return Array.from(set);
  }, [issues]);

  const handleCopyFix = (remediation, id) => {
    if (remediation) {
      navigator.clipboard?.writeText?.(remediation);
      setCopiedId(id);
      showToast('Remediation guidance copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getSeverityBadgeVariant = (sev) => {
    switch (String(sev || '').toUpperCase()) {
      case 'CRITICAL':
        return 'critical';
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getSeverityBorderColor = (sev) => {
    switch (String(sev || '').toUpperCase()) {
      case 'CRITICAL':
        return 'border-rose-500/50 bg-rose-950/20';
      case 'HIGH':
        return 'border-amber-500/50 bg-amber-950/20';
      case 'MEDIUM':
        return 'border-yellow-500/40 bg-yellow-950/15';
      case 'LOW':
        return 'border-cyan-500/40 bg-cyan-950/15';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  const cleanFiles = impactedFilesList.filter((f) => f.status === 'CLEAN');
  const vulnerableFiles = impactedFilesList.filter((f) => f.status === 'VULNERABLE');

  return (
    <div className="space-y-5" id="security-audit-section">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isClean
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isClean ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                STEP 6 OF 7
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Security Audit (Only for Impacted Files)
              </h3>
              <Badge variant={isClean ? 'success' : 'critical'} className="text-[10px] uppercase tracking-wider">
                {isClean ? 'Verified Clean' : `${totalCount} Vulnerabilities Found`}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              DevSecOps scan strictly filtered to the <strong className="text-cyan-300 font-mono">{impactedFilesList.length} files in the blast radius</strong> of <span className="text-slate-300 font-mono">{selectedFile?.path?.split('/').pop() || 'changed module'}</span>
            </p>
          </div>
        </div>

        {/* Right Metric Badges & Next Step */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
            {impactedFilesList.length} Impacted Files Scanned
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 font-mono text-xs">
            {Math.max(0, (selectedRepo?.totalFiles || 18) - impactedFilesList.length)} Unaffected Excluded
          </span>

          {onNextStep && (
            <Button variant="primary" size="sm" icon={ArrowRight} onClick={onNextStep}>
              AI Recommendations →
            </Button>
          )}
        </div>
      </div>

      {/* Scope Banner: Explaining the Scope is Only Impacted Files */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Target className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>
            <strong>Impacted-Only Scope Active:</strong> Scanned Layer 0 changed origin and downstream Layer 1–Layer 3 callers for SQLi, XSS, CSRF, auth bypass, and secrets.
          </span>
        </div>
        <span className="text-slate-400 font-mono shrink-0 hidden md:inline-block">
          {vulnerableFiles.length} Vulnerable / {cleanFiles.length} Clean
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Case 1: CLEAN - No security issues detected in blast radius   */}
      {/* ------------------------------------------------------------- */}
      {isClean ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-emerald-950/15 border border-emerald-500/30 backdrop-blur-xl text-center space-y-4"
        >
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-xl mx-auto">
            <h4 className="text-lg sm:text-xl font-extrabold text-emerald-300 tracking-tight">
              All impacted files verified secure.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              DevSecOps AST inspection verified that all <strong className="text-emerald-400">{impactedFilesList.length} files</strong> in the blast radius of <span className="font-semibold text-slate-100">{selectedFile?.path || selectedRepo?.name}</span> are free of SQL Injection, XSS, CSRF, auth bypass, or secret leaks.
            </p>
          </div>

          {/* Impacted Clean Files Pill Breakdown */}
          <div className="pt-3 border-t border-emerald-900/40 max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 block">
              Audited Impacted Files in Blast Radius:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {impactedFilesList.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 font-mono text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {f.name || f.path}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        /* ------------------------------------------------------------- */
        /* Case 2: ISSUES DETECTED - Impacted files vulnerability report */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {/* Summary Breakdown & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            {/* Severity Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Severity:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                const count =
                  sev === 'ALL'
                    ? totalCount
                    : issues.filter((i) => i.severity === sev).length;
                if (count === 0 && sev !== 'ALL') return null;

                return (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedSeverity === sev
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sev === 'ALL' ? 'All' : sev} ({count})
                  </button>
                );
              })}
            </div>

            {/* Category Filter if multiple */}
            {detectedCategories.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Categories ({totalCount})</option>
                  {detectedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({issues.filter((i) => i.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredIssues.map((issue, idx) => {
                const isExpanded = expandedIssueId === issue.id || totalCount <= 2;

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-3xl border p-4 sm:p-5 transition-all ${getSeverityBorderColor(
                      issue.severity
                    )}`}
                  >
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getSeverityBadgeVariant(issue.severity)} className="text-[10px] uppercase font-mono font-bold">
                            {issue.severity}
                          </Badge>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                            {issue.category}
                          </span>
                          {issue.ruleId && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {issue.ruleId}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 pt-0.5">
                          {issue.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* File Path & Line in Blast Radius */}
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 pt-2 flex-wrap">
                      <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-semibold">{issue.filePath}</span>
                      {issue.lineNumber > 0 && (
                        <span className="text-slate-400">
                          (Line <strong className="text-amber-300">{issue.lineNumber}</strong>)
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Impacted Blast Radius Node
                      </span>
                    </div>

                    {/* Code Snippet */}
                    {issue.codeSnippet && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 font-mono text-xs overflow-x-auto text-rose-300 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-600 select-none">{issue.lineNumber || 1}</span>
                          <code>{issue.codeSnippet}</code>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-3 text-xs"
                      >
                        {/* Explanation */}
                        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-1">
                          <span className="font-semibold text-slate-200 block">Vulnerability Root Cause:</span>
                          <p className="leading-relaxed">{issue.explanation}</p>
                        </div>

                        {/* Remediation */}
                        {issue.remediation && (
                          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Recommended Remediation:
                              </span>
                              <button
                                onClick={() => handleCopyFix(issue.remediation, issue.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-200"
                              >
                                {copiedId === issue.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copiedId === issue.id ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <p className="leading-relaxed text-cyan-100 font-sans">{issue.remediation}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Clean Impacted Files Summary */}
          {cleanFiles.length > 0 && (
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> {cleanFiles.length} Clean Impacted File(s) in Blast Radius
                </span>
                <button
                  onClick={() => setShowCleanFiles(!showCleanFiles)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {showCleanFiles ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCleanFiles && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {cleanFiles.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {f.name || f.path}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
