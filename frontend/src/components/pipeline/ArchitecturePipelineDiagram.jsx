import React, { useState } from 'react';
import {
  GitBranch,
  FileCode2,
  Network,
  GitCommit,
  Activity,
  TestTube2,
  Users,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  ArrowDown,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PIPELINE_NODES = [
  {
    id: 1,
    key: 'git-repo',
    title: 'Git Repository',
    subtitle: 'Source Code & Commits',
    icon: GitBranch,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    badgeText: (ctx) => ctx.selectedRepo ? `${ctx.selectedRepo.name} (${ctx.selectedRepo.branch || 'main'})` : 'No Repo Selected',
    metric: (ctx) => ctx.selectedCommit?.hash ? `Commit: ${ctx.selectedCommit.hash.substring(0, 7)}` : 'HEAD: main'
  },
  {
    id: 2,
    key: 'code-parser',
    title: 'Code Parser',
    subtitle: 'AST & Symbol Extractor',
    icon: FileCode2,
    color: 'from-cyan-500 to-teal-500',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-400',
    bgColor: 'bg-teal-950/40',
    badgeText: (ctx) => ctx.selectedRepo ? `${ctx.selectedRepo.totalFiles || ctx.repositoryMetadata?.totalFiles || 18} Code Files` : 'Ready to Parse',
    metric: (ctx) => ctx.repositoryMetadata?.summary?.totalImports ? `${ctx.repositoryMetadata.summary.totalImports} Imports Parsed` : 'AST Built'
  },
  {
    id: 3,
    key: 'dep-graph',
    title: 'Dependency Graph',
    subtitle: 'Call Hierarchy & Index',
    icon: Network,
    color: 'from-teal-500 to-emerald-500',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    badgeText: (ctx) => ctx.dependencyNodes?.length ? `${ctx.dependencyNodes.length} Nodes • ${ctx.dependencyEdges?.length || 24} Edges` : 'Call Graph',
    metric: () => '0 Circular Cycles'
  },
  {
    id: 4,
    key: 'change-detector',
    title: 'Change Detector',
    subtitle: 'Diff & Modified AST Nodes',
    icon: GitCommit,
    color: 'from-emerald-500 to-amber-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    badgeText: (ctx) => ctx.selectedFile ? (ctx.selectedFile.name || ctx.selectedFile.path?.split('/').pop() || 'CoreService.ts') : 'Pick Changed File',
    metric: (ctx) => ctx.selectedCommit?.files?.[0] ? `+${ctx.selectedCommit.files[0].additions || 42} -${ctx.selectedCommit.files[0].deletions || 12} LOC` : '+42 -12 LOC'
  },
  // The Parallel 3-way Branch (5a, 5b, 5c)
  {
    id: 5,
    key: 'parallel-branch',
    title: 'Parallel Analysis Engines',
    subtitle: 'Concentric Impact • Tests • Teams',
    isBranch: true,
    branches: [
      {
        id: '5a',
        key: 'impact-analysis',
        title: 'Impact Analysis',
        subtitle: 'Concentric Blast Radius',
        icon: Activity,
        borderColor: 'border-rose-500',
        textColor: 'text-rose-400',
        bgColor: 'bg-rose-950/30',
        badgeText: (ctx) => ctx.blastRadiusData ? `${ctx.blastRadiusData.directImpactCount || 4} Direct • ${ctx.blastRadiusData.metrics?.downstreamServicesCount || 3} Downstream` : 'Concentric BFS',
        metric: (ctx) => `${ctx.blastRadiusData?.metrics?.publicEndpointsCount || 2} APIs Exposed`
      },
      {
        id: '5b',
        key: 'tests-analysis',
        title: 'Tests Analysis',
        subtitle: 'Automated Test Selection',
        icon: TestTube2,
        borderColor: 'border-amber-500',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-950/30',
        badgeText: (ctx) => ctx.blastRadiusData?.summary?.testsAnalysis?.testSuites?.length ? `${ctx.blastRadiusData.summary.testsAnalysis.testSuites.length} Test Suites` : '4 Test Suites',
        metric: (ctx) => `${ctx.blastRadiusData?.summary?.testsAnalysis?.p0Count || 2} P0 Blocking`
      },
      {
        id: '5c',
        key: 'teams-analysis',
        title: 'Teams Analysis',
        subtitle: 'CODEOWNERS & Squads',
        icon: Users,
        borderColor: 'border-purple-500',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-950/30',
        badgeText: (ctx) => ctx.blastRadiusData?.summary?.teamsAnalysis?.affectedTeams?.length ? `${ctx.blastRadiusData.summary.teamsAnalysis.affectedTeams.length} Squads Affected` : '3 Squads Affected',
        metric: (ctx) => `${ctx.blastRadiusData?.summary?.teamsAnalysis?.mandatoryReviewersCount || 2} Sign-Offs Required`
      }
    ]
  },
  {
    id: 6,
    key: 'risk-engine',
    title: 'Risk Engine',
    subtitle: 'Multi-Factor Composite Score',
    icon: ShieldAlert,
    color: 'from-amber-500 to-rose-600',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/40',
    badgeText: (ctx) => ctx.blastRadiusData?.overallRiskScore ? `Risk Score: ${ctx.blastRadiusData.overallRiskScore}/100 (${ctx.blastRadiusData.riskLevel || 'HIGH'})` : 'Score: 78/100',
    metric: (ctx) => ctx.blastRadiusData?.summary?.dominantDriver ? `Driver: ${ctx.blastRadiusData.summary.dominantDriver}` : 'High Propagation'
  },
  {
    id: 7,
    key: 'ai-explainer',
    title: 'AI Explainer',
    subtitle: 'Gemini Architectural Synthesis',
    icon: Sparkles,
    color: 'from-rose-500 to-indigo-600',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-400',
    bgColor: 'bg-indigo-950/40',
    badgeText: () => 'Google Gemini 2.5 Flash',
    metric: () => 'Synthesis & Remediation Patch'
  },
  {
    id: 8,
    key: 'web-dashboard',
    title: 'Web Dashboard',
    subtitle: 'Interactive Command Center',
    icon: LayoutDashboard,
    color: 'from-indigo-600 to-cyan-500',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-950/30',
    badgeText: () => 'Live Enterprise Dashboard',
    metric: () => 'End-to-End Verified'
  }
];

export const ArchitecturePipelineDiagram = ({
  activeStep = 1,
  onSelectStep,
  onRunSimulation
}) => {
  const appContext = useApp();
  const [animatingStep, setAnimatingStep] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentStep = activeStep || appContext.currentPipelineStep || 1;

  const handleStepClick = (stepId) => {
    if (onSelectStep) {
      onSelectStep(stepId);
    } else if (appContext.setCurrentPipelineStep) {
      appContext.setCurrentPipelineStep(stepId);
    }
  };

  const handleRunSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    if (onRunSimulation) onRunSimulation();

    // Sequentially activate each step
    for (let s = 1; s <= 8; s++) {
      setAnimatingStep(s);
      if (onSelectStep) onSelectStep(s);
      else if (appContext.setCurrentPipelineStep) appContext.setCurrentPipelineStep(s);
      await new Promise(r => setTimeout(r, 650));
    }

    setAnimatingStep(null);
    setIsSimulating(false);
    appContext.showToast?.('Pipeline executed through all 8 architectural stages successfully!', 'success');
  };

  const isStepCompleted = (stepId) => {
    if (animatingStep) return animatingStep >= stepId;
    return currentStep >= stepId || (appContext.selectedRepo && stepId <= 5);
  };

  const isStepActive = (stepId) => {
    if (animatingStep) return animatingStep === stepId;
    return currentStep === stepId;
  };

  return (
    <div id="architecture-pipeline-flow-diagram" className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header with Title & Simulation Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black tracking-widest uppercase text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
              Architectural Pipeline Flow
            </span>
            <span className="text-xs font-mono text-slate-400">
              Step {currentStep} of 8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual execution trace matching the system architecture from Git Repository to Web Dashboard
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isSimulating
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Execute Step-by-Step Flow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schematic Diagram Layout */}
      <div className="py-6 flex flex-col items-center max-w-2xl mx-auto w-full">
        
        {/* Node 1: Git Repository */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[0]}
            isActive={isStepActive(1)}
            isCompleted={isStepCompleted(1)}
            onClick={() => handleStepClick(1)}
            context={appContext}
          />
        </div>

        {/* Downward Connector */}
        <FlowConnector active={isStepCompleted(1)} />

        {/* Node 2: Code Parser */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[1]}
            isActive={isStepActive(2)}
            isCompleted={isStepCompleted(2)}
            onClick={() => handleStepClick(2)}
            context={appContext}
          />
        </div>

        {/* Downward Connector */}
        <FlowConnector active={isStepCompleted(2)} />

        {/* Node 3: Dependency Graph */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[2]}
            isActive={isStepActive(3)}
            isCompleted={isStepCompleted(3)}
            onClick={() => handleStepClick(3)}
            context={appContext}
          />
        </div>

        {/* Downward Connector */}
        <FlowConnector active={isStepCompleted(3)} />

        {/* Node 4: Change Detector */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[3]}
            isActive={isStepActive(4)}
            isCompleted={isStepCompleted(4)}
            onClick={() => handleStepClick(4)}
            context={appContext}
          />
        </div>

        {/* Tri-Fork Branching Connector */}
        <TriForkConnector active={isStepCompleted(4)} />

        {/* Parallel Branch 5: Impact Analysis | Tests Analysis | Teams Analysis */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
          {PIPELINE_NODES[4].branches.map((branch) => {
            const isBranchActive = currentStep === 5;
            const isBranchCompleted = isStepCompleted(5);

            return (
              <button
                key={branch.id}
                onClick={() => handleStepClick(5)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  isBranchActive
                    ? `${branch.borderColor} bg-slate-900 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30`
                    : isBranchCompleted
                    ? 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${branch.bgColor} ${branch.textColor}`}>
                      <branch.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {branch.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {branch.subtitle}
                      </div>
                    </div>
                  </div>
                  {isBranchCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 truncate max-w-[130px]">
                    {branch.badgeText(appContext)}
                  </span>
                  <span className={`${branch.textColor} text-[10px] font-semibold shrink-0`}>
                    {branch.metric(appContext)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tri-Merge Converging Connector */}
        <TriMergeConnector active={isStepCompleted(5)} />

        {/* Node 6: Risk Engine */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[5]}
            isActive={isStepActive(6)}
            isCompleted={isStepCompleted(6)}
            onClick={() => handleStepClick(6)}
            context={appContext}
          />
        </div>

        {/* Downward Connector */}
        <FlowConnector active={isStepCompleted(6)} />

        {/* Node 7: AI Explainer */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[6]}
            isActive={isStepActive(7)}
            isCompleted={isStepCompleted(7)}
            onClick={() => handleStepClick(7)}
            context={appContext}
          />
        </div>

        {/* Downward Connector */}
        <FlowConnector active={isStepCompleted(7)} />

        {/* Node 8: Web Dashboard */}
        <div className="w-full max-w-md">
          <SchematicNode
            node={PIPELINE_NODES[7]}
            isActive={isStepActive(8)}
            isCompleted={isStepCompleted(8)}
            onClick={() => handleStepClick(8)}
            context={appContext}
          />
        </div>

      </div>

      {/* Step Navigation Bar Footer */}
      <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={() => handleStepClick(Math.max(1, currentStep - 1))}
          disabled={currentStep <= 1}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-medium transition-all cursor-pointer"
        >
          ← Previous Step
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              onClick={() => handleStepClick(s)}
              className={`h-6 w-6 rounded-full text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                currentStep === s
                  ? 'bg-cyan-500 text-slate-950 scale-110 shadow-md shadow-cyan-500/20'
                  : isStepCompleted(s)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleStepClick(Math.min(8, currentStep + 1))}
          disabled={currentStep >= 8}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-40 font-medium transition-all cursor-pointer"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};

// Schematic Box Node Component
const SchematicNode = ({ node, isActive, isCompleted, onClick, context }) => {
  const Icon = node.icon;
  const badge = node.badgeText ? node.badgeText(context) : null;
  const metric = node.metric ? node.metric(context) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
        isActive
          ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500/40'
          : isCompleted
          ? 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600'
          : 'bg-slate-950/40 border-slate-800/80 opacity-70 hover:opacity-100 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg shrink-0 transition-colors ${
              isActive
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : isCompleted
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {node.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Step {node.id}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {node.subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && !isActive && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Live Node Metric Bar */}
      {(badge || metric) && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-300 truncate max-w-[240px]">
            {badge}
          </span>
          {metric && (
            <span className="text-cyan-400 text-[10px] font-semibold shrink-0">
              {metric}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

// Straight Down Flow Connector with animated pulse
const FlowConnector = ({ active }) => (
  <div className="flex flex-col items-center my-1 relative h-6">
    <div
      className={`w-0.5 h-full transition-colors duration-300 ${
        active
          ? 'bg-gradient-to-b from-cyan-500 to-emerald-500'
          : 'bg-slate-800'
      }`}
    />
    <ArrowDown
      className={`h-3 w-3 absolute -bottom-1 ${
        active ? 'text-emerald-400 animate-bounce' : 'text-slate-700'
      }`}
    />
  </div>
);

// Tri-Fork Connector (Splitting from Change Detector into Impact, Tests, Teams)
const TriForkConnector = ({ active }) => (
  <div className="w-full flex flex-col items-center my-2">
    {/* Center stem down */}
    <div className={`w-0.5 h-3 ${active ? 'bg-amber-400' : 'bg-slate-800'}`} />
    
    {/* Horizontal split bar */}
    <div className="w-full max-w-lg relative flex items-center justify-between">
      <div className={`h-0.5 w-full ${active ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-purple-500' : 'bg-slate-800'}`} />
    </div>

    {/* 3 downward arrows into parallel columns */}
    <div className="w-full max-w-lg flex items-center justify-between px-8 sm:px-16 pt-1">
      <ArrowDown className={`h-3.5 w-3.5 ${active ? 'text-rose-400' : 'text-slate-700'}`} />
      <ArrowDown className={`h-3.5 w-3.5 ${active ? 'text-amber-400' : 'text-slate-700'}`} />
      <ArrowDown className={`h-3.5 w-3.5 ${active ? 'text-purple-400' : 'text-slate-700'}`} />
    </div>
  </div>
);

// Tri-Merge Connector (Converging from Impact, Tests, Teams into Risk Engine)
const TriMergeConnector = ({ active }) => (
  <div className="w-full flex flex-col items-center my-2">
    {/* 3 downward arrows out of parallel columns */}
    <div className="w-full max-w-lg flex items-center justify-between px-8 sm:px-16 pb-1">
      <div className={`w-0.5 h-2.5 ${active ? 'bg-rose-500' : 'bg-slate-800'}`} />
      <div className={`w-0.5 h-2.5 ${active ? 'bg-amber-500' : 'bg-slate-800'}`} />
      <div className={`w-0.5 h-2.5 ${active ? 'bg-purple-500' : 'bg-slate-800'}`} />
    </div>

    {/* Horizontal converge bar */}
    <div className="w-full max-w-lg relative flex items-center justify-between">
      <div className={`h-0.5 w-full ${active ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-purple-500' : 'bg-slate-800'}`} />
    </div>

    {/* Center stem down to Risk Engine */}
    <div className={`w-0.5 h-3 ${active ? 'bg-rose-500' : 'bg-slate-800'}`} />
    <ArrowDown className={`h-3 w-3 ${active ? 'text-rose-400 animate-bounce' : 'text-slate-700'}`} />
  </div>
);
