import React from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

/**
 * Reusable progress component for repository health & telemetry metrics.
 * 
 * Supports:
 * - Real numerical values (0-100%) when connected to live backend
 * - Clean, honest placeholder states ('--%' / 'Pending') with NO fake values
 * - Customizable icons, color themes, badges, descriptions, and benchmarks
 */
export const HealthProgressMetric = ({
  id,
  label,
  value = null, // null or undefined means awaiting backend connection (no fake values)
  placeholderText = '--%',
  statusText = 'Pending Backend',
  statusVariant = 'neutral', // 'neutral' | 'info' | 'warning' | 'critical' | 'low'
  icon: Icon,
  description,
  benchmark,
  category = 'Health Metric',
  color = 'cyan', // 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'sky' | 'teal'
  className = '',
  showDetails = true,
  details = null,
  isPending = null // if explicitly provided, or auto-derived from value == null
}) => {
  const pending = isPending !== null ? isPending : (value === null || value === undefined || Number.isNaN(Number(value)));
  const numericValue = !pending && typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;

  const colorStyles = {
    cyan: {
      text: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10 border-cyan-500/30',
      barGradient: 'from-cyan-500 to-blue-500',
      borderHover: 'hover:border-cyan-500/50',
      iconColor: 'text-cyan-400'
    },
    indigo: {
      text: 'text-indigo-400',
      bgGlow: 'bg-indigo-500/10 border-indigo-500/30',
      barGradient: 'from-indigo-500 to-purple-500',
      borderHover: 'hover:border-indigo-500/50',
      iconColor: 'text-indigo-400'
    },
    emerald: {
      text: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/30',
      barGradient: 'from-emerald-500 to-teal-500',
      borderHover: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400'
    },
    amber: {
      text: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/30',
      barGradient: 'from-amber-500 to-orange-500',
      borderHover: 'hover:border-amber-500/50',
      iconColor: 'text-amber-400'
    },
    rose: {
      text: 'text-rose-400',
      bgGlow: 'bg-rose-500/10 border-rose-500/30',
      barGradient: 'from-rose-500 to-red-500',
      borderHover: 'hover:border-rose-500/50',
      iconColor: 'text-rose-400'
    },
    purple: {
      text: 'text-purple-400',
      bgGlow: 'bg-purple-500/10 border-purple-500/30',
      barGradient: 'from-purple-500 to-pink-500',
      borderHover: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400'
    },
    teal: {
      text: 'text-teal-400',
      bgGlow: 'bg-teal-500/10 border-teal-500/30',
      barGradient: 'from-teal-500 to-cyan-500',
      borderHover: 'hover:border-teal-500/50',
      iconColor: 'text-teal-400'
    },
    sky: {
      text: 'text-sky-400',
      bgGlow: 'bg-sky-500/10 border-sky-500/30',
      barGradient: 'from-sky-500 to-indigo-500',
      borderHover: 'hover:border-sky-500/50',
      iconColor: 'text-sky-400'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.cyan;
  const elementId = id || `metric-${(label || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <motion.div
      id={elementId}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'p-4 sm:p-5 rounded-2xl bg-slate-900/85 border border-slate-800/90 shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group',
        currentTheme.borderHover,
        className
      )}
    >
      {/* Background subtle tint when hovered */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/20 rounded-full blur-2xl pointer-events-none group-hover:bg-slate-700/20 transition-all" />

      {/* Top row: Icon, Label, Category & Status Pill */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className={cn('p-2 rounded-xl border shrink-0', currentTheme.bgGlow)}>
              <Icon className={cn('h-4 w-4', currentTheme.iconColor)} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
                {label}
              </span>
              {description && (
                <Tooltip title={label} content={description} position="top">
                  <Info className="h-3.5 w-3.5 text-slate-500 hover:text-slate-300 cursor-help shrink-0" />
                </Tooltip>
              )}
            </div>
            {category && (
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block truncate">
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant={
            statusVariant === 'neutral'
              ? 'neutral'
              : statusVariant === 'info'
              ? 'info'
              : statusVariant === 'warning'
              ? 'high'
              : statusVariant === 'critical'
              ? 'critical'
              : statusVariant === 'low' || statusVariant === 'success'
              ? 'low'
              : 'neutral'
          }
          className="text-[10px] font-mono shrink-0 px-2 py-0.5"
        >
          {pending ? (
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-slate-400" />
              {statusText}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              {statusText}
            </span>
          )}
        </Badge>
      </div>

      {/* Middle row: Progress Value & Target Benchmark */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            {pending ? (
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-400 tracking-tight">
                {placeholderText}
              </span>
            ) : (
              <>
                <span className={cn('text-2xl sm:text-3xl font-extrabold font-mono tracking-tight', currentTheme.text)}>
                  {numericValue}%
                </span>
                <span className="text-xs font-mono text-slate-400">/ 100</span>
              </>
            )}
          </div>

          {benchmark && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded-lg border border-slate-800">
              {benchmark}
            </span>
          )}
        </div>

        {/* Progress Bar Track */}
        <div
          role="progressbar"
          aria-valuenow={pending ? 0 : numericValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress score`}
          className="w-full bg-slate-950/90 h-2.5 rounded-full overflow-hidden border border-slate-800/80 relative p-0.5"
        >
          {pending ? (
            <div className="w-full h-full rounded-full bg-slate-800/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-pulse" />
            </div>
          ) : (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${numericValue}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r shadow-sm', currentTheme.barGradient)}
            />
          )}
        </div>
      </div>

      {/* Bottom row: Informative details or description footer */}
      {showDetails && (
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <span className="truncate pr-2">
            {pending ? (
              <span className="text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-slate-400 shrink-0" />
                Awaiting AST analysis hookup
              </span>
            ) : (
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                {details || description || 'Telemetry verified'}
              </span>
            )}
          </span>

          <span className="font-mono text-[10px] text-slate-400 shrink-0">
            {pending ? 'Awaiting Scan' : 'Connected'}
          </span>
        </div>
      )}
    </motion.div>
  );
};
