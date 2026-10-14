import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Download,
  RefreshCw,
  ArrowDown,
  FolderUp,
  ArrowRight,
  ArrowLeft,
  Workflow,
  Layers,
  ListOrdered,
  TestTube2,
  Users,
  GitBranch,
  GitFork,
  LayoutDashboard
} from 'lucide-react';
import { PipelineFlowBar, PIPELINE_STEPS } from '../components/pipeline/PipelineFlowBar';
import { ArchitecturePipelineDiagram } from '../components/pipeline/ArchitecturePipelineDiagram';
import { RepositoryAnalysisCard } from '../components/analysis/RepositoryAnalysisCard';
import { DependencyIndexCard } from '../components/analysis/DependencyIndexCard';
import { CommitSelector } from '../components/change-selection/CommitSelector';
import { BlastRadiusCard } from '../components/analysis/BlastRadiusCard';
import { DependencyGraph } from '../components/analysis/DependencyGraph';
import { TestsAnalysisCard } from '../components/analysis/TestsAnalysisCard';
import { TeamsAnalysisCard } from '../components/analysis/TeamsAnalysisCard';
import { SecurityAuditCard } from '../components/analysis/SecurityAuditCard';
import { AIExplanationCard } from '../components/analysis/AIExplanationCard';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProcessingRepositorySkeleton } from '../components/common/Skeleton';
import { EmptyOrInvalidStructureCard } from '../components/common/EmptyOrInvalidStructureCard';
import { IngestionStatusIndicator } from '../components/common/IngestionStatusIndicator';

