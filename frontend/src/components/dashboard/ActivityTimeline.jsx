import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  FolderGit2,
  History
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

/**
 * ActivityTimeline
 *
 * Chronological log of scanned repositories, ingested commits, and AST telemetry executions.
 */
export const ActivityTimeline = ({
  activities = [],
  repoName = 'Repository',
  currentRiskScore = 78,
  onOpenDrawerClick = null,
  className = ''
}) => {
  const displayActivities =
    activities && activities.length > 0
      ? activities.slice(0, 3)
      : [
          {
            id: 'act-1',
            repoName: repoName,
            commitHash: '8f92a1b',
            date: 'Just now',
            riskScore: currentRiskScore,
            mode: 'GitHub Repo'
          }
        ];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={`p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between ${className}`}
      id="activity-timeline-card"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Recent Activity & Telemetry Timeline
            </h2>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
              TELEMETRY LOGS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Chronological log of scanned repositories, ingested commits, and AST telemetry executions.
          </p>
        </div>

        {onOpenDrawerClick && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              icon={History}
              onClick={onOpenDrawerClick}
              className="text-xs"
            >
              Open History Drawer
            </Button>
          </div>
        )}
      </div>

      {/* 2. Timeline List */}
      <div className="space-y-3">
        {displayActivities.map((act, idx) => {
          const score = Number(act.riskScore || currentRiskScore);
          const badgeVariant = score >= 75 ? 'critical' : score >= 50 ? 'high' : 'low';

          return (
            <div
              key={act.id || idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {act.repoName || repoName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Commit: <strong className="text-cyan-300">{act.commitHash || '8f92a1b'}</strong> • Mode: {act.mode || 'GitHub Clone'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Badge variant={badgeVariant} className="text-[10px] font-mono font-bold">
                  Risk Score: {score}
                </Badge>
                <span className="text-[11px] text-slate-500 font-mono">
                  {act.date || 'Recent'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
