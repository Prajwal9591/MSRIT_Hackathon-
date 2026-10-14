import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FolderX,
  UploadCloud,
  RefreshCw,
  GitBranch,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Terminal,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * Supported Language Templates and Recommended Project Layouts
 */
const SUPPORTED_LANGUAGE_GUIDES = [
  {
    language: 'TypeScript / JavaScript',
    exts: ['.ts', '.tsx', '.js', '.jsx'],
    manifest: 'package.json',
    entryPoint: 'src/index.ts, src/main.tsx, or server.js',
    structure: `my-app/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── controllers/
    └── services/`
  },
  {
    language: 'Python',
    exts: ['.py'],
    manifest: 'pyproject.toml or requirements.txt',
    entryPoint: 'main.py, app.py, or src/__init__.py',
    structure: `python-service/
├── pyproject.toml
├── requirements.txt
└── app/
    ├── main.py
    ├── routes/
    └── models/`
  },
  {
    language: 'Go',
    exts: ['.go'],
    manifest: 'go.mod',
    entryPoint: 'main.go or cmd/server/main.go',
    structure: `go-backend/
├── go.mod
├── go.sum
├── main.go
└── internal/
    ├── handlers/
    └── storage/`
  },
  {
    language: 'Rust',
    exts: ['.rs'],
    manifest: 'Cargo.toml',
    entryPoint: 'src/main.rs or src/lib.rs',
    structure: `rust-crate/
├── Cargo.toml
└── src/
    ├── main.rs
    └── lib.rs`
  },
  {
    language: 'Java / Kotlin',
    exts: ['.java', '.kt'],
    manifest: 'pom.xml or build.gradle',
    entryPoint: 'src/main/java/**/Application.java',
    structure: `java-app/
├── pom.xml
└── src/
    └── main/
        └── java/com/example/
            └── Application.java`
  }
];

/**
 * Comprehensive 'Repository Empty' & 'Invalid Structure' UI Component
 * Provides clear diagnostic feedback, structural validation checklist,
 * supported language templates, and actionable remediation steps
 * instead of displaying generic static fallback data.
 */
