import React, { useState } from 'react';
import {
  Search,
  Bell,
  GitBranch,
  ShieldAlert,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Server
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const Navbar = () => {
  const {
    activeTab,
    repositories,
    selectedRepo,
    setSelectedRepo,
    isAnalyzing,
    analysisProgress,
    backendConnected,
    showToast
  } = useApp();

  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const pageTitles = {
    dashboard: 'Security & Blast Radius Dashboard',
    upload: 'Repository Upload & Ingestion',
    'change-selection': 'Change Selection & Code Impact',
    'analysis-results': 'Blast Radius Analysis Results',
    settings: 'System Configuration & AI Provider Setup'
  };

  const notifications = [
    { id: 1, title: 'Critical Auth Guard Alert', time: '10m ago', text: 'Optional bypass flag detected in StripeWebhookHandler.ts', type: 'critical' },
    { id: 2, title: 'Downstream Service Dependency', time: '1h ago', text: '5 microservices impacted by payment-gateway-service PR #142', type: 'warning' },
    { id: 3, title: 'Analysis Completed', time: '2h ago', text: 'user-auth-microservice blast radius scan finished (92/100 risk)', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-20 h-16 glass-panel border-b border-slate-800/80 bg-slate-950/80 px-6 flex items-center justify-between shadow-lg">
      {/* Left side: Breadcrumb & Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>AegisBlast</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold uppercase">{activeTab}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">
            {pageTitles[activeTab] || 'Workspace'}
          </h1>
        </div>

        {/* Global Progress Bar when analyzing */}
        {isAnalyzing && (
          <div className="hidden md:flex items-center gap-3 ml-6 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-cyan-500/30">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-cyan-300">Scanning Blast Radius... {analysisProgress}%</span>
              <div className="w-32 bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side: Repository Switcher, Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Repo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:bg-slate-850 hover:border-slate-700 transition-all"
          >
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold max-w-[120px] md:max-w-[180px] truncate">
              {selectedRepo ? selectedRepo.name : 'Select Repo'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRepoDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-xl shadow-2xl py-2 z-50 border border-slate-800">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Target Repository
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      setShowRepoDropdown(false);
                      showToast(`Switched workspace to ${repo.name}`, 'info');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left hover:bg-slate-800/70 transition-all ${
                      selectedRepo?.id === repo.id ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{repo.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{repo.language}</span>
                    </div>
                    <Badge variant={repo.riskScore > 75 ? 'critical' : repo.riskScore > 50 ? 'high' : 'low'} className="text-[9px] px-1.5">
                      {repo.riskScore}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Search Input */}
        <div className="hidden lg:flex items-center relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search commits, files, functions..."
            className="w-56 bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
          <kbd className="absolute right-2.5 top-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800 rounded border border-slate-700">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-all"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-xl shadow-2xl p-3 z-50 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-200">System Alerts</span>
                <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${n.type === 'critical' ? 'text-rose-400' : n.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Backend Connectivity Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
          <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className={backendConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
            {backendConnected ? 'API Connected' : 'API Standby'}
          </span>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="User avatar"
            className="h-8 w-8 rounded-full border border-cyan-500/40 object-cover"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Alex Vance</span>
            <span className="text-[10px] text-slate-400 font-mono">Lead DevSecOps</span>
          </div>
        </div>
      </div>
    </header>
  );
};
