import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  Layers,
  Users,
  Clock,
  RefreshCw,
  ChevronDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardOverviewHeader = ({
  repoName = 'AI-Powered-Real-Time-Arbitrage-Detection-Engine',
  repoOwner = 'Prajwal-S-45',
  visibility = 'Public',
  description = 'Real-time arbitrage detection using AI with smart contracts and market data analysis.',
  branch = 'main',
  branches = ['main', 'develop', 'feature/smart-contract-arbitrage', 'fix/orderbook-depth-latency'],
  commitsCount = 42,
  totalFiles = 100,
  contributorsCount = 18,
  lastUpdated = '2 hours ago',
  onSyncLatest,
  onBranchChange
}) => {
  const { showToast } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(branch);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    showToast('Syncing latest commits from GitHub...', 'info');
    
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Repository synced to latest commit (main: 42 commits)', 'success');
      if (onSyncLatest) onSyncLatest();
    }, 900);
  };

  const handleSelectBranch = (b) => {
    setCurrentBranch(b);
    setBranchDropdownOpen(false);
    showToast(`Switched active branch to '${b}'`, 'info');
    if (onBranchChange) onBranchChange(b);
  };

  return (
    <div
      id="dashboard-overview-header"
      className="bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        {/* Left: GitHub Icon, Title, Description, and Stats Meta */}
        <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
          {/* GitHub Octocat Icon Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-[#0c1322] fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and Visibility Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {repoName}
              </h1>
              <span className="bg-[#131d33] border border-[#263554] text-[#94a3b8] text-xs px-2.5 py-0.5 rounded-full font-medium">
                {visibility}
              </span>
            </div>

            {/* Owner / Full Handle */}
            <p className="text-xs text-[#64748b] font-mono mt-0.5">
              {repoOwner} / {repoName}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 max-w-3xl leading-relaxed">
              {description}
            </p>

            {/* Metadata Stats Row */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap mt-3.5 pt-3 border-t border-[#1e293b]/60 text-xs text-[#94a3b8]">
              {/* Branch */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{currentBranch}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {branchDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#0c1527] border border-[#1e293b] rounded-xl shadow-2xl py-1.5 z-30">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Branch
                    </div>
                    {branches.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleSelectBranch(b)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                          currentBranch === b
                            ? 'bg-[#1e293b] text-cyan-400 font-medium'
                            : 'text-slate-300 hover:bg-[#16233d]'
                        }`}
                      >
                        <span className="truncate">{b}</span>
                        {currentBranch === b && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Commits */}
              <div className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                <span>{commitsCount} commits</span>
              </div>

              {/* Files */}
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{totalFiles} files</span>
              </div>

              {/* Contributors */}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{contributorsCount} contributors</span>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Sync Latest Button, Branch Button, and Repository Analyzed Badge */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5">
            {/* Sync Latest Button */}
            <button
              id="btn-sync-latest"
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-[#101a2e] hover:bg-[#16233d] active:bg-[#1c2c4d] border border-[#233554] text-xs font-medium text-[#cbd5e1] hover:text-white px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#38bdf8] ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span>Sync Latest</span>
            </button>

            {/* Branch Pill Dropdown Button */}
            <button
              type="button"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="bg-[#101a2e] hover:bg-[#16233d] border border-[#233554] text-xs font-medium text-[#cbd5e1] hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentBranch}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Repository Analyzed Status Box */}
          <div className="bg-[#071d1e] border border-[#0d3b37] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-[#041a15] stroke-[3]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                Repository Analyzed
              </div>
              <div className="text-[11px] text-[#6ee7b7] font-medium">
                Completed {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
