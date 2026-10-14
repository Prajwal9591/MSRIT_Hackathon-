import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  Server,
  Check,
  Zap,
  Menu,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Tooltip } from '../common/Tooltip';
import { IngestionStatusIndicator } from '../common/IngestionStatusIndicator';

export const Navbar = () => {
  const {
    repositories,
    selectedRepo,
    setSelectedRepo,
    backendConnected,
    showToast,
    mobileMenuOpen,
    setMobileMenuOpen,
    analysisHistory = [],
    setRecentHistoryOpen
  } = useApp();

  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const repoRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (repoRef.current && !repoRef.current.contains(event.target)) {
        setShowRepoDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Critical Auth Guard Alert', time: '10m ago', text: 'Optional bypass flag detected in StripeWebhookHandler.ts', type: 'critical' },
    { id: 2, title: 'Downstream Service Dependency', time: '1h ago', text: '5 microservices impacted by payment-gateway-service PR #142', type: 'warning' },
    { id: 3, title: 'Analysis Completed', time: '2h ago', text: 'user-auth-microservice blast radius scan finished (92/100 risk)', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 bg-slate-950/85 px-3 sm:px-4 lg:px-6 flex items-center justify-between shadow-xl backdrop-blur-md select-none">
      {/* Left section: Mobile Hamburger Toggle + Status Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Navigation Drawer Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all min-h-[40px] min-w-[40px] shrink-0"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="h-5 w-5 text-cyan-400" />
        </button>

        {/* Global Ingestion Status Indicator Pill */}
        <div className="flex items-center">
          <IngestionStatusIndicator variant="compact" />
        </div>
      </div>

      {/* Right section: Search, Repository Selector, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Input */}
        <div className="hidden xl:flex items-center relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search commits, files, AST..."
            className="w-48 xl:w-56 h-9 bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-8 pr-8 py-1.5 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
          <kbd className="absolute right-2.5 top-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800 rounded border border-slate-700 pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Target Repository Switcher */}
        <div className="relative" ref={repoRef}>
          <Tooltip title="Workspace Target" content="Switch active repository context across the platform" position="bottom">
            <button
              onClick={() => {
                setShowRepoDropdown(!showRepoDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:bg-slate-850 transition-all shadow-sm"
            >
              <Server className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold max-w-[100px] sm:max-w-[140px] truncate">
                {selectedRepo ? selectedRepo.name : 'Select Repo'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${showRepoDropdown ? 'rotate-180' : ''}`} />
            </button>
          </Tooltip>

          <AnimatePresence>
            {showRepoDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl shadow-2xl py-2 z-50 border border-slate-800"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Target Repositories</span>
                  <span className="text-cyan-400 font-mono">{repositories.length} Active</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => {
                        setSelectedRepo(repo);
                        setShowRepoDropdown(false);
                        showToast(`Switched target repo to ${repo.name}`, 'info');
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left hover:bg-slate-800/70 transition-all ${
                        selectedRepo?.id === repo.id ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="truncate flex items-center gap-1.5">
                          {selectedRepo?.id === repo.id && <Check className="h-3 w-3 text-cyan-400 shrink-0" />}
                          {repo.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{repo.language}</span>
                      </div>
                      <Badge variant={repo.riskScore > 75 ? 'critical' : repo.riskScore > 50 ? 'high' : 'low'} className="text-[9px] px-1.5 shrink-0">
                        {repo.riskScore}
                      </Badge>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls Group: Recent History, Theme Toggle & Notifications */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/90 shadow-inner">
          {/* Recent Analysis History Drawer Trigger */}
          <Tooltip title="Recent Analyses" content={`View past analysis sessions (${analysisHistory.length} recorded)`} position="bottom">
            <button
              onClick={() => setRecentHistoryOpen(true)}
              className="relative flex items-center justify-center h-7 px-2 gap-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all focus:outline-none"
              aria-label="Toggle Recent Analysis History"
            >
              <Clock className="h-4 w-4 text-cyan-400" />
              {analysisHistory.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  {analysisHistory.length}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <Tooltip title="System Notifications" content="View security alerts and job updates" position="bottom">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowRepoDropdown(false);
                }}
                className="relative flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </button>
            </Tooltip>

            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 glass-dropdown rounded-2xl shadow-2xl p-3 z-50 border border-slate-800"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" />
                      <span>System Alerts</span>
                    </div>
                    <button
                      onClick={() => {
                        showToast('All notifications marked as read', 'success');
                        setShowNotifDropdown(false);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${n.type === 'critical' ? 'text-rose-400' : n.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Backend API Connectivity Indicator */}
        <Tooltip
          title="Backend Connection"
          content={backendConnected ? 'Node.js Express backend API online on port 5000' : 'API on standby mode'}
          position="bottom"
        >
          <div className="hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono cursor-help">
            <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={backendConnected ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
              {backendConnected ? 'API Ready' : 'API Standby'}
            </span>
          </div>
        </Tooltip>

        {/* User Profile Avatar & Meta */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="User avatar"
            className="h-8 w-8 rounded-full border border-cyan-500/40 object-cover shadow-sm shrink-0"
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-slate-200 leading-tight">Alex Vance</span>
            <span className="text-[10px] text-slate-400 font-mono leading-tight">Lead DevSecOps</span>
          </div>
        </div>
      </div>
    </header>
  );
};

