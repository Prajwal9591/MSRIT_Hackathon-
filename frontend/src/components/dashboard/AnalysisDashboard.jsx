import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProcessingRepositorySkeleton } from '../common/Skeleton';
import { EmptyOrInvalidStructureCard } from '../common/EmptyOrInvalidStructureCard';

// Redesigned Overview Dashboard Modules
import { DashboardOverviewHeader } from './DashboardOverviewHeader';
import { DashboardMetricCards } from './DashboardMetricCards';
import { DependencyCallGraphCard } from './DependencyCallGraphCard';
import { ChangeImpactAnalysisCard } from './ChangeImpactAnalysisCard';
import { TechnologyStackCard } from './TechnologyStackCard';
import { CodeQualityCard } from './CodeQualityCard';
import { SecurityScanCard } from './SecurityScanCard';
import { KeyFilesCard } from './KeyFilesCard';
import { AIInsightsCard } from './AIInsightsCard';
import { RecentActivityCard } from './RecentActivityCard';

/**
 * AnalysisDashboard
 *
 * Exact replication of the high-density DevSecOps & AST Impact Analysis overview interface.
 * Implements the 6 primary structural tiers:
 * 1. Authority Repository Header with GitHub branding & sync telemetry
 * 2. 4-column metric score cards (Overall Health, Security, Maintainability, Risk)
 * 3. 2-column interactive section: Dependency & Call Graph + Change Impact Analysis
 * 4. 3-column analysis row: Technology Stack + Code Quality Gauge + Security Scan
 * 5. 2-column intelligence row: Key Files Risk Table + AI Refactoring & Test Insights
 * 6. Full-width Recent Activity audit timeline
 */
export const AnalysisDashboard = () => {
  const {
    selectedRepo,
    repositoryMetadata,
    setActiveTab,
    runAnalysis,
    isAnalyzing,
    analysisStep,
    analysisProgress
  } = useApp();

  // Normalized repository metadata matching the image
  const effectiveMetadata = repositoryMetadata || selectedRepo || {};
  const repoName = selectedRepo?.name || effectiveMetadata.repositoryName || 'AI-Powered-Real-Time-Arbitrage-Detection-Engine';
  const repoOwner = selectedRepo?.owner || 'Prajwal-S-45';
  const defaultBranch = selectedRepo?.branch || effectiveMetadata.branch || 'main';
  const branches = selectedRepo?.branches || ['main', 'develop', 'feat/arbitrage-pipeline', 'fix/slippage-thresholds'];
  const visibility = selectedRepo?.visibility || 'Public';
  const description = selectedRepo?.description || 'Real-time arbitrage detection using AI with smart contracts and market data analysis.';
  const commitsCount = selectedRepo?.commitsCount || 42;
  const totalFiles = selectedRepo?.fileCount || effectiveMetadata.totalFiles || 100;
  const contributorsCount = selectedRepo?.contributorsCount || 18;
  const lastUpdated = selectedRepo?.lastUpdated || '2 hours ago';

  // Metrics from repo or fallback to exact image scores
  const healthScore = selectedRepo?.healthScore || 88;
  const securityScore = selectedRepo?.securityScore || 92;
  const maintainabilityScore = selectedRepo?.maintainabilityScore || 85;
  const riskScore = typeof selectedRepo?.riskScore === 'number' ? selectedRepo.riskScore : 15;

  // If analyzing, render processing skeleton
  if (isAnalyzing) {
    return (
      <ProcessingRepositorySkeleton
        repoName={repoName}
        step={analysisStep}
        progress={analysisProgress}
      />
    );
  }

  // If no repository is selected or ingested yet, render empty state
  if (!selectedRepo && !repositoryMetadata) {
    return (
      <EmptyOrInvalidStructureCard
        customType="empty_repo"
        customTitle="No Repository Ingested Yet"
        customMessage="Upload a repository archive, select a local codebase folder, or connect a remote GitHub repository to view repository overview, tech stack, dependency call graphs, and blast radius telemetry."
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12" id="dashboard-overview-container">
      {/* -----------------------------------------------------
          1. Repository Overview Header Banner
          ----------------------------------------------------- */}
      <DashboardOverviewHeader
        repoName={repoName}
        repoOwner={repoOwner}
        visibility={visibility}
        description={description}
        branch={defaultBranch}
        branches={branches}
        commitsCount={commitsCount}
        totalFiles={totalFiles}
        contributorsCount={contributorsCount}
        lastUpdated={lastUpdated}
        onSyncLatest={() => {
          if (selectedRepo?.id) runAnalysis(selectedRepo.id);
        }}
        onBranchChange={(_newBranch) => {
          // branch switched
        }}
      />

      {/* -----------------------------------------------------
          2. Top 4 Metric Cards
          (Overall Health, Security Score, Maintainability, Risk Score)
          ----------------------------------------------------- */}
      <DashboardMetricCards
        healthScore={healthScore}
        securityScore={securityScore}
        maintainabilityScore={maintainabilityScore}
        riskScore={riskScore}
      />

      {/* -----------------------------------------------------
          3. Middle Section: Dependency & Call Graph + Change Impact Analysis
          ----------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6" id="graph-and-impact-grid">
        {/* Left: Dependency & Call Graph (7 cols on XL) */}
        <div className="xl:col-span-7">
          <DependencyCallGraphCard className="h-full" />
        </div>

        {/* Right: Change Impact Analysis (5 cols on XL) */}
        <div className="xl:col-span-5">
          <ChangeImpactAnalysisCard
            className="h-full"
            onViewDetails={() => setActiveTab('analysis-results')}
          />
        </div>
      </div>

      {/* -----------------------------------------------------
          4. 3-Card Row: Technology Stack + Code Quality + Security Scan
          ----------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6" id="tech-quality-security-grid">
        <TechnologyStackCard className="h-full" />
        <CodeQualityCard className="h-full" />
        <SecurityScanCard className="h-full" />
      </div>

      {/* -----------------------------------------------------
          5. 2-Card Row: Key Files Table + AI Insights
          ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6" id="keyfiles-aiinsights-grid">
        <KeyFilesCard className="h-full" />
        <AIInsightsCard className="h-full" />
      </div>

      {/* -----------------------------------------------------
          6. Bottom Section: Recent Activity (Full Width)
          ----------------------------------------------------- */}
      <RecentActivityCard />
    </div>
  );
};

