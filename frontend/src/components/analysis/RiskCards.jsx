import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Tooltip } from '../common/Tooltip';

export const RiskCards = () => {
  const { riskCards } = useApp();
  const [selectedRisk, setSelectedRisk] = useState(null);

  if (!riskCards || riskCards.length === 0) {
    return null;
  }

  const getBorderColor = (level) => {
    switch (String(level || '').toLowerCase()) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/80 glow-rose';
      case 'high':
        return 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/80 glow-amber';
      case 'medium':
        return 'border-indigo-500/40 bg-indigo-950/20 hover:border-indigo-500/80 glow-indigo';
      case 'low':
        return 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500/80 glow-emerald';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" /> Security & Blast Risk Breakdown
          </h3>
          <p className="text-xs text-slate-400">Risk impact factors evaluated for the selected commit diff</p>
        </div>
        <Badge
          variant={riskCards.length === 1 && (riskCards[0].id.includes('non-code') || riskCards[0].id.includes('empty')) ? 'success' : 'critical'}
          className="text-xs px-3 py-1"
        >
          {riskCards.length} {riskCards.length === 1 ? 'Factor Assessed' : 'Factors Assessed'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedRisk(card)}
            className={`p-5 rounded-2xl border backdrop-blur-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${getBorderColor(card.level)}`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Badge variant={String(card?.level || 'info').toLowerCase()} className="uppercase tracking-wider text-[10px]">
                  {card?.level || 'INFO'} Risk
                </Badge>
                {card?.weight && (
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {Math.round(card.weight * 100)}% Wgt
                  </span>
                )}
              </div>
              <Tooltip
                title="Trend Delta"
                content={`Risk index shift compared to baseline commit: ${card?.changeTrend || '0%'}`}
                position="top"
              >
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 cursor-help">
                  {(card?.changeTrend || '').startsWith('+') ? (
                    <span className="flex items-center text-rose-400">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> {card?.changeTrend || '+0%'}
                    </span>
                  ) : (
                    <span className="flex items-center text-emerald-400">
                      <TrendingDown className="h-3 w-3 mr-0.5" /> {card?.changeTrend || '-0%'}
                    </span>
                  )}
                </div>
              </Tooltip>
            </div>

            {/* Score & Title */}
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-100 truncate pr-2">{card.title}</h4>
              <Tooltip
                title={`${card.title} Rating`}
                content={`Composite score calculated from ${card.affectedFilesCount || 0} affected files and AST dependency depth.`}
                position="left"
              >
                <span className="text-xl font-extrabold font-mono text-slate-100 cursor-help">{card.score}</span>
              </Tooltip>
            </div>

            {/* Score Bar */}
            <Tooltip
              title="Risk Index Progress"
              content={`${card.score}% severity threshold reached on 0-100 scale.`}
              position="top"
              className="w-full"
            >
              <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-800 cursor-help">
                <div
                  className={`h-full transition-all duration-500 ${
                    card.level === 'Critical'
                      ? 'bg-rose-500'
                      : card.level === 'High'
                      ? 'bg-amber-500'
                      : card.level === 'Medium'
                      ? 'bg-indigo-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${card.score}%` }}
                />
              </div>
            </Tooltip>

            {/* Summary */}
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
              {card.summary}
            </p>

            {/* Footer Action */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
              <span>{card.affectedFilesCount} File{card.affectedFilesCount > 1 ? 's' : ''} Affected</span>
              <span className="flex items-center gap-1 text-cyan-400 font-semibold hover:underline">
                Details <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal / Detail Drawer for selected card */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-dropdown rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={String(selectedRisk?.level || 'info').toLowerCase()} className="mb-1 uppercase">
                  {selectedRisk?.level || 'INFO'} Risk Impact
                </Badge>
                <h3 className="text-lg font-bold text-slate-100">{selectedRisk.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Impact Analysis Summary:</span>
                <p className="leading-relaxed">{selectedRisk.details}</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-200">
                <span className="font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-cyan-400" /> Recommended Mitigation:
                </span>
                <p className="leading-relaxed">{selectedRisk.recommendation}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRisk(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
