import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderUp,
  GitCommit,
  Activity,
  Settings,
  Shield,
  GitBranch,
  Sparkles,
  Home,
  X,
  Sun,
  Moon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { Tooltip } from '../common/Tooltip';

const SIDEBAR_COLLAPSED_KEY = 'aegisblast_sidebar_collapsed';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    repositories = [],
    selectedRepo,
    setSelectedRepo,
    backendConnected,
    showToast,
    isAnalyzing,
    runAnalysis,
    mobileMenuOpen,
    setMobileMenuOpen,
    analysisHistory = [],
    setRecentHistoryOpen
  } = useApp();
  const { isDark, toggleTheme } = useTheme();

  // Desktop collapsed state initialized from localStorage (default expanded on large screens)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        if (saved !== null) return saved === 'true';
      } catch {
        // Safe fallback
      }
    }
    return false;
  });

  // Repo switch dropdown states (both desktop & mobile)
  const [desktopRepoOpen, setDesktopRepoOpen] = useState(false);
  const [mobileRepoOpen, setMobileRepoOpen] = useState(false);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    setDesktopRepoOpen(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextState));
      }
    } catch {
      // Safe fallback
    }
  };

  // Structured navigation items with categories
  const navSections = [
    {
      title: 'Navigation',
      items: [
        {
          id: 'landing',
          label: 'Platform Home',
          icon: Home,
          hint: 'Overview & features',
          badge: null
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          hint: 'Blast radius metrics',
          badge: null
        }
      ]
    },
    {
      title: 'Impact Analysis',
      items: [
        {
          id: 'upload',
          label: 'Ingest & Scan',
          icon: FolderUp,
          hint: 'AST & dependency parser',
          badge: null
        },
        {
          id: 'change-selection',
          label: 'Select Changes',
          icon: GitCommit,
          hint: 'Git diffs & commit scope',
          badge: '4 files'
        },
        {
          id: 'analysis-results',
          label: 'Blast Radius Map',
          icon: Activity,
          hint: 'Call-graph & risk audit',
          badge: 'Visualizer'
        }
      ]
    },
    {
      title: 'Configuration',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          hint: 'AI models & AST thresholds',
          badge: null
        }
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP PERMANENT SIDEBAR (Flows in Flexbox, No Overlay) */}
      {/* ========================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden md:flex flex-col h-screen h-[100dvh] shrink-0 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl text-slate-300 z-30 select-none overflow-hidden"
      >
        {/* Top Header: Brand + Collapse Toggle */}
        <div className="h-16 px-3.5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div
            onClick={() => handleNavClick('landing')}
            className={`flex items-center gap-3 cursor-pointer group min-w-0 ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
            title="AegisBlast AI Platform Home"
          >
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0 truncate"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-100 tracking-tight group-hover:text-cyan-300 transition-colors truncate">
                    AegisBlast
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate font-mono">
                  Code Impact v2.4
                </span>
              </motion.div>
            )}
          </div>

          {!isCollapsed && (
            <Tooltip title="Collapse sidebar (Ctrl+B)" position="right">
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all shrink-0 cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Collapsed Expand Trigger Header Button */}
        {isCollapsed && (
          <div className="px-2 pt-2 pb-1 flex justify-center border-b border-slate-900">
            <Tooltip title="Expand sidebar" position="right">
              <button
                type="button"
                onClick={toggleCollapse}
                className="w-full flex items-center justify-center py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800/60 transition-all cursor-pointer"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Active Repository Card / Switcher */}
        {selectedRepo && (
          <div className="p-2.5 border-b border-slate-800/80 shrink-0 relative">
            {!isCollapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setDesktopRepoOpen(!desktopRepoOpen)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all text-left group shadow-sm"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-mono text-cyan-400 truncate">
                      <GitBranch className="h-3 w-3 shrink-0" />
                      <span className="truncate">{selectedRepo.branch || 'main'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-cyan-300 transition-colors">
                      Switch <ChevronDown className={`h-3 w-3 transition-transform ${desktopRepoOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                      {selectedRepo.name}
                    </p>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${
                        selectedRepo.riskScore > 75
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          : selectedRepo.riskScore > 40
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      Risk {selectedRepo.riskScore}
                    </span>
                  </div>
                </button>

                {/* Dropdown switch menu */}
                <AnimatePresence>
                  {desktopRepoOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-2.5 right-2.5 mt-1 p-1 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Available Repositories
                      </div>
                      {repositories.map((repo) => (
                        <button
                          key={repo.id}
                          type="button"
                          onClick={() => {
                            setSelectedRepo(repo);
                            setDesktopRepoOpen(false);
                            showToast(`Target repository set to ${repo.name}`, 'info');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                            selectedRepo?.id === repo.id
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            {selectedRepo?.id === repo.id && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                            <span className="truncate">{repo.name}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                            {repo.branch}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex justify-center">
                <Tooltip title={`Target: ${selectedRepo.name} (${selectedRepo.branch || 'main'})`} position="right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollapsed(false);
                      setDesktopRepoOpen(true);
                    }}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 transition-all cursor-pointer shadow-sm hover:scale-105"
                    aria-label="Repository switcher"
                  >
                    <GitBranch className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3 px-2 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  if (isCollapsed) {
                    return (
                      <div key={item.id} className="flex justify-center">
                        <Tooltip title={item.label} position="right" wrapperClassName="flex items-center justify-center w-full">
                          <button
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                            className={`relative flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-150 cursor-pointer ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                            }`}
                            aria-label={item.label}
                          >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                            {item.badge && (
                              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`relative flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group min-h-[40px] ${
                        isActive
                          ? 'text-white font-semibold bg-gradient-to-r from-cyan-500/15 via-indigo-600/10 to-transparent border border-cyan-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="ml-3 truncate">{item.label}</span>

                      {item.badge && (
                        <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Access: Recent Analyses History */}
          <div className="pt-2 border-t border-slate-800/60">
            {isCollapsed ? (
              <div className="flex justify-center">
                <Tooltip title={`Recent Analyses (${analysisHistory.length})`} position="right">
                  <button
                    type="button"
                    onClick={() => setRecentHistoryOpen(true)}
                    className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 hover:bg-cyan-950/60 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm hover:scale-105"
                    aria-label="Recent Analyses"
                  >
                    <Clock className="h-4 w-4" />
                    {analysisHistory.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center">
                        {analysisHistory.length}
                      </span>
                    )}
                  </button>
                </Tooltip>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRecentHistoryOpen(true)}
                className="flex items-center w-full px-3 py-2 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm"
              >
                <Clock className="h-4 w-4 text-cyan-400 shrink-0 group-hover:rotate-12 transition-transform" />
                <span className="ml-2.5 truncate font-semibold">Recent History</span>
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {analysisHistory.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Action Trigger: Run Blast Scan */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Scanning...' : 'Run Quick Scan'}</span>
            </button>
          ) : (
            <div className="flex justify-center">
              <Tooltip title="Run Quick Blast Scan" position="right">
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  aria-label="Run Quick Blast Scan"
                >
                  <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Footer: Theme Toggle & Connection Indicator */}
        <div className="px-3 py-2.5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between shrink-0">
          {!isCollapsed ? (
            <>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  showToast(`Switched to ${isDark ? 'Light' : 'Dark'} mode`, 'info');
                }}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
                <span className="text-[11px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400" title={backendConnected ? 'API Connected' : 'Running Offline'}>
                <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px]">{backendConnected ? 'Connected' : 'Offline'}</span>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Tooltip title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'} position="right">
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    showToast(`Switched to ${isDark ? 'Light' : 'Dark'} mode`, 'info');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ========================================================= */}
      {/* 2. MOBILE & TABLET SLIDE-OVER DRAWER MENU                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col z-50 select-none overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-100">AegisBlast AI</span>
                    <span className="text-[10px] text-slate-400 font-mono">Workspace Menu</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Drawer Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                {/* Mobile Active Repository Switcher */}
                {selectedRepo && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-400">
                        <GitBranch className="h-3 w-3 shrink-0" /> {selectedRepo.branch || 'main'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileRepoOpen(!mobileRepoOpen)}
                        className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Switch <ChevronDown className={`h-3 w-3 transition-transform ${mobileRepoOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-100 truncate pr-2">{selectedRepo.name}</p>
                      <Badge variant={selectedRepo.riskScore > 75 ? 'critical' : selectedRepo.riskScore > 40 ? 'high' : 'low'} className="text-[9px] py-0 px-1.5 shrink-0">
                        Risk {selectedRepo.riskScore}/100
                      </Badge>
                    </div>

                    {mobileRepoOpen && (
                      <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                        {repositories.map((repo) => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => {
                              setSelectedRepo(repo);
                              setMobileRepoOpen(false);
                              showToast(`Switched target repo to ${repo.name}`, 'info');
                            }}
                            className={`flex items-center justify-between w-full p-2 rounded-lg text-xs text-left transition-all min-h-[36px] cursor-pointer ${
                              selectedRepo?.id === repo.id
                                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              {selectedRepo?.id === repo.id && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                              {repo.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{repo.riskScore}/100</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Navigation Links */}
                {navSections.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                            className={`flex items-center w-full px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                            <span className="ml-3 truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Mobile Recent Analyses Action */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setRecentHistoryOpen(true);
                    }}
                    className="flex items-center w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 transition-all min-h-[44px] cursor-pointer"
                  >
                    <Clock className="h-5 w-5 text-cyan-400 shrink-0" />
                    <span className="ml-3 truncate">Recent Analyses</span>
                    <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {analysisHistory.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Drawer Footer Actions */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    runAnalysis();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isAnalyzing ? 'Scanning...' : 'Run Blast Radius Scan'}</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      showToast(`Switched to ${isDark ? 'Light' : 'Dark'} mode`, 'info');
                    }}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 min-h-[36px] cursor-pointer"
                  >
                    {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
                    <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{backendConnected ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
