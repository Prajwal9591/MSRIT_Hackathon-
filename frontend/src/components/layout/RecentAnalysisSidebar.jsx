import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  X,
  Search,
  GitBranch,
  GitCommit,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ArrowRight,
  UploadCloud,
  Download,
  FileCode,
  FolderGit2,
  Calendar,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

export const RecentAnalysisSidebar = () => {
  const {
    recentHistoryOpen,
    setRecentHistoryOpen,
    analysisHistory = [],
    loadAnalysisSession,
    deleteAnalysisSession,
    clearAnalysisHistory,
    selectedRepo,
    selectedCommit,
    runAnalysis,
    setActiveTab,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'github' | 'high_risk' | 'low_risk'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'risk_desc' | 'risk_asc'
  const [copiedId, setCopiedId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    return analysisHistory
      .filter((item) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.repoName?.toLowerCase().includes(q);
          const matchUrl = item.gitUrl?.toLowerCase().includes(q);
          const matchCommit = item.commitHash?.toLowerCase().includes(q);
          const matchMsg = item.commitMsg?.toLowerCase().includes(q);
          const matchLang = item.language?.toLowerCase().includes(q);
          if (!matchName && !matchUrl && !matchCommit && !matchMsg && !matchLang) {
            return false;
          }
        }

        // Type filter
        if (filterType === 'github') {
          return Boolean(item.gitUrl && item.gitUrl.includes('github.com'));
        }
        if (filterType === 'high_risk') {
          return Number(item.riskScore || 0) >= 70;
        }
        if (filterType === 'low_risk') {
          return Number(item.riskScore || 0) < 70;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk_desc') {
          return (b.riskScore || 0) - (a.riskScore || 0);
        }
        if (sortBy === 'risk_asc') {
          return (a.riskScore || 0) - (b.riskScore || 0);
        }
        // default recent: date descending
        const dateA = new Date(a.date || a.timestamp || 0).getTime();
        const dateB = new Date(b.date || b.timestamp || 0).getTime();
        return dateB - dateA;
      });
  }, [analysisHistory, searchQuery, filterType, sortBy]);

  const handleCopyUrl = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    showToast('Copied repository URL to clipboard', 'info');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyHash = (hash, id) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    showToast(`Copied commit hash ${hash} to clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportHistory = () => {
    if (!analysisHistory.length) {
      showToast('No analysis history available to export', 'warning');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysisHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegisblast-analysis-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported analysis history JSON', 'success');
  };

  if (!recentHistoryOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setRecentHistoryOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Slide-over Drawer Panel */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          id="recent-analysis-history-sidebar"
          className="relative w-full max-w-xl sm:max-w-xl md:max-w-2xl h-full bg-slate-950 border-l border-slate-800/90 shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* 1. Header Banner */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                    Recent Analysis History
                  </h3>
                  <Badge variant="info" className="text-[10px] font-mono py-0 px-2">
                    {analysisHistory.length} Sessions
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Quickly revisit past ingested repository URLs and AST blast radius snapshots
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip title="Export History JSON" position="bottom">
                <button
                  onClick={handleExportHistory}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all border border-slate-800"
                  aria-label="Export history JSON"
                >
                  <Download className="h-4 w-4" />
                </button>
              </Tooltip>

              <button
                onClick={() => setRecentHistoryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Close history sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2. Search, Filter & Quick Sort Controls */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/90 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by repository name, Git URL, branch, or commit..."
                className="w-full h-10 bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-9 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({analysisHistory.length})
                </button>
                <button
                  onClick={() => setFilterType('github')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === 'github'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Git URLs
                </button>
                <button
                  onClick={() => setFilterType('high_risk')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === 'high_risk'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  High Risk (70+)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="risk_desc">Highest Risk</option>
                  <option value="risk_asc">Lowest Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Scrollable List of Past Analysis Sessions */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 custom-scrollbar min-h-0">
            {filteredHistory.length === 0 ? (
              <div className="py-12 px-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FolderGit2 className="h-7 w-7" />
                </div>
                <div className="max-w-sm mx-auto space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-200">
                    {searchQuery ? 'No Matching Analysis Sessions' : 'No Previous Analysis Sessions Recorded'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {searchQuery
                      ? `No analysis history matches query "${searchQuery}". Try clearing filters or searching another keyword.`
                      : 'Ingest a repository URL or upload source code to automatically save snapshots and revisit blast radius results anytime without re-uploading.'}
                  </p>
                </div>
                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={UploadCloud}
                    onClick={() => {
                      setRecentHistoryOpen(false);
                      setActiveTab('upload');
                    }}
                    className="text-xs"
                  >
                    Ingest New Repository
                  </Button>
                </div>
              </div>
            ) : (
              filteredHistory.map((session) => {
                const isActive =
                  selectedRepo?.name === session.repoName ||
                  (selectedRepo?.gitUrl && session.gitUrl && selectedRepo.gitUrl === session.gitUrl);
                const isSelectedCommit = selectedCommit?.hash === session.commitHash;
                const risk = Number(session.riskScore || 0);
                const riskVariant = risk >= 75 ? 'critical' : risk >= 50 ? 'high' : 'low';
                const formattedDate = session.timestamp || (session.date ? new Date(session.date).toLocaleDateString() : 'Recent');

                return (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                      isActive
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Active Session Indicator Glow */}
                    {isActive && (
                      <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
                    )}

                    {/* Top Row: Repo Title + URL + Active Tag + Risk Pill */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                            {session.repoName}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              {isSelectedCommit ? 'Active Commit' : 'Active Workspace'}
                            </span>
                          )}
                          <Badge variant={riskVariant} className="text-[10px] font-mono py-0 px-2 shrink-0">
                            Risk {risk}/100
                          </Badge>
                        </div>

                        {/* Git URL with Copy & External Link */}
                        {session.gitUrl ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <span className="truncate max-w-[280px] sm:max-w-[340px] text-cyan-400/90">
                              {session.gitUrl}
                            </span>
                            <button
                              onClick={() => handleCopyUrl(session.gitUrl, session.id)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Copy Git URL"
                            >
                              {copiedUrl === session.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            {session.gitUrl.includes('github.com') && (
                              <a
                                href={session.gitUrl.replace('.git', '')}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                title="Open in GitHub"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <FileCode className="h-3 w-3 text-cyan-400" /> Ingested Codebase Archive
                          </div>
                        )}
                      </div>

                      {/* Delete Session Action */}
                      <button
                        onClick={() => deleteAnalysisSession(session.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                        title="Remove from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Commit & Branch Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 my-2 pt-1 border-t border-slate-800/60 font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <GitBranch className="h-3 w-3 text-cyan-400" /> {session.branch || 'main'}
                      </span>
                      {session.commitHash && (
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                          <GitCommit className="h-3 w-3 text-indigo-400" />
                          <span>{session.commitHash}</span>
                          <button
                            onClick={() => handleCopyHash(session.commitHash, session.id)}
                            className="hover:text-cyan-300 ml-0.5"
                            title="Copy Hash"
                          >
                            {copiedId === session.id ? (
                              <Check className="h-2.5 w-2.5 text-emerald-400 inline" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 inline" />
                            )}
                          </button>
                        </span>
                      )}
                      {session.language && (
                        <span className="text-[11px] text-slate-400">{session.language}</span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" /> {formattedDate}
                      </span>
                    </div>

                    {/* Summary / Commit Message */}
                    {session.commitMsg && (
                      <p className="text-xs text-slate-300 line-clamp-1 italic mb-2.5">
                        "{session.commitMsg}"
                      </p>
                    )}

                    {/* Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 text-center">
                      <div>
                        <div className="text-xs font-extrabold text-slate-200 font-mono">
                          {session.impactedFilesCount || session.totalFilesChanged || 4}
                        </div>
                        <div className="text-[10px] text-slate-500">Affected Files</div>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-cyan-400 font-mono">
                          {session.downstreamServicesCount || 3}
                        </div>
                        <div className="text-[10px] text-slate-500">Downstream APIs</div>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-indigo-400 font-mono">
                          {session.publicEndpointsCount || 6}
                        </div>
                        <div className="text-[10px] text-slate-500">Endpoints</div>
                      </div>
                    </div>

                    {/* Actions Bar: Revisit Session (Primary) & Re-run Scan */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Status: <span className="text-emerald-400">{session.status || 'Completed'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RefreshCw}
                          onClick={() => {
                            loadAnalysisSession(session.id);
                            runAnalysis(session.repoId);
                          }}
                          className="text-xs py-1.5 px-2.5"
                        >
                          Re-scan
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => {
                            loadAnalysisSession(session.id);
                          }}
                          className="text-xs py-1.5 px-3"
                        >
                          Revisit Analysis
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* 4. Footer with Clear History & Ingest New Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            {confirmClearOpen ? (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-xs text-rose-300 font-medium">Clear all analysis history?</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmClearOpen(false)}
                    className="text-xs py-1 px-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      clearAnalysisHistory();
                      setConfirmClearOpen(false);
                    }}
                    className="text-xs py-1 px-2.5"
                  >
                    Confirm Clear
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={!analysisHistory.length}
                  className="text-xs text-slate-500 hover:text-rose-400 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear All History
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={UploadCloud}
                  onClick={() => {
                    setRecentHistoryOpen(false);
                    setActiveTab('upload');
                  }}
                  className="text-xs"
                >
                  Ingest New URL / Codebase
                </Button>
              </>
            )}
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
