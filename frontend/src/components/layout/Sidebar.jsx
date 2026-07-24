import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderUp,
  GitCommit,
  Activity,
  Settings,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Radio,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const Sidebar = () => {
  const { activeTab, setActiveTab, selectedRepo, isAnalyzing, runAnalysis } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'upload', label: 'Repository Upload', icon: FolderUp, badge: null },
    { id: 'change-selection', label: 'Change Selection', icon: GitCommit, badge: '4 Files' },
    { id: 'analysis-results', label: 'Analysis Results', icon: Activity, badge: 'Risk: High' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen glass-panel border-r border-slate-800/80 bg-slate-950/80 text-slate-300 z-30 select-none shadow-2xl"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 z-40 flex items-center justify-center h-7 w-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all shadow-md"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/60 overflow-hidden">
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/30 shrink-0">
          <Shield className="h-5 w-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col overflow-hidden whitespace-nowrap"
          >
            <span className="font-bold text-base bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              AegisBlast AI
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Zap className="h-3 w-3 text-cyan-400 inline" /> Impact Scanner v2.4
            </span>
          </motion.div>
        )}
      </div>

      {/* Active Repo Quick Info */}
      {!collapsed && selectedRepo && (
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="h-3 w-3 text-cyan-400" /> {selectedRepo.branch}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              <Radio className="h-2.5 w-2.5 animate-pulse" /> Ready
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate">{selectedRepo.name}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Blast Radius Index</span>
            <Badge variant="high" className="text-[10px] py-0 px-2">
              {selectedRepo.riskScore}/100
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center w-full px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 ml-3 truncate"
                >
                  {item.label}
                </motion.span>
              )}
              {!collapsed && item.badge && (
                <span className="relative z-10 ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Trigger Quick Scan Footer */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 text-center">
          <Sparkles className="h-6 w-6 text-cyan-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Impact Engine</h4>
          <p className="text-[11px] text-slate-400 mt-1 mb-3">Instant blast radius & transitive dependency check</p>
          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? 'Scanning Workspace...' : 'Run Quick Blast Scan'}
          </button>
        </div>
      )}
    </motion.aside>
  );
};
