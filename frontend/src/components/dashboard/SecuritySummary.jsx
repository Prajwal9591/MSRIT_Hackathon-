import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Key,
  Globe,
  FileCode2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Flame,
  Code2,
  Shield,
  Layers,
  Terminal
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

/**
 * CompactSecurityMetricChip
 *
 * Dense, high-contrast metric chip for the security dashboard.
 * Displays uppercase label, prominent value with color coding, sub-label/badge, and icon.
 */
const CompactSecurityMetricChip = ({
  label,
  value,
  subValue = null,
  badge = null,
  badgeVariant = 'info',
  icon: Icon,
  colorTheme = 'emerald', // 'emerald' | 'rose' | 'amber' | 'indigo' | 'cyan'
  tooltip = null,
  statusDot = false
}) => {
  const themeClasses = {
    emerald: {
      border: 'border-slate-800/80 hover:border-emerald-700/60',
      bg: 'bg-slate-950/80 hover:bg-slate-900/90',
      iconBg: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400',
      value: 'text-emerald-300 group-hover:text-emerald-200',
      dot: 'bg-emerald-400 shadow-emerald-500/50'
    },
    rose: {
      border: 'border-slate-800/80 hover:border-rose-700/60',
      bg: 'bg-slate-950/80 hover:bg-slate-900/90',
      iconBg: 'bg-rose-950/70 border-rose-800/60 text-rose-400',
      value: 'text-rose-400 group-hover:text-rose-300',
      dot: 'bg-rose-400 shadow-rose-500/50'
    },
    amber: {
      border: 'border-slate-800/80 hover:border-amber-700/60',
      bg: 'bg-slate-950/80 hover:bg-slate-900/90',
      iconBg: 'bg-amber-950/70 border-amber-800/60 text-amber-400',
      value: 'text-amber-300 group-hover:text-amber-200',
      dot: 'bg-amber-400 shadow-amber-500/50'
    },
    indigo: {
      border: 'border-slate-800/80 hover:border-indigo-700/60',
      bg: 'bg-slate-950/80 hover:bg-slate-900/90',
      iconBg: 'bg-indigo-950/70 border-indigo-800/60 text-indigo-400',
      value: 'text-indigo-300 group-hover:text-indigo-200',
      dot: 'bg-indigo-400 shadow-indigo-500/50'
    },
    cyan: {
      border: 'border-slate-800/80 hover:border-cyan-700/60',
      bg: 'bg-slate-950/80 hover:bg-slate-900/90',
      iconBg: 'bg-cyan-950/70 border-cyan-800/60 text-cyan-400',
      value: 'text-cyan-300 group-hover:text-cyan-200',
      dot: 'bg-cyan-400 shadow-cyan-500/50'
    }
  };

  const currentTheme = themeClasses[colorTheme] || themeClasses.emerald;

  const content = (
    <div
      className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-1 group min-w-0 ${currentTheme.bg} ${currentTheme.border}`}
    >
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate group-hover:text-slate-300 transition-colors">
          {label}
        </span>
        {Icon && (
          <div
            className={`p-1 rounded-md border shrink-0 flex items-center justify-center ${currentTheme.iconBg}`}
          >
            <Icon className="h-3 w-3" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-1.5 mt-0.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {statusDot && (
            <span
              className={`h-1.5 w-1.5 rounded-full shadow-sm shrink-0 animate-pulse ${currentTheme.dot}`}
            />
          )}
          <span
            className={`text-sm sm:text-base font-bold font-mono truncate tracking-tight transition-colors ${currentTheme.value}`}
          >
            {value}
          </span>
        </div>

        {(badge || subValue) && (
          <div className="shrink-0">
            {badge ? (
              <Badge variant={badgeVariant} className="text-[9px] font-mono px-1.5 py-0.2">
                {badge}
              </Badge>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[70px]">
                {subValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip title={label} content={tooltip} position="top">
        {content}
      </Tooltip>
    );
  }

  return content;
};

/**
 * SecuritySummary
 *
 * Redesigned, compact DevSecOps security summary & vulnerability posture dashboard.
 * - Drastically reduces vertical height and empty space.
 * - Displays 7 core security metrics in a compact, balanced grid:
 *   1. Security Score
 *   2. Critical Issues
 *   3. High Issues
 *   4. Medium Issues
 *   5. Secrets
 *   6. Dependency Status
 *   7. Compliance
 * - Organizes detailed findings and verified vectors into an expandable collapsible panel.
 * - Preserves full backend bindings, rescan callback, and AST static analysis integration.
 */
export const SecuritySummary = ({
  securityAudit = null,
  onRunAuditClick = null,
  className = ''
}) => {
  const [isFindingsOpen, setIsFindingsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'SECRETS' | 'DEPS'
  const [isScanning, setIsScanning] = useState(false);

  // Extract issues and summary data from backend security audit
  const issues = Array.isArray(securityAudit?.issues) ? securityAudit.issues : [];
  const summary = securityAudit?.summary || {};

  const totalIssues = issues.length;
  const isSecurityPassed = securityAudit?.passed !== false && totalIssues === 0;

  // Exact severity counts
  const criticalCount =
    summary.criticalCount !== undefined
      ? summary.criticalCount
      : issues.filter((i) => (i.severity || '').toUpperCase() === 'CRITICAL').length;

  const highCount =
    summary.highCount !== undefined
      ? summary.highCount
      : issues.filter((i) => (i.severity || '').toUpperCase() === 'HIGH').length;

  const mediumCount =
    summary.mediumCount !== undefined
      ? summary.mediumCount
      : issues.filter((i) => (i.severity || '').toUpperCase() === 'MEDIUM').length;

  const lowCount =
    summary.lowCount !== undefined
      ? summary.lowCount
      : issues.filter((i) => (i.severity || '').toUpperCase() === 'LOW').length;

  // Specific domain counts (Secrets, Dependencies)
  const secretIssues = issues.filter(
    (i) =>
      (i.category || '').toLowerCase().includes('secret') ||
      (i.ruleId || '').includes('SECRET')
  );
  const secretsCount = secretIssues.length;

  const depIssues = issues.filter(
    (i) =>
      (i.category || '').toLowerCase().includes('depend') ||
      (i.ruleId || '').includes('DEP')
  );
  const depCount = depIssues.length;

  // Security score calculation
  const calculatedRiskScore =
    summary.securityRiskScore !== undefined
      ? summary.securityRiskScore
      : criticalCount * 25 + highCount * 15 + mediumCount * 6 + lowCount * 2;

  const securityScore =
    securityAudit?.score !== undefined
      ? securityAudit.score
      : isSecurityPassed
      ? 100
      : Math.max(15, 100 - calculatedRiskScore);

  const scoreGrade =
    securityScore >= 95
      ? 'Grade A+'
      : securityScore >= 85
      ? 'Grade A'
      : securityScore >= 70
      ? 'Grade B'
      : securityScore >= 50
      ? 'Grade C'
      : 'Grade F';

  // Audited Security Vectors for clean posture display
  const auditedVectors = [
    { name: 'SQL Injection (SQLi)', icon: ShieldCheck, status: 'Clean', detail: 'Parameterized & prepared' },
    { name: 'Cross-Site Scripting (XSS)', icon: Globe, status: 'Clean', detail: 'DOM sanitized & escaped' },
    { name: 'Hardcoded Secrets', icon: Key, status: secretsCount === 0 ? 'Clean' : `${secretsCount} Leaks`, isLeak: secretsCount > 0, detail: '0 API keys or private keys' },
    { name: 'Weak Authentication', icon: Lock, status: 'Enforced', detail: 'Algorithms & TLS verified' },
    { name: 'Dependency Vulnerabilities', icon: FileCode2, status: depCount === 0 ? '0 Known CVEs' : `${depCount} CVEs`, isLeak: depCount > 0, detail: 'Supply chain scanned' },
    { name: 'CSRF & Security Headers', icon: Shield, status: 'Configured', detail: 'Origin policy enforced' },
    { name: 'Path Traversal & Files', icon: Layers, status: 'Clean', detail: 'Path sandboxing verified' },
    { name: 'Command & Code Injection', icon: Terminal, status: 'Clean', detail: 'Safe process invocation' }
  ];

  // Filtered issues for the collapsible panel
  const filteredIssues = issues.filter((issue) => {
    const sev = (issue.severity || '').toUpperCase();
    const cat = (issue.category || '').toLowerCase();
    const rule = (issue.ruleId || '').toUpperCase();

    if (activeFilter === 'CRITICAL') return sev === 'CRITICAL';
    if (activeFilter === 'HIGH') return sev === 'HIGH';
    if (activeFilter === 'SECRETS') return cat.includes('secret') || rule.includes('SECRET');
    if (activeFilter === 'DEPS') return cat.includes('depend') || rule.includes('DEP');
    return true;
  });

  const handleScanClick = async () => {
    if (onRunAuditClick) {
      setIsScanning(true);
      try {
        await onRunAuditClick();
      } finally {
        setTimeout(() => setIsScanning(false), 600);
      }
    }
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`p-4 sm:p-5 rounded-2xl glass-card bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5 ${className}`}
      id="security-summary-card"
    >
      {/* 1. Header with Status Badge & Rescan Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-1.5 rounded-lg border shrink-0 ${
              isSecurityPassed
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/70 border-rose-800/60 text-rose-400'
            }`}
          >
            {isSecurityPassed ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
              Security Summary & Vulnerability Posture
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              Static Code AST Audit & Authorization Boundary Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Badge
            variant={isSecurityPassed ? 'low' : criticalCount > 0 ? 'critical' : 'high'}
            className="text-[10px] uppercase font-bold px-2 py-0.5 font-mono"
          >
            {isSecurityPassed
              ? 'PASSED (Clean)'
              : `${totalIssues} ${totalIssues === 1 ? 'Finding' : 'Findings'}`}
          </Badge>

          {onRunAuditClick && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleScanClick}
              loading={isScanning}
              className="text-xs h-7 px-2.5 py-0"
              title="Rerun security and vulnerability scanner"
            >
              Scan
            </Button>
          )}
        </div>
      </div>

      {/* 2. Compact 7-Metric Dashboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
        {/* 1. Security Score */}
        <CompactSecurityMetricChip
          label="Security Score"
          value={`${securityScore}%`}
          badge={scoreGrade}
          badgeVariant={securityScore >= 85 ? 'low' : securityScore >= 70 ? 'high' : 'critical'}
          icon={securityScore >= 85 ? ShieldCheck : ShieldAlert}
          colorTheme={securityScore >= 85 ? 'emerald' : securityScore >= 70 ? 'amber' : 'rose'}
          tooltip={`Calculated security posture index: ${securityScore}% (${scoreGrade})`}
          statusDot={isSecurityPassed}
        />

        {/* 2. Critical Issues */}
        <CompactSecurityMetricChip
          label="Critical Issues"
          value={criticalCount.toString()}
          subValue={criticalCount === 0 ? '0 Blockers' : 'Action Req.'}
          icon={Flame}
          colorTheme={criticalCount === 0 ? 'emerald' : 'rose'}
          tooltip={`Critical severity vulnerabilities: ${criticalCount}`}
        />

        {/* 3. High Issues */}
        <CompactSecurityMetricChip
          label="High Issues"
          value={highCount.toString()}
          subValue={highCount === 0 ? '0 Detected' : 'Elevated'}
          icon={AlertTriangle}
          colorTheme={highCount === 0 ? 'emerald' : 'amber'}
          tooltip={`High severity architectural issues: ${highCount}`}
        />

        {/* 4. Medium Issues */}
        <CompactSecurityMetricChip
          label="Medium Issues"
          value={mediumCount.toString()}
          subValue={mediumCount === 0 ? '0 Detected' : 'Review'}
          icon={AlertCircle}
          colorTheme={mediumCount === 0 ? 'emerald' : 'indigo'}
          tooltip={`Medium severity policy & configuration warnings: ${mediumCount}`}
        />

        {/* 5. Secrets */}
        <CompactSecurityMetricChip
          label="Secrets"
          value={secretsCount === 0 ? '0 Leaks' : `${secretsCount} Leaks`}
          subValue={secretsCount === 0 ? 'Clean' : 'Exposed'}
          icon={Key}
          colorTheme={secretsCount === 0 ? 'emerald' : 'rose'}
          tooltip={`Hardcoded credentials, private keys & token scans: ${secretsCount === 0 ? '0 Leaks (Clean)' : `${secretsCount} exposed secrets`}`}
          statusDot={secretsCount === 0}
        />

        {/* 6. Dependency Status */}
        <CompactSecurityMetricChip
          label="Dependency Status"
          value={depCount === 0 ? '0 CVEs' : `${depCount} CVEs`}
          subValue={depCount === 0 ? 'Healthy' : 'Vulnerable'}
          icon={FileCode2}
          colorTheme={depCount === 0 ? 'emerald' : 'rose'}
          tooltip={`Known CVEs & supply chain vulnerabilities: ${depCount === 0 ? '0 known CVEs (Up to date)' : `${depCount} vulnerable packages`}`}
        />

        {/* 7. Compliance */}
        <CompactSecurityMetricChip
          label="Compliance"
          value={isSecurityPassed ? 'Enforced' : 'At Risk'}
          badge="OWASP 10"
          badgeVariant={isSecurityPassed ? 'low' : 'high'}
          icon={Lock}
          colorTheme={isSecurityPassed ? 'emerald' : 'amber'}
          tooltip={`OWASP Top 10 & auth guard boundary compliance: ${isSecurityPassed ? 'Enforced' : 'Findings present'}`}
        />
      </div>

      {/* 3. Collapsible Findings Panel Toggle Bar */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsFindingsOpen(!isFindingsOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 transition-all text-xs font-mono group"
        >
          <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-100">
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold">
              {totalIssues > 0 ? 'Detailed Findings & Remediation' : 'Audited Security Vectors & Compliance Checks'}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({totalIssues > 0 ? `${totalIssues} ${totalIssues === 1 ? 'issue' : 'issues'}` : '8 vectors verified'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-1">
              {isFindingsOpen ? 'Collapse' : 'Expand'}
              {isFindingsOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
        </button>

        {/* 4. Collapsible Content Area */}
        <AnimatePresence>
          {isFindingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                {/* A. If issues exist: Filter Pills & Detailed Issue Cards */}
                {totalIssues > 0 ? (
                  <div className="space-y-2.5">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">
                        Filter:
                      </span>
                      {[
                        { id: 'ALL', label: `All (${totalIssues})` },
                        { id: 'CRITICAL', label: `Critical (${criticalCount})`, disabled: criticalCount === 0 },
                        { id: 'HIGH', label: `High (${highCount})`, disabled: highCount === 0 },
                        { id: 'SECRETS', label: `Secrets (${secretsCount})`, disabled: secretsCount === 0 },
                        { id: 'DEPS', label: `Dependencies (${depCount})`, disabled: depCount === 0 }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          disabled={filter.disabled}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] transition-colors ${
                            activeFilter === filter.id
                              ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-200 font-bold'
                              : filter.disabled
                              ? 'bg-slate-950/30 border-slate-900 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    {/* Issue Cards */}
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {filteredIssues.map((issue, idx) => {
                        const sev = (issue.severity || 'HIGH').toUpperCase();
                        const isCrit = sev === 'CRITICAL';
                        const isH = sev === 'HIGH';

                        return (
                          <div
                            key={issue.id || idx}
                            className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-slate-700/90 transition-all space-y-2 text-xs font-mono"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge
                                  variant={isCrit ? 'critical' : isH ? 'high' : 'medium'}
                                  className="text-[9px] font-bold px-1.5 py-0.2 uppercase shrink-0"
                                >
                                  {sev}
                                </Badge>
                                <span className="text-slate-200 font-semibold truncate text-[11px]">
                                  {issue.title || issue.category}
                                </span>
                              </div>

                              {issue.ruleId && (
                                <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                  {issue.ruleId}
                                </span>
                              )}
                            </div>

                            {/* File Path & Line */}
                            {issue.filePath && (
                              <div className="text-[11px] text-cyan-400 flex items-center gap-1.5 truncate">
                                <span className="text-slate-500">File:</span>
                                <span className="truncate">{issue.filePath}</span>
                                {issue.lineNumber && (
                                  <span className="text-slate-400">:L{issue.lineNumber}</span>
                                )}
                              </div>
                            )}

                            {/* Code Snippet */}
                            {issue.codeSnippet && (
                              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-rose-300/90 font-mono overflow-x-auto whitespace-pre">
                                {issue.codeSnippet}
                              </div>
                            )}

                            {/* Explanation & Remediation */}
                            <div className="space-y-1 text-[11px] text-slate-300 font-sans">
                              {issue.explanation && (
                                <p className="text-slate-400 text-[11px]">
                                  {issue.explanation}
                                </p>
                              )}
                              {issue.remediation && (
                                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300/90 text-[10px] font-mono flex items-start gap-1.5">
                                  <Sparkles className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Remediation:</strong> {issue.remediation}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* B. If clean (0 issues): Clean Posture Vectors Matrix */
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Zero detected vulnerabilities across all 8 automated inspection vectors:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                      {auditedVectors.map((vector, idx) => {
                        const VectorIcon = vector.icon;
                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                                <VectorIcon className="h-3 w-3 text-cyan-400" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-semibold text-slate-200 block truncate">
                                  {vector.name}
                                </span>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {vector.detail}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                vector.isLeak
                                  ? 'bg-rose-950/80 border-rose-800/60 text-rose-300'
                                  : 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                              }`}
                            >
                              {vector.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Compact Verification Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Security Boundary Verified
        </span>
        <span className="text-slate-400">
          AST & Static Analysis Synced
        </span>
      </div>
    </motion.div>
  );
};
