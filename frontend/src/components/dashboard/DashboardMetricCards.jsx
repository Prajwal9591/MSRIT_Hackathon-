import React from 'react';
import { Heart, Shield, Code2, AlertTriangle } from 'lucide-react';

export const DashboardMetricCards = ({
  healthScore = 88,
  securityScore = 92,
  maintainabilityScore = 85,
  riskScore = 15
}) => {
  const cards = [
    {
      id: 'metric-health',
      label: 'Overall Health',
      score: healthScore,
      unit: '/100',
      badge: 'Good',
      icon: Heart,
      iconColor: 'text-[#10b981]',
      scoreColor: 'text-[#10b981]',
      badgeStyle: 'border border-[#10b981]/40 bg-[#06261f] text-[#34d399]',
      barColor: 'bg-[#10b981]',
      progressPct: Math.min(100, Math.max(0, healthScore))
    },
    {
      id: 'metric-security',
      label: 'Security Score',
      score: securityScore,
      unit: '/100',
      badge: 'Good',
      icon: Shield,
      iconColor: 'text-[#06b6d4]',
      scoreColor: 'text-[#06b6d4]',
      badgeStyle: 'border border-[#06b6d4]/40 bg-[#072733] text-[#38bdf8]',
      barColor: 'bg-[#06b6d4]',
      progressPct: Math.min(100, Math.max(0, securityScore))
    },
    {
      id: 'metric-maintainability',
      label: 'Maintainability',
      score: maintainabilityScore,
      unit: '/100',
      badge: 'Good',
      icon: Code2,
      iconColor: 'text-[#3b82f6]',
      scoreColor: 'text-[#3b82f6]',
      badgeStyle: 'border border-[#3b82f6]/40 bg-[#0a2040] text-[#60a5fa]',
      barColor: 'bg-[#3b82f6]',
      progressPct: Math.min(100, Math.max(0, maintainabilityScore))
    },
    {
      id: 'metric-risk',
      label: 'Risk Score',
      score: riskScore,
      unit: '/100',
      badge: riskScore <= 25 ? 'Low' : riskScore <= 60 ? 'Medium' : 'High',
      icon: AlertTriangle,
      iconColor: 'text-[#ef4444]',
      scoreColor: 'text-[#f87171]',
      badgeStyle: 'border border-[#1e3a5f] bg-[#0c233f] text-[#38bdf8]',
      barColor: 'bg-[#ef4444]',
      progressPct: Math.min(100, Math.max(0, riskScore))
    }
  ];

  return (
    <div
      id="dashboard-metric-cards-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            {/* Header: Icon + Label */}
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
              <span className="text-xs sm:text-[13px] font-medium text-[#94a3b8]">
                {card.label}
              </span>
            </div>

            {/* Score & Badge Row */}
            <div className="flex items-baseline justify-between mb-3.5">
              <div className="flex items-baseline">
                <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${card.scoreColor}`}>
                  {card.score}
                </span>
                <span className="text-xs text-[#64748b] font-medium ml-1">
                  {card.unit}
                </span>
              </div>

              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>

            {/* Progress Track & Fill */}
            <div className="h-1.5 w-full bg-[#131d33] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${card.barColor}`}
                style={{ width: `${card.progressPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
