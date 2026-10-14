import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FolderArchive,
  AlertCircle,
  GitBranch,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderPlus,
  GitFork,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  AlertTriangle,
  FileX,
  Clock,
  History,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { UploadIngestionSkeleton } from '../common/Skeleton';
import { Tooltip } from '../common/Tooltip';
import { IngestionStatusIndicator } from '../common/IngestionStatusIndicator';
import { TechBadge, parseTechItems } from '../common/TechBadge';
import { fetchLiveGitHubMetadata } from '../../utils/githubClient';
import { generateRepoMetadata } from '../../utils/repoMetadataGenerator';
import { getSavedRecentUrls, saveRecentUrl, updateRecentUrlSyncStatus } from '../../data/analysisHistoryData';

const API_BASE_URL = '/api/v1';

export const UploadComponent = () => {
  const {
    handleAddRepository,
    showToast,
    setRepositoryMetadata,
    setIsMetadataLoading,
    setLoadingStep,
    setMetadataError,
    runAnalysis,
    selectedRepo,
    analysisHistory = [],
    setRecentHistoryOpen
  } = useApp();

  // Active ingestion mode: 'zip' | 'folder' | 'github'
  const [activeMode, setActiveMode] = useState('github');
  const [dragOver, setDragOver] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('auto');
  const [customBranchInput, setCustomBranchInput] = useState('');
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [localFolderPath, setLocalFolderPath] = useState('');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Exact Metadata Backend Response Schema State
  const [metadataResult, setMetadataResult] = useState(null);

  // Track recent URLs
  const [recentUrlsList, setRecentUrlsList] = useState(() => getSavedRecentUrls());
  const [copiedRecentUrl, setCopiedRecentUrl] = useState(null);

  // Merge tracked recent URLs and analysis history, deduplicating by normalized URL
  const mergedRecentUrls = React.useMemo(() => {
    const map = new Map();

    // 1. Add from recentUrlsList (user-entered / fetched URLs)
    (recentUrlsList || []).forEach((item) => {
      if (item.gitUrl) {
        const key = item.gitUrl.trim().toLowerCase().replace(/\.git$/, '');
        if (!map.has(key)) {
          let owner = item.owner;
          if (!owner || owner === 'fintech-org') {
            if (item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine' || item.gitUrl.includes('AI-Powered-Real-Time-Arbitrage-Detection-Engine')) {
              owner = 'Prajwal-S-45';
            } else {
              const match = item.gitUrl.match(/(?:github\.com[/:])([^/]+)/i);
              if (match) owner = match[1];
            }
          }
          const cleanGitUrl = (owner && owner !== 'fintech-org' && item.gitUrl.includes('fintech-org') && item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine')
            ? 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git'
            : item.gitUrl;

          let syncStatus = item.syncStatus;
          if (!syncStatus) {
            if (item.repoName === 'user-auth-microservice') {
              syncStatus = 'pending';
            } else {
              syncStatus = 'success';
            }
          }

          map.set(key, {
            ...item,
            owner,
            gitUrl: cleanGitUrl,
            syncStatus
          });
        }
      }
    });

    // 2. Add from analysisHistory
    (analysisHistory || []).forEach((item) => {
      if (item.gitUrl) {
        const key = item.gitUrl.trim().toLowerCase().replace(/\.git$/, '');
        let owner = item.owner;
        if (!owner || owner === 'fintech-org') {
          if (item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine' || item.gitUrl.includes('AI-Powered-Real-Time-Arbitrage-Detection-Engine')) {
            owner = 'Prajwal-S-45';
          } else {
            const match = item.gitUrl.match(/(?:github\.com[/:])([^/]+)/i);
            if (match) owner = match[1];
          }
        }
        const cleanGitUrl = (item.repoName === 'AI-Powered-Real-Time-Arbitrage-Detection-Engine' && item.gitUrl.includes('fintech-org'))
          ? 'https://github.com/Prajwal-S-45/AI-Powered-Real-Time-Arbitrage-Detection-Engine.git'
          : item.gitUrl;

        let statusFromHistory = 'success';
        if (item.status) {
          const s = item.status.toLowerCase();
          if (s.includes('fail') || s.includes('error')) statusFromHistory = 'failed';
          else if (s.includes('pend') || s.includes('progress') || s.includes('sync')) statusFromHistory = 'pending';
        }

        if (!map.has(key)) {
          map.set(key, {
            gitUrl: cleanGitUrl,
            repoName: item.repoName,
            owner: owner || 'custom',
            branch: item.branch || 'main',
            syncStatus: statusFromHistory
          });
        } else {
          const existing = map.get(key);
          if (!existing.syncStatus) {
            existing.syncStatus = statusFromHistory;
          }
        }
      }
    });

    // Limit to top 3 most recently uploaded/scanned URLs
    return Array.from(map.values()).slice(0, 3);
  }, [recentUrlsList, analysisHistory]);

  /**
   * Helper to derive visual status indicator configuration (successful, pending, failed)
   */
  const getSyncStatusBadge = (item, isCurrentlyProcessing) => {
    if (isCurrentlyProcessing) {
      return {
        status: 'pending',
        label: 'Syncing',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
        dotClass: 'bg-amber-400 animate-ping',
        Icon: RefreshCw,
        iconClass: 'h-3 w-3 text-amber-400 animate-spin',
        tooltip: 'Synchronization in progress: AST parser is extracting dependencies and call graphs.'
      };
    }

    const raw = (item.syncStatus || 'success').toLowerCase();

    if (raw === 'failed' || raw === 'error') {
      return {
        status: 'failed',
        label: 'Failed',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
        dotClass: 'bg-rose-500',
        Icon: AlertCircle,
        iconClass: 'h-3 w-3 text-rose-400',
        tooltip: 'Synchronization failed: Could not fetch repository or parse AST. Click to retry sync.'
      };
    }

    if (raw === 'pending' || raw === 'syncing' || raw === 'in_progress' || raw === 'queued') {
      return {
        status: 'pending',
        label: 'Pending',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
        dotClass: 'bg-amber-400 animate-pulse',
        Icon: Clock,
        iconClass: 'h-3 w-3 text-amber-400',
        tooltip: 'Synchronization pending: AST analysis queued. Click to cycle status or trigger sync.'
      };
    }

    // Default: Successful
    return {
      status: 'success',
      label: 'Synced',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
      dotClass: 'bg-emerald-400',
      Icon: CheckCircle2,
      iconClass: 'h-3 w-3 text-emerald-400',
      tooltip: 'Synchronization successful: Repository AST, commits, and dependencies fully synced.'
    };
  };

  /**
   * Handle click on the status badge: retry if failed, or cycle status for testing
   */
  const handleStatusClick = (e, item, currentStatus) => {
    e.stopPropagation();
    if (currentStatus === 'failed') {
      setGitUrl(item.gitUrl);
      if (item.branch && item.branch !== 'auto') {
        setSelectedBranch(item.branch);
      }
      showToast(`Retrying synchronization for ${item.repoName}...`, 'info');
      setTimeout(() => {
        handleFetchMetadata('github');
      }, 50);
    } else {
      const nextStatus = currentStatus === 'success' ? 'pending' : currentStatus === 'pending' ? 'failed' : 'success';
      updateRecentUrlSyncStatus(item.gitUrl, nextStatus);
      setRecentUrlsList(getSavedRecentUrls());
      showToast(`${item.repoName}: Sync status updated to ${nextStatus.toUpperCase()}`, nextStatus === 'failed' ? 'error' : nextStatus === 'pending' ? 'warning' : 'success');
    }
  };

  /**
   * Universal Metadata Fetch Handler via Live GitHub Client or Backend API
   */
  const handleFetchMetadata = async (mode = activeMode, extraPayload = {}) => {
    setIsLoading(true);
    if (setIsMetadataLoading) setIsMetadataLoading(true);
    if (setLoadingStep) setLoadingStep(0);
    setErrorMsg(null);
    if (setMetadataError) setMetadataError(null);
    setMetadataResult(null);

    // Step timer for scanning animation steps
    const stepInterval = setInterval(() => {
      if (setLoadingStep) {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }
    }, 450);

    try {
      let data = null;

      if (mode === 'github') {
        const targetUrl = (gitUrl || '').trim();
        if (!targetUrl) {
          throw new Error('Please enter a valid GitHub Repository URL (e.g. https://github.com/facebook/react).');
        }

        if (!targetUrl.includes('github.com')) {
          throw new Error('Invalid GitHub URL format. URL must contain "github.com/owner/repository".');
        }

        const inferredName = targetUrl.split('/').pop().replace('.git', '') || 'github-repo';
        showToast(`Fetching live GitHub repository metadata for '${inferredName}'...`, 'info');

        // Determine effective branch to query
        const effectiveBranch = selectedBranch === 'custom' 
          ? (customBranchInput || '').trim() 
          : (selectedBranch === 'auto' || !selectedBranch ? null : selectedBranch);

        // Prefer live client-side GitHub REST API for direct real-time accuracy
        try {
          data = await fetchLiveGitHubMetadata(targetUrl, effectiveBranch);
        } catch (clientErr) {
          const clientErrMsg = clientErr?.message || '';
          // If repo is private or 404 not found, do not hammer backend
          if (clientErrMsg.includes('not found') || clientErrMsg.includes('private') || clientErrMsg.includes('Invalid GitHub URL')) {
            throw clientErr;
          }
          // Fall back to backend scanner endpoint if client-side rate limit or CORS issue occurs
          try {
            const response = await axios.post(
              `${API_BASE_URL}/scanner/parse-metadata`,
              {
                githubUrl: targetUrl,
                branch: effectiveBranch || 'main',
                repositoryName: inferredName
              },
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
              }
            );
            data = response.data;
          } catch (backendErr) {
            const errorMsg = backendErr?.response?.data?.message || backendErr?.response?.data?.error || backendErr?.message || clientErrMsg;
            throw new Error(errorMsg);
          }
        }
      } else if (mode === 'zip') {
        if (!selectedZipFile && !extraPayload.file) {
          throw new Error('Please select a valid ZIP archive file (.zip) before fetching metadata.');
        }

        const targetFile = extraPayload.file || selectedZipFile;
        const formData = new FormData();
        formData.append('zipFile', targetFile);
        formData.append('repositoryName', targetFile.name.replace(/\.[^/.]+$/, ''));

        showToast(`Uploading and analyzing ZIP archive '${targetFile.name}'...`, 'info');

        const response = await axios.post(`${API_BASE_URL}/scanner/parse-metadata`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        });
        data = response.data;
      } else if (mode === 'folder') {
        const targetPath = (extraPayload.folderPath || localFolderPath || '').trim();
        if (!targetPath) {
          throw new Error('Please enter a valid local workspace folder path.');
        }

        showToast(`Scanning local folder directory at '${targetPath}'...`, 'info');

        const response = await axios.post(
          `${API_BASE_URL}/scanner/parse-metadata`,
          {
            folderPath: targetPath,
            repositoryName: targetPath.split(/[/\\]/).pop() || 'local-folder'
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
        data = response.data;
      }

      if (!data) {
        throw new Error('Failed to retrieve repository metadata.');
      }

      // Handle empty repository response
      if (data.totalFiles === 0 || data.isEmpty) {
        showToast(`Repository '${data.repositoryName}' is empty (0 source code files found).`, 'warning');
      } else {
        showToast(`Repository '${data.repositoryName}' metadata parsed: ${data.totalFiles} files detected!`, 'success');
      }

      if (mode === 'github') {
        const targetUrl = (gitUrl || '').trim();
        if (!data.gitUrl) {
          data.gitUrl = targetUrl;
        }
        if (!data.owner) {
          const match = targetUrl.match(/(?:github\.com[/:])([^/]+)/i);
          if (match) data.owner = match[1];
        }
        if (data.gitUrl) {
          saveRecentUrl({
            gitUrl: data.gitUrl,
            repoName: data.repositoryName,
            owner: data.owner,
            branch: data.branch || 'main',
            syncStatus: 'success'
          });
          setRecentUrlsList(getSavedRecentUrls());
        }
      }

      setMetadataResult(data);
      if (data.branch && data.branch !== 'auto') {
        setSelectedBranch(data.branch);
      }
      if (setRepositoryMetadata) setRepositoryMetadata(data);
    } catch (err) {
      const message = err.message || 'Failed to scan repository metadata.';
      setErrorMsg(message);
      if (setMetadataError) setMetadataError(message);
      showToast(message, 'error');

      if (mode === 'github' && gitUrl) {
        const targetUrl = (gitUrl || '').trim();
        const repoPart = targetUrl.split('/').pop().replace('.git', '') || 'repository';
        const ownerPart = targetUrl.match(/(?:github\.com[/:])([^/]+)/i)?.[1] || 'custom';
        saveRecentUrl({
          gitUrl: targetUrl,
          repoName: repoPart,
          owner: ownerPart,
          branch: selectedBranch !== 'auto' ? selectedBranch : 'main',
          syncStatus: 'failed'
        });
        setRecentUrlsList(getSavedRecentUrls());
      }
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
      if (setIsMetadataLoading) setIsMetadataLoading(false);
    }
  };

  // Handle Drag & Drop of ZIP File or Code Files
  const handleZipDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files);
    const firstFile = files[0];

    // If a ZIP or archive file was dropped
    if (firstFile.name.match(/\.(zip|tar|gz|tgz)$/i)) {
      setSelectedZipFile(firstFile);
      handleFetchMetadata('zip', { file: firstFile });
      return;
    }

    // If source code file(s) were dropped
    const codeFilesList = files.map((f) => ({
      name: f.name,
      path: f.webkitRelativePath || f.name,
      size: f.size,
      extension: f.name.split('.').pop()?.toLowerCase() || ''
    }));

    const langCounts = {};
    codeFilesList.forEach((f) => {
      let lang = 'Other';
      if (['ts', 'tsx'].includes(f.extension)) lang = 'TypeScript';
      else if (['js', 'jsx', 'mjs', 'cjs'].includes(f.extension)) lang = 'JavaScript';
      else if (['py'].includes(f.extension)) lang = 'Python';
      else if (['go'].includes(f.extension)) lang = 'Go';
      else if (['rs'].includes(f.extension)) lang = 'Rust';
      else if (['java'].includes(f.extension)) lang = 'Java';
      else if (['json'].includes(f.extension)) lang = 'JSON';
      else if (['css', 'scss', 'html'].includes(f.extension)) lang = 'Web';
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });

    const totalFiles = codeFilesList.length;
    const languageDistribution = Object.entries(langCounts).map(([lang, count]) => ({
      language: lang,
      files: count,
      percentage: Math.round((count / totalFiles) * 100)
    })).sort((a, b) => b.percentage - a.percentage);

    const totalBytes = files.reduce((acc, curr) => acc + curr.size, 0);
    const formattedSize = totalBytes > 1048576 ? `${(totalBytes / 1048576).toFixed(1)} MB` : `${(totalBytes / 1024).toFixed(1)} KB`;
    const repoName = files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, '') : 'uploaded-project';

    const customMetadata = generateRepoMetadata({
      name: repoName,
      branch: 'main',
      totalFiles,
      totalSize: formattedSize,
      scannedFiles: codeFilesList,
      languageDistribution
    });

    setMetadataResult(customMetadata);
    if (setRepositoryMetadata) setRepositoryMetadata(customMetadata);
    showToast(`Parsed ${totalFiles} code file(s) for '${repoName}' successfully!`, 'success');
  };

  // Confirm Metadata & Launch Blast Radius Scan
  const confirmAndLaunchAnalysis = () => {
    if (!metadataResult) return;
    if (metadataResult.totalFiles === 0 || metadataResult.isEmpty) {
      showToast('Cannot launch blast radius analysis on an empty repository (0 files).', 'warning');
      return;
    }

    if (metadataResult.isNonCodeRepo || metadataResult.hasSourceCode === false || metadataResult.readinessChecklist?.readyForBlastAnalysis === false) {
      showToast(
        metadataResult.nonCodeReason ||
          'Blast Radius Analysis requires software source code files (JS, TS, Python, Go, Java, Rust). This is a non-code/asset repository.',
        'warning'
      );
      return;
    }

    const effectiveGitUrl = activeMode === 'github'
      ? ((gitUrl || '').trim() || metadataResult.gitUrl)
      : metadataResult.gitUrl;

    const effectiveOwner = metadataResult.owner || (effectiveGitUrl ? effectiveGitUrl.match(/(?:github\.com[/:])([^/]+)/i)?.[1] : undefined);

    if (effectiveGitUrl) {
      saveRecentUrl({
        gitUrl: effectiveGitUrl,
        repoName: metadataResult.repositoryName,
        owner: effectiveOwner,
        branch: metadataResult.branch || 'main',
        syncStatus: 'success'
      });
      setRecentUrlsList(getSavedRecentUrls());
    }

    handleAddRepository({
      name: metadataResult.repositoryName,
      owner: effectiveOwner,
      branch: metadataResult.branch || 'main',
      language: metadataResult.languageDistribution?.[0]?.language || 'TypeScript',
      totalFiles: metadataResult.totalFiles,
      totalFolders: metadataResult.totalFolders,
      totalSize: metadataResult.totalSize,
      gitUrl: effectiveGitUrl,
      description: `Validated ${metadataResult.status || 'Active'} repository (${metadataResult.totalFiles} files across ${metadataResult.totalFolders} folders).`,
      scannedFiles: metadataResult.scannedFiles || metadataResult.fileList || [],
      techStack: metadataResult.techStack,
      databaseDetection: metadataResult.databaseDetection,
      authenticationDetection: metadataResult.authenticationDetection,
      apiAnalysis: metadataResult.apiAnalysis,
      projectStructure: metadataResult.projectStructure,
      repositoryHealth: metadataResult.repositoryHealth,
      isNonCodeRepo: metadataResult.isNonCodeRepo,
      hasSourceCode: metadataResult.hasSourceCode,
      readinessChecklist: metadataResult.readinessChecklist
    });

    if (selectedRepo?.id) {
      runAnalysis(selectedRepo.id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Repository Ingestion & Metadata Scanner
            <span className="text-xs font-normal text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
              Live AST Engine
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload repository ZIP archives, scan local project directories, or connect remote GitHub repositories.
          </p>
        </div>
      </div>

      {/* Input Mode Selector Tabs & Recent Analysis History Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <button
            id="mode-zip-tab"
            onClick={() => {
              setActiveMode('zip');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'zip'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="h-4 w-4" /> ZIP Archive
          </button>

          <button
            id="mode-folder-tab"
            onClick={() => {
              setActiveMode('folder');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'folder'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="h-4 w-4" /> Local Folder Directory
          </button>

          <button
            id="mode-github-tab"
            onClick={() => {
              setActiveMode('github');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'github'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="h-4 w-4" /> GitHub Repository URL
          </button>
        </div>

        {/* Quick Recent Analysis Drawer Trigger */}
        {analysisHistory.length > 0 && (
          <button
            type="button"
            onClick={() => setRecentHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-all shadow-md group"
          >
            <Clock className="h-4 w-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Recent Analyses ({analysisHistory.length})</span>
            <ArrowRight className="h-3.5 w-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Ingestion & Analysis Status Indicator Banner (if active workspace exists) */}
      {selectedRepo && <IngestionStatusIndicator variant="banner" />}

      {/* Mode 1: ZIP Archive Upload */}
      {activeMode === 'zip' && (
        <motion.div
          key="mode-zip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleZipDrop}
          className={`relative flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed transition-all duration-300 ${
            dragOver
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
          }`}
        >
          <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl mb-4">
            <UploadCloud className="h-10 w-10 text-cyan-400 animate-bounce" />
          </div>

          <h3 className="text-lg font-bold text-slate-100 mb-1">
            Drag & Drop Repository Archive (.zip)
          </h3>
          <p className="text-xs text-slate-400 text-center max-w-md mb-6">
            Automatically ignores build directories like <code className="text-cyan-300 font-mono">.git</code>, <code className="text-cyan-300 font-mono">node_modules</code>, <code className="text-cyan-300 font-mono">dist</code>, <code className="text-cyan-300 font-mono">build</code>, and <code className="text-cyan-300 font-mono">venv</code>.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".zip,.tar,.gz,.tgz"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedZipFile(e.target.files[0]);
                  }
                }}
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs hover:border-slate-600 transition-all">
                <FolderArchive className="h-4 w-4 text-cyan-400" />
                {selectedZipFile ? selectedZipFile.name : 'Select ZIP Archive File'}
              </span>
            </label>

            <Button
              onClick={() => handleFetchMetadata('zip')}
              disabled={isLoading}
              variant="primary"
              icon={isLoading ? RefreshCw : Sparkles}
              className="py-3"
            >
              {isLoading ? 'Scanning ZIP...' : 'Fetch Repository & Parse Metadata'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mode 2: Local Folder Directory Scan */}
      {activeMode === 'folder' && (
        <motion.div
          key="mode-folder"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-8 rounded-3xl glass-card border border-slate-800 space-y-6"
        >
          <div className="flex items-center gap-3">
            <FolderPlus className="h-6 w-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Scan Local Directory Folder</h3>
              <p className="text-xs text-slate-400">Validate local filesystem directory path and collect file stats</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Local Folder Path</label>
            <input
              type="text"
              value={localFolderPath}
              onChange={(e) => setLocalFolderPath(e.target.value)}
              placeholder="d:\MSRIT or /home/user/project"
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <Button
            onClick={() => handleFetchMetadata('folder')}
            disabled={isLoading}
            variant="primary"
            className="w-full py-3"
            icon={isLoading ? RefreshCw : Sparkles}
          >
            {isLoading ? 'Scanning Directory...' : 'Fetch Repository & Parse Metadata'}
          </Button>
        </motion.div>
      )}

      {/* Mode 3: GitHub Repository URL */}
      {activeMode === 'github' && (
        <motion.form
          key="mode-github"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchMetadata('github');
          }}
          className="p-8 rounded-3xl glass-card border border-slate-800 space-y-6"
        >
          <div className="flex items-center gap-3">
            <GitFork className="h-6 w-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Clone & Parse Remote GitHub URL</h3>
              <p className="text-xs text-slate-400">Fetch metadata from public or private GitHub repository</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">GitHub Repository URL</label>
                {analysisHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRecentHistoryOpen(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Clock className="h-3 w-3" /> Revisit past analysis ({analysisHistory.length})
                  </button>
                )}
              </div>
              <input
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/owner/repository.git"
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />

              {/* Quick Picks from Recent Analysis History & Uploads */}
              {mergedRecentUrls.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <History className="h-3 w-3 text-cyan-400" />
                      Recent URLs:
                    </span>
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Synced
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Pending
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span> Failed
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {mergedRecentUrls.map((item, idx) => {
                      const isCopied = copiedRecentUrl === item.gitUrl;
                      const isActivelyProcessing = isLoading && (gitUrl || '').trim().toLowerCase().replace(/\.git$/, '') === (item.gitUrl || '').trim().toLowerCase().replace(/\.git$/, '');
                      const badgeConfig = getSyncStatusBadge(item, isActivelyProcessing);
                      const StatusIcon = badgeConfig.Icon;
                      const displayOwner = item.owner && item.owner !== 'custom'
                        ? item.owner
                        : (item.gitUrl?.match(/(?:github\.com[/:])([^/]+)/i)?.[1] || 'repository');

                      return (
                        <div
                          key={item.id || item.gitUrl || idx}
                          className="inline-flex items-center rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all text-[11px] overflow-hidden group shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setGitUrl(item.gitUrl);
                              if (item.branch && item.branch !== 'auto') {
                                setSelectedBranch(item.branch);
                              }
                              showToast(`Loaded complete URL: ${item.gitUrl}`, 'info');
                            }}
                            title={`Click to fill complete link: ${item.gitUrl}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors font-mono text-left"
                          >
                            <span className="text-cyan-400 font-semibold">{displayOwner}/</span>
                            <span className="text-slate-200 font-medium">{item.repoName}</span>
                            <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded ml-0.5">
                              {item.branch || 'main'}
                            </span>
                          </button>

                          {/* Visual Status Indicator Badge */}
                          <Tooltip title={badgeConfig.tooltip} position="top">
                            <button
                              type="button"
                              onClick={(e) => handleStatusClick(e, item, badgeConfig.status)}
                              title={badgeConfig.tooltip}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium border-l border-slate-800 transition-all cursor-pointer select-none ${badgeConfig.badgeClass}`}
                              aria-label={`Sync status: ${badgeConfig.label}`}
                            >
                              <StatusIcon className={badgeConfig.iconClass} />
                              <span className="font-sans font-semibold tracking-tight">{badgeConfig.label}</span>
                            </button>
                          </Tooltip>

                          {/* Copy URL Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(item.gitUrl);
                                setCopiedRecentUrl(item.gitUrl);
                                showToast(`Copied ${item.gitUrl} to clipboard!`, 'success');
                                setTimeout(() => setCopiedRecentUrl(null), 2000);
                              }
                            }}
                            title={`Copy complete URL: ${item.gitUrl}`}
                            className="px-2 py-1.5 border-l border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Target Branch</label>
                <span className="text-[10px] text-cyan-400 font-mono">Auto-detects default branch (Production / main)</span>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <GitBranch className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all appearance-none"
                  >
                    <option value="auto">⚡ Auto-detect Default Branch (e.g. Production / main / master)</option>
                    <option value="Production">Production</option>
                    <option value="main">main</option>
                    <option value="master">master</option>
                    <option value="develop">develop</option>
                    <option value="dev">dev</option>
                    <option value="custom">Custom Branch Name...</option>
                  </select>
                </div>

                {selectedBranch === 'custom' && (
                  <input
                    type="text"
                    value={customBranchInput}
                    onChange={(e) => setCustomBranchInput(e.target.value)}
                    placeholder="Enter branch name (e.g. Production, feature/auth)"
                    className="w-full bg-slate-900 border border-cyan-500/50 text-slate-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            onClick={() => handleFetchMetadata('github')}
            disabled={isLoading}
            variant="primary"
            className="w-full py-3"
            icon={isLoading ? RefreshCw : Sparkles}
          >
            {isLoading ? 'Cloning & Parsing...' : 'Fetch Repository & Parse Metadata'}
          </Button>
        </motion.form>
      )}

      {/* Loading Skeleton Screen */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <UploadIngestionSkeleton currentStep="Scanning repository files & computing metadata..." />
        </motion.div>
      )}

      {/* Error Alert Box */}
      {errorMsg && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 flex items-start gap-3 text-xs"
        >
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-100">Metadata Ingestion Failed</h4>
            <p className="mt-0.5 text-rose-300">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {/* Response Data Inspector Card */}
      {metadataResult && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass-card border border-emerald-500/40 space-y-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${metadataResult.totalFiles === 0 || metadataResult.isEmpty ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                {metadataResult.totalFiles === 0 || metadataResult.isEmpty ? (
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {metadataResult.repositoryName}
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    metadataResult.totalFiles === 0 || metadataResult.isEmpty
                      ? 'text-amber-400 bg-amber-950/80 border-amber-800'
                      : 'text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800'
                  }`}>
                    {metadataResult.totalFiles === 0 || metadataResult.isEmpty ? 'Empty Repository' : (metadataResult.status || 'Validated')}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Branch: <strong className="text-cyan-400">{metadataResult.branch || 'main'}</strong>
                </p>
              </div>
            </div>

            {metadataResult.totalFiles === 0 || metadataResult.isEmpty ? (
              <Button disabled variant="outline" icon={FileX}>
                Empty Repository (0 Files)
              </Button>
            ) : (
              <Button onClick={confirmAndLaunchAnalysis} variant="primary" icon={ArrowRight}>
                Confirm & Launch Blast Radius Scan
              </Button>
            )}
          </div>

          {/* Empty Codebase Warning */}
          {(metadataResult.totalFiles === 0 || metadataResult.isEmpty) && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3 text-xs">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-100">Empty Codebase Detected</h4>
                <p className="mt-0.5 text-amber-300">
                  This repository contains 0 files and 0 commits. Blast radius AST analysis, dependency graph topology, and risk indices require source code files to analyze.
                </p>
              </div>
            </div>
          )}

          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Files</span>
              <p className="text-2xl font-bold text-slate-100 font-mono mt-1">{metadataResult.totalFiles}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Folders</span>
              <p className="text-2xl font-bold text-slate-100 font-mono mt-1">{metadataResult.totalFolders}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Size</span>
              <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{metadataResult.totalSize}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ignored Folders</span>
              <p className="text-xs font-bold text-slate-300 font-mono mt-1 line-clamp-2">
                {metadataResult.ignoredFolders?.join(', ') || '.git, node_modules, dist'}
              </p>
            </div>
          </div>

          {/* Dynamic Language Distribution Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-cyan-400" /> Language Distribution Breakdown
              </span>
              <span className="text-slate-400 font-mono">
                {metadataResult.languageDistribution?.length || 0} Languages Detected
              </span>
            </div>

            {/* Percentage Bar */}
            <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
              {metadataResult.languageDistribution?.map((lang, idx) => (
                <Tooltip
                  key={lang.language}
                  title={`${lang.language} Language Share`}
                  content={`${lang.percentage}% of codebase composition comprising ${lang.files} analyzed files.`}
                  position="top"
                >
                  <div
                    style={{ width: `${lang.percentage}%` }}
                    className={`h-full transition-all duration-500 cursor-help ${
                      idx === 0
                        ? 'bg-cyan-400'
                        : idx === 1
                        ? 'bg-indigo-500'
                        : idx === 2
                        ? 'bg-amber-400'
                        : idx === 3
                        ? 'bg-emerald-400'
                        : 'bg-slate-500'
                    }`}
                  />
                </Tooltip>
              ))}
            </div>

            {/* Legend Cards */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              {metadataResult.languageDistribution?.map((lang, idx) => (
                <div key={lang.language} className="flex items-center gap-2 text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      idx === 0
                        ? 'bg-cyan-400'
                        : idx === 1
                        ? 'bg-indigo-500'
                        : idx === 2
                        ? 'bg-amber-400'
                        : idx === 3
                        ? 'bg-emerald-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-semibold">{lang.language}</span>
                  <span className="text-cyan-400 font-mono font-bold">{lang.percentage}%</span>
                  <span className="text-slate-500 font-mono">({lang.files} files)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Readiness Checklist */}
          {metadataResult.techStack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" /> Detected Architecture & Stack
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5 text-xs">
                  {parseTechItems(metadataResult.techStack.frontendFramework).map((badge, idx) => (
                    <TechBadge key={idx} {...badge} colorTheme="cyan" />
                  ))}
                  {parseTechItems(metadataResult.techStack.backendFramework).map((badge, idx) => (
                    <TechBadge key={idx} {...badge} colorTheme="indigo" />
                  ))}
                  {parseTechItems(metadataResult.techStack.packageManager).map((badge, idx) => (
                    <TechBadge key={idx} {...badge} colorTheme="emerald" />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Health & Readiness Score
                </span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Health Index:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {metadataResult.repositoryHealth?.repositoryHealthScore ?? 0}% ({metadataResult.repositoryHealth?.healthStatus || 'N/A'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Analysis Pre-flight:</span>
                  <span className="font-semibold text-cyan-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> AST Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
