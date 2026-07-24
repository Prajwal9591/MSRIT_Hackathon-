import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'info', className }) => {
  const variants = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber',
    medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 glow-indigo',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan',
    neutral: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all',
        variants[variant] || variants.info,
        className
      )}
    >
      {children}
    </span>
  );
};
