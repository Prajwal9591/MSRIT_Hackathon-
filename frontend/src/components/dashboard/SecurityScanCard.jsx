import React from 'react';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecurityScanCard = ({ className = '' }) => {
  const { setActiveTab } = useApp();

  const securityChecks = [
    'No hardcoded secrets found',
    'No SQL injection vulnerabilities',
    'No insecure dependencies',
    'No path traversal issues'
  ];

  return (
    <div
      id="security-scan-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header with Title and Clean Badge */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Security Scan
            </h2>
          </div>
          <span className="border border-[#10b981]/40 bg-[#06261f] text-[#34d399] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Clean
          </span>
        </div>

        {/* 4 Security Checks List */}
        <div className="mt-4 space-y-3">
          {securityChecks.map((check) => (
            <div
              key={check}
              className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-200"
            >
              <div className="w-4 h-4 rounded-full bg-[#06261f] border border-[#10b981]/60 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#10b981] stroke-[3]" />
              </div>
              <span>{check}</span>
            </div>
          ))}
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
