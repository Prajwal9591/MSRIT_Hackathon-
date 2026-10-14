import React, { useState } from 'react';
import { Layers, ArrowRight, X } from 'lucide-react';

export const TechnologyStackCard = ({ className = '' }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const primaryStack = [
    {
      name: 'TypeScript',
      percentage: '68%',
      badgeBg: 'bg-[#3178c6]',
      badgeText: 'TS',
      type: 'Primary Language'
    },
    {
      name: 'Node.js',
      percentage: '22%',
      badgeBg: 'bg-[#22c55e]',
      badgeText: 'Node',
      type: 'Runtime Engine'
    },
    {
      name: 'Python',
      percentage: '6%',
      badgeBg: 'bg-[#eab308] text-slate-900',
      badgeText: 'Py',
      type: 'AI & Data Analysis'
    },
    {
      name: 'Docker',
      percentage: '4%',
      badgeBg: 'bg-[#38bdf8] text-slate-900',
      badgeText: 'Doc',
      type: 'Containerization'
    }
  ];

  const allStack = [
    ...primaryStack,
    { name: 'Solidity', percentage: '< 1%', badgeBg: 'bg-[#627eea]', badgeText: 'Sol', type: 'Smart Contracts' },
    { name: 'PostgreSQL', percentage: 'DB', badgeBg: 'bg-[#336791]', badgeText: 'SQL', type: 'Relational Database' },
    { name: 'Redis', percentage: 'Cache', badgeBg: 'bg-[#dc2626]', badgeText: 'Red', type: 'In-Memory Cache' },
    { name: 'Jest', percentage: 'Test', badgeBg: 'bg-[#c21325]', badgeText: 'Jest', type: 'Unit Testing' }
  ];

  return (
    <div
      id="technology-stack-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#1e293b]">
          <Layers className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Technology Stack
          </h2>
        </div>

        {/* Stack Items */}
        <div className="mt-4 space-y-3.5">
          {primaryStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center justify-between text-xs sm:text-[13px] hover:bg-[#101c33] p-1.5 -mx-1.5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 ${tech.badgeBg}`}
                >
                  {tech.badgeText}
                </span>
                <span className="font-medium text-slate-200">{tech.name}</span>
              </div>
              <span className="font-mono text-slate-400 font-semibold">{tech.percentage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-5 pt-3 border-t border-[#1e293b]/70">
        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] flex items-center justify-end gap-1 w-full transition-colors cursor-pointer"
        >
          <span>View all (8)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal for View All (8) */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1527] border border-[#1e293b] rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                All Detected Technologies (8)
              </h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#16233d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {allStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#070d19] border border-[#172540]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${tech.badgeBg}`}
                    >
                      {tech.badgeText}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">{tech.name}</div>
                      <div className="text-[10px] text-slate-400">{tech.type}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{tech.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