export const AnalysisResultsPage = () => {
  const {
    runAnalysis,
    isAnalyzing,
    analysisStep,
    analysisProgress,
    selectedRepo,
    repositoryMetadata,
    selectChangedFile,
    blastRadiusData,
    dependencyNodes,
    ingestionStatus,
    currentPipelineStep,
    setCurrentPipelineStep,
    advancePipelineStep,
    regressPipelineStep,
    activeParallelTab,
    setActiveTab,
    showToast
  } = useApp();

  // View modes: 'diagram' (Visual Flow matching prompt) | 'step' (Step-by-step walkthrough) | 'flow' (Continuous cascade)
  const [viewMode, setViewMode] = useState('diagram');
  const [parallelSubTab, setParallelSubTab] = useState(activeParallelTab || 'all'); // 'all' | 'impact' | 'tests' | 'teams'

  if (isAnalyzing) {
    return (
      <ProcessingRepositorySkeleton
        repoName={selectedRepo?.name || 'Repository'}
        step={analysisStep}
        progress={analysisProgress}
      />
    );
  }

  // Handle completely unselected repository
  if (!selectedRepo) {
    return (
      <EmptyOrInvalidStructureCard
        customType="empty_repo"
        customTitle="No Repository Selected"
        customMessage="Upload or select a repository to execute the 8-step connected architectural pipeline from Git Repository to Web Dashboard."
      />
    );
  }

  // Handle Empty Repository (0 Files), Non-Code Data Repos, or Zero Graph Nodes
  const isZeroFiles = selectedRepo?.totalFiles === 0 || repositoryMetadata?.totalFiles === 0 || repositoryMetadata?.isEmpty;
  const isNonCode = selectedRepo?.isNonCodeRepo || repositoryMetadata?.isNonCodeRepo || selectedRepo?.hasSourceCode === false;
  const isEmptyGraph = (dependencyNodes?.length === 0 || !dependencyNodes) && (blastRadiusData?.overallRiskScore === 0 || !blastRadiusData);

  if (isZeroFiles || isNonCode || (isEmptyGraph && isZeroFiles)) {
    return (
      <EmptyOrInvalidStructureCard
        repo={selectedRepo}
        metadata={repositoryMetadata}
      />
    );
  }

  const handleExportAll = () => {
    if (ingestionStatus?.isStale) {
      showToast('Please re-run ingestion sync before exporting to avoid saving stale blast radius data.', 'warning');
      return;
    }
    showToast('Exported complete 8-Step Architectural Audit & Blast Radius Report (PDF/JSON)', 'success');
  };

  // Section Downward Connector Component for Flow View
  const DownwardConnector = ({ toStep, label }) => (
    <div className="flex flex-col items-center justify-center my-6 relative">
      <div className="h-7 w-0.5 bg-gradient-to-b from-cyan-500/80 via-indigo-500/80 to-cyan-500/80" />
      <button
        onClick={() => {
          setCurrentPipelineStep(toStep);
          const el = document.getElementById(`step-${toStep}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-md shadow-cyan-500/10 hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer"
      >
        <ArrowDown className="h-3 w-3 text-cyan-400 animate-bounce" />
        <span>{label || `Proceed to Step ${toStep}`}</span>
      </button>
      <div className="h-7 w-0.5 bg-gradient-to-b from-cyan-500/80 via-indigo-500/80 to-cyan-500/80" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Action & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Workflow className="h-6 w-6 text-cyan-400" />
              End-to-End Architectural Pipeline
            </h2>
            <Badge variant="info" className="text-xs font-mono">
              8 Sequential Stages
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Git Repository → Code Parser → Dependency Graph → Change Detector → [Impact | Tests | Teams] → Risk Engine → AI Explainer → Web Dashboard
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'diagram'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>Flow Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('step')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'step'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Step Walkthrough</span>
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'flow'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Full Cascade</span>
            </button>
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} loading={isAnalyzing} onClick={() => runAnalysis()}>
            Re-run
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportAll}>
            Export
          </Button>
        </div>
      </div>

      {/* Ingestion Status Progress Banner */}
      <IngestionStatusIndicator variant="banner" />

      {/* Unified 8-Step Interactive Pipeline Flow Bar */}
      <PipelineFlowBar
        currentStep={currentPipelineStep}
        onSelectStep={(stepId) => setCurrentPipelineStep(stepId)}
        viewMode={viewMode}
        onToggleViewMode={() => {
          setViewMode(prev => prev === 'diagram' ? 'step' : prev === 'step' ? 'flow' : 'diagram');
        }}
      />

      {/* ========================================================================= */}
      {/* VIEW MODE 1: ARCHITECTURAL FLOW DIAGRAM (Exact ASCII diagram visualized)  */}
      {/* ========================================================================= */}
      {viewMode === 'diagram' && (
        <div className="space-y-6">
          <ArchitecturePipelineDiagram
            activeStep={currentPipelineStep}
            onSelectStep={(stepId) => setCurrentPipelineStep(stepId)}
          />

          {/* Quick Inspector for Currently Active Selected Step */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black font-mono uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Active Stage Inspector
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  Step {currentPipelineStep}: {PIPELINE_STEPS.find(s => s.id === currentPipelineStep)?.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {currentPipelineStep > 1 && (
                  <button
                    onClick={() => regressPipelineStep()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                    title="Return to previous pipeline step"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Previous Step</span>
                  </button>
                )}
                {currentPipelineStep < 8 && (
                  <button
                    onClick={() => advancePipelineStep()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 transition-all cursor-pointer"
                    title="Advance to next pipeline step"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                  </button>
                )}
                <button
                  onClick={() => setViewMode(viewMode === 'step' ? 'diagram' : 'step')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer ml-1"
                >
                  <span>{viewMode === 'step' ? 'Flow Diagram' : 'Full Step View'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content for inspected step */}
            {currentPipelineStep === 1 && (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">{selectedRepo.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Branch: <strong className="text-cyan-400 font-mono">{selectedRepo.branch || 'main'}</strong> • {selectedRepo.totalFiles || 18} Files • Primary: {selectedRepo.language || 'TypeScript'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('upload')}>
                    Switch Repository
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setCurrentPipelineStep(2)}>
                    Next: Code Parser →
                  </Button>
                </div>
              </div>
            )}

            {currentPipelineStep === 2 && (
              <RepositoryAnalysisCard onNextStep={() => setCurrentPipelineStep(3)} />
            )}

            {currentPipelineStep === 3 && (
              <DependencyIndexCard
                onNextStep={() => setCurrentPipelineStep(4)}
                onSelectFileForBlast={(filePath) => {
                  selectChangedFile(filePath);
                  setCurrentPipelineStep(5);
                }}
              />
            )}

            {currentPipelineStep === 4 && (
              <CommitSelector onNextStep={() => setCurrentPipelineStep(5)} />
            )}

            {currentPipelineStep === 5 && (
              <div className="space-y-4">
                {/* Tri-branch switcher tabs inside Step 5 */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
                  <button
                    onClick={() => setParallelSubTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      parallelSubTab === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All 3 Parallel Engines
                  </button>
                  <button
                    onClick={() => setParallelSubTab('impact')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      parallelSubTab === 'impact'
                        ? 'bg-rose-500 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Impact Analysis</span>
                  </button>
                  <button
                    onClick={() => setParallelSubTab('tests')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      parallelSubTab === 'tests'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TestTube2 className="h-3.5 w-3.5" />
                    <span>Tests Analysis</span>
                  </button>
                  <button
                    onClick={() => setParallelSubTab('teams')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      parallelSubTab === 'teams'
                        ? 'bg-purple-500 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Teams Analysis</span>
                  </button>
                </div>

                {/* Sub-tab view */}
                {(parallelSubTab === 'all' || parallelSubTab === 'impact') && (
                  <div className="space-y-4">
                    <BlastRadiusCard onNextStep={() => setCurrentPipelineStep(6)} />
                    <DependencyGraph />
                  </div>
                )}
                {(parallelSubTab === 'all' || parallelSubTab === 'tests') && (
                  <TestsAnalysisCard testsData={blastRadiusData?.summary?.testsAnalysis} repoName={selectedRepo.name} />
                )}
                {(parallelSubTab === 'all' || parallelSubTab === 'teams') && (
                  <TeamsAnalysisCard teamsData={blastRadiusData?.summary?.teamsAnalysis} repoName={selectedRepo.name} />
                )}
              </div>
            )}

            {currentPipelineStep === 6 && (
              <SecurityAuditCard onNextStep={() => setCurrentPipelineStep(7)} />
            )}

            {currentPipelineStep === 7 && (
              <AIExplanationCard />
            )}

            {currentPipelineStep === 8 && (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 text-center space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 inline-block">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Web Dashboard & Master Enterprise Command Center
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  The final destination of the pipeline. All 7 prior stages (Git Repo, Code Parser, Dependency Graph, Change Detector, Impact, Tests, Teams, Risk Engine, and AI Explainer) aggregate into the responsive executive dashboard.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="primary" size="md" icon={LayoutDashboard} onClick={() => setActiveTab('dashboard')}>
                    Open Live Web Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: STEP-BY-STEP GUIDED WALKTHROUGH (Focuses on 1 step at a time)*/}
      {/* ========================================================================= */}
      {viewMode === 'step' && (
        <div className="space-y-6">
          {/* Step Navigation Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              disabled={currentPipelineStep <= 1}
              onClick={regressPipelineStep}
            >
              Previous Step
            </Button>

            <div className="text-center">
              <span className="text-xs font-bold text-cyan-400 font-mono block">
                STEP {currentPipelineStep} OF 8: {PIPELINE_STEPS.find(s => s.id === currentPipelineStep)?.title}
              </span>
              <span className="text-[11px] text-slate-400">
                {PIPELINE_STEPS.find(s => s.id === currentPipelineStep)?.description}
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              disabled={currentPipelineStep >= 8}
              onClick={advancePipelineStep}
            >
              Next Step
            </Button>
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPipelineStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentPipelineStep === 1 && (
                <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-center">
                  <FolderUp className="h-10 w-10 text-cyan-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-100">Step 1: Git Repository</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Active repository: <strong className="text-cyan-300 font-mono">{selectedRepo.name}</strong> with branch <strong className="text-slate-200 font-mono">{selectedRepo.branch || 'main'}</strong> ingested.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('upload')}>
                      Upload / Switch Repository
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setCurrentPipelineStep(2)}>
                      Proceed to Step 2: Code Parser →
                    </Button>
                  </div>
                </div>
              )}

              {currentPipelineStep === 2 && (
                <RepositoryAnalysisCard onNextStep={() => setCurrentPipelineStep(3)} />
              )}

              {currentPipelineStep === 3 && (
                <DependencyIndexCard
                  onNextStep={() => setCurrentPipelineStep(4)}
                  onSelectFileForBlast={(filePath) => {
                    selectChangedFile(filePath);
                    setCurrentPipelineStep(5);
                  }}
                />
              )}

              {currentPipelineStep === 4 && (
                <CommitSelector onNextStep={() => setCurrentPipelineStep(5)} />
              )}

              {currentPipelineStep === 5 && (
                <div className="space-y-5">
                  {/* Step 5 Banner explaining the 3 parallel branches */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-amber-950/30 to-purple-950/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <GitFork className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">
                          Parallel Analysis Stage: Impact • Tests • Teams
                        </div>
                        <p className="text-xs text-slate-400">
                          Concurrent analysis executing across concentric blast radius, targeted regression tests, and CODEOWNERS squads.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setParallelSubTab('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          parallelSubTab === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setParallelSubTab('impact')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          parallelSubTab === 'impact' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Impact
                      </button>
                      <button
                        onClick={() => setParallelSubTab('tests')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          parallelSubTab === 'tests' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Tests
                      </button>
                      <button
                        onClick={() => setParallelSubTab('teams')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          parallelSubTab === 'teams' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Teams
                      </button>
                    </div>
                  </div>

                  {(parallelSubTab === 'all' || parallelSubTab === 'impact') && (
                    <div className="space-y-4">
                      <BlastRadiusCard onNextStep={() => setCurrentPipelineStep(6)} />
                      <DependencyGraph />
                    </div>
                  )}

                  {(parallelSubTab === 'all' || parallelSubTab === 'tests') && (
                    <TestsAnalysisCard testsData={blastRadiusData?.summary?.testsAnalysis} repoName={selectedRepo.name} />
                  )}

                  {(parallelSubTab === 'all' || parallelSubTab === 'teams') && (
                    <TeamsAnalysisCard teamsData={blastRadiusData?.summary?.teamsAnalysis} repoName={selectedRepo.name} />
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button variant="primary" size="sm" onClick={() => setCurrentPipelineStep(6)}>
                      Proceed to Step 6: Risk Engine →
                    </Button>
                  </div>
                </div>
              )}

              {currentPipelineStep === 6 && (
                <SecurityAuditCard onNextStep={() => setCurrentPipelineStep(7)} />
              )}

              {currentPipelineStep === 7 && (
                <AIExplanationCard />
              )}

              {currentPipelineStep === 8 && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 text-center space-y-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 inline-block">
                    <LayoutDashboard className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Step 8: Web Dashboard
                  </h3>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    Pipeline successfully completed. Transition to the full enterprise dashboard for live monitoring, team collaboration, and exportable reports.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Button variant="primary" size="md" icon={LayoutDashboard} onClick={() => setActiveTab('dashboard')}>
                      Launch Web Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: CONTINUOUS CASCADE FLOW (All 8 Steps Connected Seamlessly ↓)  */}
      {/* ========================================================================= */}
      {viewMode === 'flow' && (
        <div className="space-y-3">
          {/* STEP 1: Git Repository */}
          <div
            id="step-1"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GitBranch className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    STEP 1 OF 8
                  </span>
                  <h3 className="text-base font-bold text-slate-100">Git Repository</h3>
                  <Badge variant="success" className="text-[10px]">Active & Ingested</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Codebase archive <strong className="text-slate-200 font-mono">{selectedRepo.name}</strong> ingested ({selectedRepo.branch || 'main'} branch)
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setActiveTab('upload')}>
              Switch Repository
            </Button>
          </div>

          <DownwardConnector toStep={2} label="↓ STEP 2: Code Parser" />

          {/* STEP 2: Code Parser */}
          <div id="step-2">
            <RepositoryAnalysisCard onNextStep={() => setCurrentPipelineStep(3)} />
          </div>

          <DownwardConnector toStep={3} label="↓ STEP 3: Dependency Graph" />

          {/* STEP 3: Dependency Graph */}
          <div id="step-3">
            <DependencyIndexCard
              onNextStep={() => setCurrentPipelineStep(4)}
              onSelectFileForBlast={(filePath) => {
                selectChangedFile(filePath);
                setCurrentPipelineStep(5);
              }}
            />
          </div>

          <DownwardConnector toStep={4} label="↓ STEP 4: Change Detector" />

          {/* STEP 4: Change Detector */}
          <div id="step-4">
            <CommitSelector onNextStep={() => setCurrentPipelineStep(5)} />
          </div>

          {/* Tri-Fork Branching Header for Step 5 */}
          <div className="my-6 text-center">
            <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-cyan-500 mx-auto" />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 shadow-lg">
              <GitFork className="h-4 w-4 text-amber-400" />
              <span>↓ STEP 5: Parallel Analysis (Impact • Tests • Teams)</span>
            </div>
            <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-purple-500 mx-auto" />
          </div>

          {/* STEP 5: Parallel Analysis (Impact • Tests • Teams) */}
          <div id="step-5" className="space-y-6">
            {/* Impact Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <Activity className="h-4 w-4" />
                <span>5A. Impact Analysis & Blast Radius</span>
              </div>
              <BlastRadiusCard onNextStep={() => setCurrentPipelineStep(6)} />
              <DependencyGraph />
            </div>

            {/* Tests Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <TestTube2 className="h-4 w-4" />
                <span>5B. Tests Analysis & Automated Test Selection</span>
              </div>
              <TestsAnalysisCard testsData={blastRadiusData?.summary?.testsAnalysis} repoName={selectedRepo.name} />
            </div>

            {/* Teams Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <Users className="h-4 w-4" />
                <span>5C. Teams Analysis & CODEOWNERS Boundary</span>
              </div>
              <TeamsAnalysisCard teamsData={blastRadiusData?.summary?.teamsAnalysis} repoName={selectedRepo.name} />
            </div>
          </div>

          <DownwardConnector toStep={6} label="↓ STEP 6: Risk Engine" />

          {/* STEP 6: Risk Engine */}
          <div id="step-6">
            <SecurityAuditCard onNextStep={() => setCurrentPipelineStep(7)} />
          </div>

          <DownwardConnector toStep={7} label="↓ STEP 7: AI Explainer" />

          {/* STEP 7: AI Explainer */}
          <div id="step-7">
            <AIExplanationCard />
          </div>

          <DownwardConnector toStep={8} label="↓ STEP 8: Web Dashboard" />

          {/* STEP 8: Web Dashboard */}
          <div id="step-8" className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 text-center space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 inline-block">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Step 8: Web Dashboard
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              All 7 prior pipeline stages have completed. Launch the enterprise command center for live telemetry and health monitoring.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" size="md" icon={LayoutDashboard} onClick={() => setActiveTab('dashboard')}>
                Launch Web Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
