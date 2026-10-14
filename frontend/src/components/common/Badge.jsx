import React from 'react';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export const Badge = ({ children, variant = 'info', className, tooltip, tooltipTitle }) => {
  const variants = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber',
    medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 glow-indigo',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan',
    neutral: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const defaultDescriptions = {
    critical: 'Requires immediate attention. High blast radius and severe disruption risk.',
    high: 'Significant architectural impact. Review dependencies and automated tests.',
    medium: 'Moderate change impact. Standard verification recommended.',
    low: 'Minor or isolated change. Minimal risk to peripheral systems.',
    info: 'System metadata or general status indicator.',
    neutral: 'Standard configuration or passive attribute.'
  };

  const tooltipText = tooltip || defaultDescriptions[variant];

  const badgeEl = (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all cursor-help',
        variants[variant] || variants.info,
        className
      )}
    >
      {children}
    </span>
  );

  if (tooltipText) {
    return (
      <Tooltip
        title={tooltipTitle || `${String(variant).toUpperCase()} Status`}
        content={tooltipText}
        position="top"
      >
        {badgeEl}
      </Tooltip>
    );
  }

  return badgeEl;
};

