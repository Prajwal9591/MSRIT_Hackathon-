import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  LayoutDashboard,
  FolderUp,
  GitCommit,
  Workflow,
  Settings,
  CornerUpLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_CONFIG = {
  landing: { title: 'Platform Overview', shortTitle: 'Overview', icon: LayoutDashboard },
  dashboard: { title: 'Blast Radius Dashboard', shortTitle: 'Dashboard', icon: LayoutDashboard },
  upload: { title: 'Repository Upload & Ingestion', shortTitle: 'Upload', icon: FolderUp },
  'change-selection': { title: 'Commit Change Selection & AST Diff', shortTitle: 'Changes', icon: GitCommit },
  'analysis-results': { title: 'Blast Radius Analysis Results', shortTitle: 'Analysis', icon: Workflow },
  settings: { title: 'System Configuration', shortTitle: 'Settings', icon: Settings }
};

export const InPageBackButton = () => {
  const { activeTab, canGoBack, goBack, previousTab } = useApp();

  // Landing page is root and must never show a back button
  if (!canGoBack || activeTab === 'landing' || !previousTab) {
    return null;
  }

  const prevConfig = PAGE_CONFIG[previousTab] || { title: 'Previous Page', shortTitle: 'Previous', icon: CornerUpLeft };
  const currentConfig = PAGE_CONFIG[activeTab] || { title: 'Current Page', shortTitle: 'Current', icon: Workflow };
  const PrevIcon = prevConfig.icon || CornerUpLeft;

  return (
    <motion.nav
      aria-label="In-page back navigation"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mb-4 sm:mb-6"
    >
      <div className="flex items-center justify-between gap-3 py-2 px-3 sm:px-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md shadow-md hover:border-slate-700/80 transition-all">
        {/* Left: Modern Back Button */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={goBack}
            id="inpage-back-button"
            aria-label={`Go back to ${prevConfig.title}`}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-semibold tracking-tight shadow-sm hover:shadow-cyan-500/10 transition-all duration-150 cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
            <span className="hidden sm:inline text-slate-400 font-normal group-hover:text-cyan-300/80 transition-colors">
              to {prevConfig.shortTitle || prevConfig.title}
            </span>
          </button>

          {/* Interactive In-Page Breadcrumbs Pathway */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 min-w-0 truncate">
            <button
              type="button"
              onClick={goBack}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1 truncate cursor-pointer font-medium"
              title={`Return to ${prevConfig.title}`}
            >
              <PrevIcon className="h-3 w-3 text-cyan-400/80 shrink-0" />
              <span className="truncate">{prevConfig.shortTitle || prevConfig.title}</span>
            </button>
            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
            <span className="text-slate-200 font-semibold truncate flex items-center gap-1">
              {currentConfig.shortTitle || currentConfig.title}
            </span>
          </div>
        </div>

        {/* Right: Subtle location context pill */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/80">
            Navigation History
          </span>
        </div>
      </div>
    </motion.nav>
  );
};
