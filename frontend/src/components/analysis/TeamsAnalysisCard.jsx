import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Send,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const TeamsAnalysisCard = ({ teamsData }) => {
  const [signedOff, setSignedOff] = useState({});
  const [notifySuccess, setNotifySuccess] = useState(false);

  const data = teamsData || {};
  const affectedTeams = data.affectedTeams || [
    {
      name: 'Platform Core Guild',
      lead: 'Alex Mercer (Staff Eng)',
      membersCount: 6,
      role: 'Core Infrastructure & Services',
      signoffRequired: false,
      riskLevel: 'High',
      impactedFiles: ['src/services/CoreService.ts']
    },
    {
      name: 'Payments & Checkout Squad',
      lead: 'Marcus Vance (Principal Eng)',
      membersCount: 5,
      role: 'Financial Ingestion & Ledgers',
      signoffRequired: true,
      riskLevel: 'Critical',
      impactedFiles: ['src/controllers/BillingController.ts', 'src/models/LedgerEntry.ts']
    },
    {
      name: 'DevSecOps & Identity',
      lead: 'Elena Rostova (Staff Security)',
      membersCount: 4,
      role: 'Authentication & Zero-Trust',
      signoffRequired: true,
      riskLevel: 'Critical',
      impactedFiles: ['src/middleware/AuthGuard.ts']
    }
  ];

  const toggleSignoff = (teamName) => {
    setSignedOff(prev => ({
      ...prev,
      [teamName]: !prev[teamName]
    }));
  };

  const handleNotifyTeams = () => {
    setNotifySuccess(true);
    setTimeout(() => setNotifySuccess(false), 2500);
  };

  const primaryOwner = data.primaryOwnerTeam || affectedTeams[0]?.name || 'Platform Core Guild';
  const totalTeams = data.totalTeamsImpacted || affectedTeams.length;
  const mandatoryCount = data.mandatoryReviewersCount || affectedTeams.filter(t => t.signoffRequired).length;
  const coordinationRisk = data.coordinationRisk || 'High';

  return (
    <div id="teams-analysis-card" className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Teams Analysis & Ownership Blast Boundary
              </h3>
              <Badge variant={coordinationRisk === 'High' ? 'danger' : 'warning'} size="sm">
                {coordinationRisk} Coordination Risk
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              CODEOWNERS mapping & cross-squad review requirements across impacted blast radius files
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNotifyTeams}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          {notifySuccess ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Slack & PR Alerts Dispatched</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Ping Reviewers ({mandatoryCount})</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Impacted Squads</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1 flex items-baseline gap-1.5">
            {totalTeams}
            <span className="text-xs font-normal text-slate-400">guilds</span>
          </div>
          <div className="text-[10px] text-purple-400 mt-1">
            Across {affectedTeams.reduce((acc, t) => acc + (t.impactedFiles?.length || 1), 0)} blast files
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Origin Codeowner</div>
          <div className="text-sm sm:text-base font-extrabold text-cyan-400 mt-1 truncate" title={primaryOwner}>
            {primaryOwner}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Origin author & primary maintainer
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">Required Sign-Offs</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">
            {mandatoryCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Mandatory branch protection
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400">PR Merge Policy</div>
          <div className="text-xs font-bold text-rose-400 mt-1.5 truncate">
            {mandatoryCount > 0 ? 'Requires 2+ Approvals' : 'Standard Policy'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Cross-boundary gate enforced
          </div>
        </div>
      </div>

      {/* Squads Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Impacted Squad Ownership & Review Checklist
        </div>

        {affectedTeams.map((team, idx) => {
          const isSignoff = team.signoffRequired;
          const isApproved = signedOff[team.name];

          return (
            <div
              key={team.name || idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isSignoff
                  ? 'bg-purple-950/20 border-purple-500/30'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isSignoff
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isApproved ? <CheckCircle2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-100">
                        {team.name}
                      </span>
                      {isSignoff && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Mandatory Reviewer
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {team.role}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Lead: <strong className="text-slate-300">{team.lead}</strong></span>
                      <span>•</span>
                      <span>{team.membersCount} Engineers</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-mono">
                        {team.impactedFiles?.length || 1} file(s) in blast radius
                      </span>
                    </div>

                    {/* Impacted files list */}
                    {team.impactedFiles && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {team.impactedFiles.map((file, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sign-off Toggle */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleSignoff(team.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isApproved
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : isSignoff
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Approved</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Sign-off Required</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
