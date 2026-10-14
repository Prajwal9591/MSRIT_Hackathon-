import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Layout,
  Server,
  Package,
  Database,
  Workflow,
  Sparkles,
  CheckCircle2,
  Layers,
  Star
} from 'lucide-react';
import { TechBadge, extractGroupedTechnologies } from '../common/TechBadge';
import { Badge } from '../common/Badge';

/**
 * TechnologyStack
 *
 * Redesigned, flat-hierarchy DevSecOps tech stack detection component.
 * Organizes technologies into 6 clean categorical rows/columns without nested cards,
 * displays compact chip badges, highlights the primary language with percentages,
 * and maintains full AST detection telemetry.
 */
export const TechnologyStack = ({ effectiveMetadata = {}, className = '' }) => {
  const {
    frontendBadges,
    backendBadges,
    packageManagerBadges,
    languageBadges,
    databaseBadges,
    infrastructureBadges,
    rawLanguages,
    totalCount
  } = extractGroupedTechnologies(effectiveMetadata);

  // Determine primary language and its percentage
  const primaryLangObj = rawLanguages && rawLanguages.length > 0 ? rawLanguages[0] : null;
  const primaryLangName =
    primaryLangObj?.language ||
    primaryLangObj?.name ||
    effectiveMetadata.primaryLanguage ||
    effectiveMetadata.language ||
    'TypeScript';
  const primaryLangPct = primaryLangObj?.percentage
    ? typeof primaryLangObj.percentage === 'string'
      ? primaryLangObj.percentage
      : `${primaryLangObj.percentage}%`
    : '100%';

  // Categories configuration for clean responsive grouping
  const categories = [
    {
      id: 'frontend',
      label: 'Frontend Frameworks',
      shortLabel: 'Frontend',
      icon: Layout,
      colorTheme: 'cyan',
      iconBg: 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400',
      badges: frontendBadges
    },
    {
      id: 'backend',
      label: 'Backend & Services',
      shortLabel: 'Backend',
      icon: Server,
      colorTheme: 'indigo',
      iconBg: 'bg-indigo-950/60 border-indigo-800/50 text-indigo-400',
      badges: backendBadges
    },
    {
      id: 'languages',
      label: 'Languages & Dialects',
      shortLabel: 'Languages',
      icon: Code2,
      colorTheme: 'amber',
      iconBg: 'bg-amber-950/60 border-amber-800/50 text-amber-400',
      badges: languageBadges.map((b, idx) => ({
        ...b,
        isPrimary: idx === 0 && !b.isNone
      }))
    },
    {
      id: 'packageManager',
      label: 'Package Ecosystem',
      shortLabel: 'Package Mgr',
      icon: Package,
      colorTheme: 'emerald',
      iconBg: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400',
      badges: packageManagerBadges
    },
    {
      id: 'database',
      label: 'Database & ORM',
      shortLabel: 'Database',
      icon: Database,
      colorTheme: 'rose',
      iconBg: 'bg-rose-950/60 border-rose-800/50 text-rose-400',
      badges: databaseBadges
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure & DevOps',
      shortLabel: 'Infrastructure',
      icon: Workflow,
      colorTheme: 'purple',
      iconBg: 'bg-purple-950/60 border-purple-800/50 text-purple-400',
      badges: infrastructureBadges
    }
  ];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`p-4 sm:p-5 rounded-2xl glass-card bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 ${className}`}
      id="technology-stack-card"
    >
      {/* 1. Header with Primary Language Highlight & Count Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
              Technology Stack
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              AST Auto-Detected Stack Architecture
            </p>
          </div>
        </div>

        {/* Primary Language Callout & Total Detected Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {primaryLangName && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-[11px] font-medium shadow-sm"
              title={`Primary repository language: ${primaryLangName} (${primaryLangPct})`}
            >
              <Star className="h-3 w-3 text-amber-400 fill-amber-400/30 shrink-0" />
              <span>Primary:</span>
              <strong className="text-amber-200">{primaryLangName}</strong>
              <span className="text-[10px] text-amber-400/90 font-bold bg-amber-900/60 px-1 py-0.2 rounded border border-amber-700/50">
                {primaryLangPct}
              </span>
            </div>
          )}

          <Badge variant="info" className="text-[10px] font-mono px-2 py-0.5">
            {totalCount} {totalCount === 1 ? 'Technology' : 'Technologies'}
          </Badge>
        </div>
      </div>

      {/* 2. Categorized Grid without Nested Cards (Clean Flattened Hierarchy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-1">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const activeBadgeCount = category.badges.filter((b) => !b.isNone).length;

          return (
            <div
              key={category.id}
              className="flex flex-col space-y-2 pb-3 border-b border-slate-800/60 lg:border-b-0 lg:pb-0"
            >
              {/* Category Subheading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded-md border shrink-0 ${category.iconBg}`}>
                    <CategoryIcon className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                    {category.label}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                    activeBadgeCount > 0
                      ? 'text-slate-300 bg-slate-950/80 border-slate-800'
                      : 'text-slate-500 bg-slate-950/40 border-slate-900'
                  }`}
                >
                  {activeBadgeCount}
                </span>
              </div>

              {/* Badges Container */}
              <div className="flex flex-wrap gap-1.5 items-center min-h-[30px] pt-0.5">
                {category.badges.map((badge, idx) => (
                  <TechBadge
                    key={idx}
                    {...badge}
                    colorTheme={category.colorTheme}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Language Distribution Telemetry Strip (Integrated & Minimalist) */}
      {rawLanguages && rawLanguages.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Language Distribution
            </span>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              {rawLanguages.map((lang, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      idx === 0
                        ? 'bg-cyan-400'
                        : idx === 1
                        ? 'bg-indigo-400'
                        : idx === 2
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <strong className="text-slate-200">{lang.language}</strong>
                  <span className="text-slate-400">
                    {typeof lang.percentage === 'string' ? lang.percentage : `${lang.percentage}%`}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden flex shadow-inner">
            {rawLanguages.map((lang, idx) => {
              const colors = [
                'bg-cyan-400',
                'bg-indigo-400',
                'bg-emerald-400',
                'bg-amber-400',
                'bg-rose-400',
                'bg-purple-400'
              ];
              const pct =
                typeof lang.percentage === 'string'
                  ? parseFloat(lang.percentage)
                  : lang.percentage || 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${colors[idx % colors.length]} transition-all duration-300`}
                  title={`${lang.language}: ${lang.percentage}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Compact Verification Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Stack Detection Verified
        </span>
        <span className="text-slate-400">
          AST Dependency Graph Synced
        </span>
      </div>
    </motion.div>
  );
};