export const EmptyOrInvalidStructureCard = ({
  repo = null,
  metadata = null,
  customType = null, // 'empty_repo' | 'invalid_structure' | 'empty_graph' | 'non_code_assets'
  customTitle = null,
  customMessage = null,
  compact = false,
  showActions = true,
  onRetry = null
}) => {
  const {
    selectedRepo,
    repositoryMetadata,
    setActiveTab,
    runAnalysis,
    isAnalyzing,
    showToast
  } = useApp();

  const [activeGuideTab, setActiveGuideTab] = useState('steps'); // 'steps' | 'languages' | 'diagnostic'
  const [selectedLangIdx, setSelectedLangIdx] = useState(0);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const targetRepo = repo || selectedRepo;
  const targetMeta = metadata || repositoryMetadata;

  const repoName = targetRepo?.name || targetMeta?.repositoryName || 'Repository';
  const branchName = targetRepo?.branch || targetMeta?.branch || 'main';
  const totalFiles = targetRepo?.totalFiles ?? targetRepo?.fileCount ?? targetMeta?.totalFiles ?? 0;

  // Determine State Category
  const diagnosis = useMemo(() => {
    if (customType) {
      return customType;
    }

    const isEmpty = totalFiles === 0 || targetMeta?.isEmpty || targetRepo?.isEmpty;
    if (isEmpty) {
      return 'empty_repo';
    }

    const isNonCode = Boolean(
      targetRepo?.isNonCodeRepo ||
      targetMeta?.isNonCodeRepo ||
      targetRepo?.hasSourceCode === false ||
      targetMeta?.hasSourceCode === false
    );
    if (isNonCode) {
      return 'non_code_assets';
    }

    const hasManifest = Boolean(
      targetMeta?.techStack?.packageManager &&
      !targetMeta.techStack.packageManager.startsWith('None')
    );

    const hasModules = Boolean(targetMeta?.projectStructure?.modules > 0 || targetMeta?.projectStructure?.controllers > 0);

    if (!hasManifest && !hasModules && totalFiles < 3) {
      return 'invalid_structure';
    }

    return 'empty_graph';
  }, [customType, totalFiles, targetMeta, targetRepo]);

  // Configurations per diagnosis state
  const stateConfig = useMemo(() => {
    switch (diagnosis) {
      case 'empty_repo':
        return {
          icon: FolderX,
          badgeVariant: 'warning',
          badgeText: 'Empty Codebase (0 Files)',
          title: customTitle || 'Repository is Empty',
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/10',
          description:
            customMessage ||
            `Repository '${repoName}' contains 0 files and 0 commits. AST call-graph traversal, concentric blast radius modeling, and AI risk remediation require source code files to parse.`,
          recommendation:
            'Upload a source code directory, drag & drop a ZIP archive, or push code commits to this repository branch.'
        };
      case 'non_code_assets':
        return {
          icon: FileText,
          badgeVariant: 'info',
          badgeText: 'Non-Code Asset Repository',
          title: customTitle || 'Non-Code Asset Repository Detected',
          accentColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          bgColor: 'bg-cyan-500/10',
          description:
            customMessage ||
            `Repository '${repoName}' consists of reporting, spreadsheet, or media assets (${targetMeta?.nonCodeType || 'Power BI / Excel / Assets'}) with no recognized software code files.`,
          recommendation:
            'Connect or upload an application repository containing JavaScript, TypeScript, Python, Go, Java, Rust, or C++ source code to analyze code blast radius.'
        };
      case 'invalid_structure':
        return {
          icon: AlertTriangle,
          badgeVariant: 'critical',
          badgeText: 'Missing Project Structure',
          title: customTitle || 'Unrecognized Project Structure & Missing Manifest',
          accentColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgColor: 'bg-rose-500/10',
          description:
            customMessage ||
            `The analyzer could not detect a valid build manifest (e.g. package.json, pyproject.toml, go.mod, Cargo.toml) or standard source folder structure in '${repoName}'.`,
          recommendation:
            'Ensure your project includes a manifest file in the root or a standard source folder (such as src/, app/, or lib/) so our AST engine can resolve dependencies.'
        };
      case 'empty_graph':
      default:
        return {
          icon: Layers,
          badgeVariant: 'warning',
          badgeText: 'Zero AST Nodes Extracted',
          title: customTitle || 'Zero Dependency Call-Graph Nodes Found',
          accentColor: 'text-indigo-400',
          borderColor: 'border-indigo-500/30',
          bgColor: 'bg-indigo-500/10',
          description:
            customMessage ||
            `The AST parser completed the lexical scan of '${repoName}', but extracted 0 function callers, downstream APIs, or inter-module dependencies for this commit diff.`,
          recommendation:
            'Select a commit diff with modified function declarations, or check that your source files export callable symbols.'
        };
    }
  }, [diagnosis, customTitle, customMessage, repoName, targetMeta]);

  // Diagnostic Validation Criteria
  const diagnosticChecks = useMemo(() => {
    const isZero = totalFiles === 0;
    const isNonCode = targetMeta?.isNonCodeRepo || targetRepo?.isNonCodeRepo;
    const hasSource = !isZero && !isNonCode;
    const hasManifest = Boolean(
      targetMeta?.techStack?.packageManager &&
      !targetMeta.techStack.packageManager.startsWith('None')
    );
    const hasAST = hasSource && targetMeta?.readinessChecklist?.astParserReady;

    return [
      {
        id: 'files',
        name: 'Source Code Files Ingested',
        status: isZero ? 'failed' : isNonCode ? 'warning' : 'passed',
        detail: isZero
          ? '0 files found'
          : isNonCode
          ? `${totalFiles} non-code data assets found`
          : `${totalFiles} valid source file(s) scanned`
      },
      {
        id: 'manifest',
        name: 'Project Manifest Detected',
        status: hasManifest ? 'passed' : 'warning',
        detail: hasManifest
          ? targetMeta?.techStack?.packageManager
          : 'No package.json, go.mod, or pyproject.toml detected'
      },
      {
        id: 'ast',
        name: 'AST Symbol & Function Lexer',
        status: hasAST ? 'passed' : 'failed',
        detail: hasAST ? 'AST parser ready' : 'Zero symbol declarations parsed'
      },
      {
        id: 'graph',
        name: 'Concentric Blast Radius Graph',
        status: diagnosis === 'empty_graph' ? 'warning' : isZero ? 'failed' : 'passed',
        detail: isZero || isNonCode ? '0 caller/callee relationships' : 'Empty dependency tree'
      }
    ];
  }, [totalFiles, targetMeta, targetRepo, diagnosis]);

  const handleCopyTemplate = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    showToast('Copied project structure template to clipboard', 'info');
  };

  const IconComponent = stateConfig.icon;

  if (compact) {
    return (
      <div
        id="empty-or-invalid-structure-compact"
        className={`p-6 rounded-3xl bg-slate-900/90 border ${stateConfig.borderColor} space-y-4 shadow-xl text-center`}
      >
        <div
          className={`h-12 w-12 mx-auto rounded-2xl ${stateConfig.bgColor} border ${stateConfig.borderColor} flex items-center justify-center`}
        >
          <IconComponent className={`h-6 w-6 ${stateConfig.accentColor}`} />
        </div>
        <div className="space-y-1">
          <Badge variant={stateConfig.badgeVariant} className="text-[10px] font-mono">
            {stateConfig.badgeText}
          </Badge>
          <h4 className="text-sm font-bold text-slate-100 mt-1">{stateConfig.title}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {stateConfig.description}
          </p>
        </div>
        {showActions && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={UploadCloud}
              onClick={() => setActiveTab('upload')}
              className="text-xs"
            >
              Upload Codebase
            </Button>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={onRetry}
                className="text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      id="empty-or-invalid-structure-card"
      className={`p-6 sm:p-8 rounded-3xl bg-slate-900/95 border ${stateConfig.borderColor} shadow-2xl space-y-6 relative overflow-hidden`}
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-4">
          <div
            className={`h-14 w-14 rounded-2xl ${stateConfig.bgColor} border ${stateConfig.borderColor} flex items-center justify-center shrink-0 shadow-lg`}
          >
            <IconComponent className={`h-7 w-7 ${stateConfig.accentColor}`} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={stateConfig.badgeVariant} className="text-xs font-mono py-0.5">
                {stateConfig.badgeText}
              </Badge>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <GitBranch className="h-3 w-3" /> {branchName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono px-2 py-0.5 rounded-full bg-slate-800/80">
                Files: {totalFiles}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              {stateConfig.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {stateConfig.description}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        {showActions && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              icon={UploadCloud}
              onClick={() => setActiveTab('upload')}
              className="text-xs"
            >
              Upload or Connect Repository
            </Button>
          </div>
        )}
      </div>

      {/* 2. Diagnostic Checklist Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" /> AST Engine Structure Diagnostic Check
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Target: {repoName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {diagnosticChecks.map((check) => (
            <div
              key={check.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                check.status === 'passed'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : check.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-200 truncate">{check.name}</span>
                {check.status === 'passed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{check.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Guided Remediation Tabs */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveGuideTab('steps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeGuideTab === 'steps'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recommended Remediation Steps
            </button>
            <button
              onClick={() => setActiveGuideTab('languages')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeGuideTab === 'languages'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Supported Languages & Manifests
            </button>
          </div>

          <span className="text-[11px] text-cyan-400/80 font-mono">
            {activeGuideTab === 'steps' ? 'Action Plan' : 'Architecture Reference'}
          </span>
        </div>

        {/* Tab 1: Recommended Remediation Steps */}
        {activeGuideTab === 'steps' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-200">Upload Source Files</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide supported source code files (.ts, .js, .py, .go, .rs, .java, .cpp) via ZIP drop or GitHub clone.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-200">Include Manifest File</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Include your project manifest (package.json, pyproject.toml, go.mod, Cargo.toml) so dependencies can be resolved.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-200">Re-run Blast Analysis</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Once valid source files are present, trigger analysis to generate L0-L3 blast radius maps and test plans.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>
                  AegisAST automatically parses exports, caller-callee trees, and API ingress routes.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  loading={isAnalyzing}
                  onClick={() => runAnalysis()}
                  className="text-xs"
                >
                  Re-run Diagnostic Scan
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={UploadCloud}
                  onClick={() => setActiveTab('upload')}
                  className="text-xs"
                >
                  Go to Repository Ingest
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supported Languages & Structure Reference */}
        {activeGuideTab === 'languages' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {SUPPORTED_LANGUAGE_GUIDES.map((guide, idx) => (
                <button
                  key={guide.language}
                  onClick={() => setSelectedLangIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedLangIdx === idx
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {guide.language}
                </button>
              ))}
            </div>

            {/* Selected Language Spec */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-slate-400">Expected Manifest: </span>
                  <span className="text-cyan-300 font-bold">{SUPPORTED_LANGUAGE_GUIDES[selectedLangIdx].manifest}</span>
                </div>
                <div>
                  <span className="text-slate-400">Entry Points: </span>
                  <span className="text-emerald-300">{SUPPORTED_LANGUAGE_GUIDES[selectedLangIdx].entryPoint}</span>
                </div>
              </div>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                  {SUPPORTED_LANGUAGE_GUIDES[selectedLangIdx].structure}
                </pre>
                <button
                  onClick={() => handleCopyTemplate(SUPPORTED_LANGUAGE_GUIDES[selectedLangIdx].structure)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-all"
                  title="Copy directory template"
                >
                  {copiedTemplate ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Collapsible Troubleshooting & AST Traversal Guide */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all py-1"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            How AegisAST computes concentric blast radius & why structure matters
          </span>
          {showTroubleshooting ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {showTroubleshooting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 text-xs text-slate-400 overflow-hidden leading-relaxed"
            >
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p>
                  <strong className="text-slate-200">1. Lexical & AST Tokenization:</strong> The engine inspects every function signature, class method, and imported module. Without code files, there are no syntax trees to traverse.
                </p>
                <p>
                  <strong className="text-slate-200">2. Inter-Module Dependency Graph:</strong> Callers and callees are mapped into an acyclic directional graph.
                </p>
                <p>
                  <strong className="text-slate-200">3. Layer 0 to Layer 3 Propagation:</strong> When a file changes, the engine propagates ripple effects from Layer 0 (Direct code edit) through Layer 1 (Internal consumers), Layer 2 (Downstream services & message queues), up to Layer 3 (Public API gateways and databases).
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Aliases for intuitive imports across the application
export const RepositoryEmptyState = EmptyOrInvalidStructureCard;
export const InvalidStructureState = EmptyOrInvalidStructureCard;
export const EmptyRepositoryCard = EmptyOrInvalidStructureCard;
