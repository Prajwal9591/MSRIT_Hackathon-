import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  GitBranch,
  Search,
  ChevronDown,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FolderUp,
  GitCommit,
  History,
  X,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Radio
} from 'lucide-react';

/**
 * RepositorySummary
 *
 * Production-grade DevSecOps & Blast Radius Dashboard Header.
 * Displays Repository Name, Current Branch, Repository Status, Last Scan,
 * Risk Score, an integrated Search Bar, and an overflow "Repository Actions" dropdown.
 */
export const RepositorySummary = ({
  repoName = 'Repository',
  defaultBranch = 'main',
  visibility = 'Public',
  status = null,
  lastScan = null,
  riskScore = 78,
  riskLevel = 'High',
  targetChangedFile = 'src/services/CoreService.ts',
  totalFiles = 0,
  isAnalyzing = false,
  onUploadClick,
  onSelectCommitClick,
  onRunScanClick,
  onOpenHistoryClick,
  onSearchChange,
  className = ''
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute status text and variant
  const effectiveStatus = status || (isAnalyzing ? 'Scanning AST...' : 'Ingestion Ready');
  const isScanning = isAnalyzing || effectiveStatus.toLowerCase().includes('scanning');

  // Compute formatted last scan
  const effectiveLastScan = lastScan || 'Today, 12:38 PM';

  // Compute risk badge color and icon
  const numericRisk = Number(riskScore) || 0;
  const isHighOrCritical = numericRisk >= 70;
  const isMedium = numericRisk >= 40 && numericRisk < 70;

  const getRiskIcon = () => {
    if (isHighOrCritical) return ShieldAlert;
    if (isMedium) return Shield;
    return ShieldCheck;
  };
  const RiskIcon = getRiskIcon();

  const getRiskColorClasses = () => {
    if (numericRisk >= 75) {
      return {
        pill: 'bg-rose-950/70 border-rose-800/80 text-rose-300 shadow-rose-950/50',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
        levelText: 'High Risk'
      };
    }
    if (numericRisk >= 50) {
      return {
        pill: 'bg-amber-950/70 border-amber-800/80 text-amber-300 shadow-amber-950/50',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        levelText: 'Medium Risk'
      };
    }
    return {
      pill: 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300 shadow-emerald-950/50',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      levelText: 'Low Risk'
    };
  };

  const riskStyles = getRiskColorClasses();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`p-4 sm:p-5 rounded-2xl glass-card bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md relative overflow-visible ${className}`}
      id="blast-radius-dashboard-header"
    >
      {/* Subtle background ambient light accent */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* =========================================================================
            LEFT SECTION: Repository Identity, Branch, Status, Last Scan, Risk Score
            ========================================================================= */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
          
          {/* 1. Repository Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shrink-0 shadow-inner">
              <FolderGit2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
                  {repoName}
                </h1>
                {visibility && (
                  <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded-full">
                    {visibility}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider on larger screens */}
          <div className="hidden sm:block h-6 w-px bg-slate-800 shrink-0" />

          {/* Metadata Badges Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
            
            {/* 2. Current Branch */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300 font-mono text-[11px] font-medium shadow-sm hover:border-slate-700 transition-colors"
              title={`Current active branch: ${defaultBranch}`}
            >
              <GitBranch className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[120px]">{defaultBranch}</span>
            </div>

            {/* 3. Repository Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[11px] font-medium border shadow-sm ${
                isScanning
                  ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
                  : 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
              }`}
              title={`Repository Status: ${effectiveStatus}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  isScanning ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="truncate">{effectiveStatus}</span>
            </div>

            {/* 4. Last Scan */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px] shadow-sm hover:border-slate-700 transition-colors"
              title={`Last AST & Blast Radius Scan: ${effectiveLastScan}`}
            >
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="text-slate-400 hidden xs:inline">Last Scan:</span>
              <span className="text-slate-200 font-semibold">{effectiveLastScan}</span>
            </div>

            {/* 5. Risk Score */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold shadow-sm ${riskStyles.pill}`}
              title={`Overall Blast Radius Risk Score: ${numericRisk}/100 (${riskStyles.levelText})`}
            >
              <RiskIcon className={`h-3.5 w-3.5 ${riskStyles.text} shrink-0`} />
              <span>Risk:</span>
              <span className="font-extrabold">{numericRisk}/100</span>
              <span className="hidden sm:inline font-normal opacity-90">({riskLevel || riskStyles.levelText})</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT SECTION: Search Bar & "Repository Actions" Overflow Dropdown
            ========================================================================= */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
          
          {/* 6. Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64 lg:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search files, AST, endpoints..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-9 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-8.5 pr-8 py-1.5 font-mono transition-all outline-none"
              id="dashboard-header-search"
            />
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Clear search query"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-slate-900 rounded border border-slate-800 pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* 7. "Repository Actions" Overflow Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-xl border text-xs font-semibold transition-all shadow-sm select-none ${
                dropdownOpen
                  ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-850 hover:text-white'
              }`}
              id="repository-actions-dropdown-trigger"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">Repository Actions</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-dropdown bg-slate-950/95 border border-slate-800 shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl"
                  id="repository-actions-menu"
                >
                  {/* Dropdown Header */}
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      Repository Operations
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded-full">
                      {totalFiles > 0 ? `${totalFiles} Files` : 'Ready'}
                    </span>
                  </div>

                  {/* Actions List */}
                  <div className="space-y-1">
                    
                    {/* Action 1: Launch Blast Radius Scan */}
                    {onRunScanClick && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onRunScanClick();
                        }}
                        disabled={isAnalyzing}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-900 text-left transition-all group border border-transparent hover:border-slate-800"
                      >
                        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <Radio className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                              Launch Blast Radius Scan
                            </span>
                            {isAnalyzing && (
                              <span className="text-[9px] font-mono text-cyan-400 animate-pulse">Running</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Run AST impact engine and compute cascading risks.
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Action 2: Upload Repository */}
                    {onUploadClick && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onUploadClick();
                        }}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-900 text-left transition-all group border border-transparent hover:border-slate-800"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <FolderUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors block">
                            Upload Repository
                          </span>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Ingest zip archive, folder, or remote GitHub repository.
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Action 3: Select Commit */}
                    {onSelectCommitClick && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onSelectCommitClick();
                        }}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-900 text-left transition-all group border border-transparent hover:border-slate-800"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <GitCommit className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors block">
                            Select Commit & Changeset
                          </span>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Choose target commit diff or specific modified file.
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Action 4: View History */}
                    {onOpenHistoryClick && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenHistoryClick();
                        }}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-900 text-left transition-all group border border-transparent hover:border-slate-800"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-teal-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <History className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors block">
                            View Analysis History
                          </span>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            Open historical telemetry scans and session drawer.
                          </p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Footer Status Info */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      AST Engine Ready
                    </span>
                    <span className="text-slate-400 truncate max-w-[140px]">
                      {targetChangedFile ? targetChangedFile.split('/').pop() : 'Clean'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
