import React, { useState } from 'react';
import {
  Zap,
  ChevronDown,
  X,
  Share2,
  GitFork,
  Radio,
  Layers,
  ShieldCheck,
  ArrowRight,
  Check,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ChangeImpactAnalysisCard = ({
  onViewDetails,
  className = ''
}) => {
  const { setActiveTab, showToast, setSelectedFile } = useApp();

  const fileOptions = [
    {
      path: 'src/api/controller/AppController.ts',
      name: 'AppController.ts',
      direct: 4,
      indirect: 12,
      endpoints: 2,
      services: 3,
      riskLevel: 'Low Breaking Risk',
      riskColor: 'text-[#34d399]',
      riskBadgeBg: 'bg-[#06261f] border border-[#065f46]'
    },
    {
      path: 'src/services/AuthService.ts',
      name: 'AuthService.ts',
      direct: 3,
      indirect: 8,
      endpoints: 1,
      services: 4,
      riskLevel: 'Medium Breaking Risk',
      riskColor: 'text-[#fbbf24]',
      riskBadgeBg: 'bg-[#291807] border border-[#78350f]'
    },
    {
      path: 'src/services/UserService.ts',
      name: 'UserService.ts',
      direct: 2,
      indirect: 5,
      endpoints: 1,
      services: 2,
      riskLevel: 'Low Breaking Risk',
      riskColor: 'text-[#34d399]',
      riskBadgeBg: 'bg-[#06261f] border border-[#065f46]'
    },
    {
      path: 'src/repositories/UserRepository.ts',
      name: 'UserRepository.ts',
      direct: 1,
      indirect: 2,
      endpoints: 0,
      services: 2,
      riskLevel: 'Low Breaking Risk',
      riskColor: 'text-[#34d399]',
      riskBadgeBg: 'bg-[#06261f] border border-[#065f46]'
    },
    {
      path: 'src/config/index.ts',
      name: 'index.ts',
      direct: 5,
      indirect: 14,
      endpoints: 0,
      services: 5,
      riskLevel: 'Medium Breaking Risk',
      riskColor: 'text-[#fbbf24]',
      riskBadgeBg: 'bg-[#291807] border border-[#78350f]'
    }
  ];

  const [selectedFileOption, setSelectedFileOption] = useState(fileOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelect = (option) => {
    setSelectedFileOption(option);
    setDropdownOpen(false);
    if (setSelectedFile) {
      setSelectedFile({
        path: option.path,
        name: option.name
      });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedFileOption(fileOptions[0]);
    showToast('Reset file selection', 'info');
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    showToast(`Analyzing impact radius for ${selectedFileOption.name}...`, 'info');
    setTimeout(() => {
      setIsAnalyzing(false);
      showToast(`Impact analysis updated for ${selectedFileOption.name}`, 'success');
    }, 700);
  };

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(selectedFileOption);
    } else {
      setActiveTab('analysis-results');
    }
  };

  return (
    <div
      id="change-impact-analysis-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* 1. Header */}
      <div className="pb-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0e2a47] border border-[#1e3a5f] text-[#38bdf8]">
            <Zap className="w-5 h-5 fill-[#38bdf8]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Change Impact Analysis
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Analyze the impact of a file change
            </p>
          </div>
        </div>
      </div>

      {/* 2. File Selector & Analyze Button */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
            Select a file to analyze
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-[#080d19] border border-[#1e293b] hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <span className="font-mono text-slate-200 truncate">
                {selectedFileOption.path}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span
                  onClick={handleClear}
                  title="Clear"
                  className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-[#16233d]"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </div>
            </button>

            {/* Dropdown Options Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c1527] border border-[#1e293b] rounded-xl shadow-2xl py-1.5 z-30 max-h-56 overflow-y-auto">
                {fileOptions.map((opt) => (
                  <button
                    key={opt.path}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between font-mono transition-colors ${
                      selectedFileOption.path === opt.path
                        ? 'bg-[#1e293b] text-cyan-400 font-semibold'
                        : 'text-slate-300 hover:bg-[#16233d]'
                    }`}
                  >
                    <span className="truncate">{opt.path}</span>
                    {selectedFileOption.path === opt.path && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button: Analyze Impact */}
        <button
          id="btn-analyze-impact"
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950/40 transition-all cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Analyze Impact</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Impact Summary Section */}
      <div className="mt-5 pt-4 border-t border-[#1e293b]">
        <h3 className="text-xs font-bold text-[#e2e8f0] mb-3">
          Impact Summary
        </h3>

        <div className="space-y-2.5">
          {/* Direct Dependencies */}
          <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
            <div className="w-6 h-6 rounded-lg bg-[#3b1d54] text-[#c084fc] flex items-center justify-center shrink-0">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-white">{selectedFileOption.direct}</strong> Direct Dependencies
            </span>
          </div>

          {/* Indirect Dependencies */}
          <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
            <div className="w-6 h-6 rounded-lg bg-[#0c2f42] text-[#38bdf8] flex items-center justify-center shrink-0">
              <GitFork className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-white">{selectedFileOption.indirect}</strong> Indirect Dependencies
            </span>
          </div>

          {/* API Endpoints Affected */}
          <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
            <div className="w-6 h-6 rounded-lg bg-[#3d270c] text-[#fbbf24] flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-white">{selectedFileOption.endpoints}</strong> API Endpoints Affected
            </span>
          </div>

          {/* Services Affected */}
          <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
            <div className="w-6 h-6 rounded-lg bg-[#0e274a] text-[#60a5fa] flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-white">{selectedFileOption.services}</strong> Services Affected
            </span>
          </div>

          {/* Breaking Risk */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
              <div className="w-6 h-6 rounded-lg bg-[#06261f] text-[#34d399] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className={`font-semibold ${selectedFileOption.riskColor}`}>
                {selectedFileOption.riskLevel}
              </span>
            </div>

            {/* View Details Link */}
            <button
              type="button"
              onClick={handleDetailsClick}
              className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
