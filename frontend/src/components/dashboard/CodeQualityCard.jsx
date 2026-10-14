import React from 'react';
import {
  BarChart2,
  Share2,
  GitBranch,
  FlaskConical,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CodeQualityCard = ({ className = '' }) => {
  const { setActiveTab } = useApp();
  const score = 85;

  // SVG Gauge calculations
  const size = 105;
  const strokeWidth = 9;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const metrics = [
    {
      name: 'Complexity',
      status: 'Good',
      color: 'text-[#34d399]',
      icon: Share2
    },
    {
      name: 'Maintainability',
      status: 'Good',
      color: 'text-[#34d399]',
      icon: GitBranch
    },
    {
      name: 'Test Coverage',
      status: 'Fair',
      color: 'text-[#fbbf24]',
      icon: FlaskConical
    },
    {
      name: 'Documentation',
      status: 'Good',
      color: 'text-[#34d399]',
      icon: FileText
    }
  ];

  return (
    <div
      id="code-quality-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#1e293b]">
          <BarChart2 className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Code Quality
          </h2>
        </div>

        {/* Content: Donut gauge on left, Breakdown list on right */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Circular Donut Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background Track Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#13233a"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground Gradient/Colored Arc */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#06b6d4"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-white leading-none">
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                /100
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="flex-1 space-y-2.5">
            {metrics.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className={`font-semibold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 pt-3 border-t border-[#1e293b]/70">
        <button
          type="button"
          onClick={() => setActiveTab('analysis-results')}
          className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] flex items-center justify-end gap-1 w-full transition-colors cursor-pointer"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
