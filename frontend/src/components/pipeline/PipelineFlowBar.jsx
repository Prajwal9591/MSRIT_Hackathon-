import React from 'react';
import {
  GitBranch,
  FileCode2,
  Network,
  GitCommit,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  CheckCircle2,
  Layers,
  GitFork,
  Workflow
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PIPELINE_STEPS = [
  {
    id: 1,
    key: 'git-repo',
    title: 'Git Repository',
    shortTitle: '1. Git Repo',
    icon: GitBranch,
    description: 'Ingest codebase & commits',
    tab: 'git-repo'
  },
  {
    id: 2,
    key: 'code-parser',
    title: 'Code Parser',
    shortTitle: '2. Code Parser',
    icon: FileCode2,
    description: 'Extract AST & symbols',
    tab: 'code-parser'
  },
  {
    id: 3,
    key: 'dep-graph',
    title: 'Dependency Graph',
    shortTitle: '3. Dep Graph',
    icon: Network,
    description: 'Construct call index',
    tab: 'dep-graph'
  },
  {
    id: 4,
    key: 'change-detector',
    title: 'Change Detector',
    shortTitle: '4. Change Detector',
    icon: GitCommit,
    description: 'Identify diff & altered AST',
    tab: 'change-detector'
  },
  {
    id: 5,
    key: 'parallel-analysis',
    title: 'Impact • Tests • Teams',
    shortTitle: '5. Impact/Tests/Teams',
    icon: GitFork,
    description: 'Tri-branch parallel analysis',
    tab: 'parallel-analysis',
    isBranch: true
  },
  {
    id: 6,
    key: 'risk-engine',
    title: 'Risk Engine',
    shortTitle: '6. Risk Engine',
    icon: ShieldAlert,
    description: 'Multi-factor risk scoring',
    tab: 'risk-engine'
  },
  {
    id: 7,
    key: 'ai-explainer',
    title: 'AI Explainer',
    shortTitle: '7. AI Explainer',
    icon: Sparkles,
    description: 'Gemini synthesis & fixes',
    tab: 'ai-explainer'
  },
  {
    id: 8,
    key: 'web-dashboard',
    title: 'Web Dashboard',
    shortTitle: '8. Dashboard',
    icon: LayoutDashboard,
    description: 'Command center & report',
    tab: 'web-dashboard'
  }
];

export const PipelineFlowBar = ({
  currentStep = 1,
  onSelectStep,
  viewMode = 'flow', // 'flow' | 'step' | 'diagram'
  onToggleViewMode
}) => {
  const {
    selectedRepo,
    selectedFile,
    blastRadiusData,
    setActiveTab
  } = useApp();

  const getStepBadge = (stepKey) => {
    switch (stepKey) {
      case 'git-repo':
        return selectedRepo ? (selectedRepo.branch || selectedRepo.name) : 'No Repo';
      case 'code-parser':
        return selectedRepo ? `${selectedRepo.totalFiles || selectedRepo.fileCount || 18} Files` : 'AST Ready';
      case 'dep-graph':
        return blastRadiusData?.layers ? '24 Call Edges' : 'Call Graph';
      case 'change-detector':
        return selectedFile ? (selectedFile.path?.split('/').pop() || 'CoreService.ts') : 'Pick File';
      case 'parallel-analysis':
        return '3 Engines Active';
      case 'risk-engine':
        return blastRadiusData?.overallRiskScore ? `Score: ${blastRadiusData.overallRiskScore}` : 'Score: 78';
      case 'ai-explainer':
        return 'Gemini 2.5';
      case 'web-dashboard':
        return 'Ready';
      default:
        return null;
    }
  };

  const handleStepClick = (step) => {
    if (onSelectStep) {
      onSelectStep(step.id);
    } else {
      if (step.id === 1) setActiveTab('upload');
      else if (step.id === 4) setActiveTab('change-selection');
      else if (step.id === 8) setActiveTab('dashboard');
      else setActiveTab('analysis-results');
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3.5 shadow-xl">
      {/* Header Pipeline Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                End-to-End Architectural Pipeline
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Step {currentStep} of 8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Git Repository → Code Parser → Dependency Graph → Change Detector → [Impact | Tests | Teams] → Risk Engine → AI Explainer → Web Dashboard
            </p>
          </div>
        </div>

        {/* Action Controls & Flow Mode Toggle */}
        <div className="flex items-center gap-2">
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>
                {viewMode === 'flow' ? 'Switch to Diagram View' : viewMode === 'diagram' ? 'Switch to Step View' : 'Switch to Continuous Flow'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper Pipeline Flow Visual */}
      <div className="pt-3.5 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[880px] gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = currentStep > step.id || (selectedRepo && step.id <= 5);
            const badgeText = getStepBadge(step.key);

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <button
                  onClick={() => handleStepClick(step)}
                  className={`flex-1 group relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/50'
                      : isCompleted
                      ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-100 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Bar with Number & Icon */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 font-extrabold'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          isCurrent
                            ? 'text-cyan-400 animate-pulse'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      />
                    </div>

                    {badgeText && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded truncate max-w-[85px] ${
                          isCurrent
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                            : isCompleted
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="text-[11px] font-bold truncate text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate leading-tight mt-0.5">
                    {step.description}
                  </div>
                </button>

                {/* Arrow Connector between steps */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="shrink-0 flex items-center justify-center text-slate-600 px-0.5">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
