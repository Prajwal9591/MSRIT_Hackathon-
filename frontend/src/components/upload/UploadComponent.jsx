import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FolderArchive,
  FileCode,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderPlus,
  GitFork,
  Folder,
  Code2,
  ShieldCheck,
  Eye,
  FileText,
  AlertTriangle,
  ServerOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

const API_BASE_URL = '/api/v1';

export const UploadComponent = () => {
  const { handleAddRepository, showToast, backendConnected } = useApp();

  const [activeMode, setActiveMode] = useState('zip'); // 'zip' | 'folder' | 'github'
  const [dragOver, setDragOver] = useState(false);
  const [gitUrl, setGitUrl] = useState('https://github.com/aegisblast/payment-gateway-service.git');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [localFolderPath, setLocalFolderPath] = useState('d:\\MSRIT');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Exact Metadata Backend Response Schema State
  const [metadataResult, setMetadataResult] = useState(null);

  /**
   * Universal Metadata Fetch Handler via Axios
   */
  const handleFetchMetadata = async (mode = activeMode, extraPayload = {}) => {
    setIsLoading(true);
    setErrorMsg(null);
    setMetadataResult(null);

    try {
      let response;

      if (mode === 'zip') {
        if (!selectedZipFile && !extraPayload.file) {
          throw new Error('Please select a valid ZIP archive file (.zip) before fetching metadata.');
        }

        const targetFile = extraPayload.file || selectedZipFile;
        const formData = new FormData();
        formData.append('zipFile', targetFile);
        formData.append('repositoryName', targetFile.name.replace(/\.[^/.]+$/, ''));

        showToast(`Uploading and analyzing ZIP archive '${targetFile.name}'...`, 'info');

        response = await axios.post(`${API_BASE_URL}/scanner/parse-metadata`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        });
      } else if (mode === 'github') {
        if (!gitUrl.trim()) {
          throw new Error('Please enter a valid GitHub Repository URL.');
        }

        // Basic URL validation
        if (!gitUrl.includes('github.com')) {
          throw new Error('Invalid GitHub URL format. URL must contain "github.com/owner/repository".');
        }

        const inferredName = gitUrl.split('/').pop().replace('.git', '') || 'github-repo';
        showToast(`Fetching remote metadata for '${inferredName}'...`, 'info');

        response = await axios.post(
          `${API_BASE_URL}/scanner/parse-metadata`,
          {
            githubUrl: gitUrl.trim(),
            branch: selectedBranch,
            repositoryName: inferredName
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
      } else if (mode === 'folder') {
        const targetPath = extraPayload.folderPath || localFolderPath;
        if (!targetPath.trim()) {
          throw new Error('Please enter a valid local workspace folder path.');
        }

        showToast(`Scanning local folder directory at '${targetPath}'...`, 'info');

        response = await axios.post(
          `${API_BASE_URL}/scanner/parse-metadata`,
          {
            folderPath: targetPath.trim(),
            repositoryName: targetPath.split(/[/\\]/).pop() || 'local-folder'
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
      }

      const data = response.data;

      // Handle empty repository response
      if (!data || data.totalFiles === 0) {
        showToast('Repository parsed, but 0 valid source code files were found.', 'warning');
      } else {
        showToast(`Repository '${data.repositoryName}' metadata parsed successfully!`, 'success');
      }

      setMetadataResult(data);
    } catch (err) {
      console.error('Metadata API error:', err);

      let message = 'An unexpected error occurred while parsing repository metadata.';
      if (err.response) {
        message = err.response.data?.message || `Server responded with error status ${err.response.status}`;
      } else if (err.request) {
        message = 'Network Failure: Express backend server is unreachable on port 5000. Please ensure the server is running.';
      } else {
        message = err.message;
      }

      setErrorMsg(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Drag & Drop ZIP File Select
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.match(/\.(zip|tar|gz)$/i)) {
        setErrorMsg('Invalid file format. Please upload a valid .zip file archive.');
        return;
      }
      setSelectedZipFile(file);
      handleFetchMetadata('zip', { file });
    }
  };

  // Handle Browser Folder Picker
  const handleFolderSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const folderName = files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'local-folder';
    handleFetchMetadata('folder', { folderPath: 'd:\\MSRIT' });
  };

  // Confirm Metadata & Launch Blast Radius Scan
  const confirmAndLaunchAnalysis = () => {
    if (!metadataResult) return;

    handleAddRepository({
      name: metadataResult.repositoryName,
      branch: metadataResult.branch || 'main',
      language: metadataResult.languageDistribution?.[0]?.language || 'JavaScript',
      totalFiles: metadataResult.totalFiles,
      totalFolders: metadataResult.totalFolders,
      totalSize: metadataResult.totalSize,
      gitUrl: gitUrl,
      description: `Validated ${metadataResult.status} repository (${metadataResult.totalFiles} files across ${metadataResult.totalFolders} folders).`
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Repository Ingestion & Metadata Scanner
            <span className="text-xs font-normal text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
              Live Express API
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extract real-time repository statistics, ignored directory filters, and language distribution.
          </p>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
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
          <FolderArchive className="h-4 w-4" /> ZIP Archive Upload
        </button>
        <button
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

      {/* Mode 1: ZIP Archive Upload */}
      {activeMode === 'zip' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
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
                accept=".zip,.tar,.gz"
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Repository URL</label>
              <input
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/owner/repository.git"
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Branch</label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-all appearance-none"
                >
                  <option value="main">main</option>
                  <option value="master">master</option>
                  <option value="develop">develop</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full py-3"
            icon={isLoading ? RefreshCw : Sparkles}
          >
            {isLoading ? 'Cloning & Parsing...' : 'Fetch Repository & Parse Metadata'}
          </Button>
        </motion.form>
      )}

      {/* Loading Spinner Indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center gap-4 text-slate-200 font-semibold text-sm shadow-xl"
        >
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
          <span>Executing recursive backend scanner probe on port 5000...</span>
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
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {metadataResult.repositoryName}
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    {metadataResult.status || 'Validated'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Branch: <strong className="text-cyan-400">{metadataResult.branch}</strong>
                </p>
              </div>
            </div>

            <Button onClick={confirmAndLaunchAnalysis} variant="primary" icon={ArrowRight}>
              Confirm & Launch Blast Radius Scan
            </Button>
          </div>

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
                <div
                  key={lang.language}
                  style={{ width: `${lang.percentage}%` }}
                  className={`h-full transition-all duration-500 ${
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
                  title={`${lang.language}: ${lang.percentage}% (${lang.files} files)`}
                />
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
        </motion.div>
      )}
    </div>
  );
};
