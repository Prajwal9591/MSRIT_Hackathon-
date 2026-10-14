const API_BASE_URL = '/api/v1';

export const api = {
  // Check backend connectivity status
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.warn('Backend API unreachable, using simulated state:', error.message);
      return null;
    }
  },

  // Upload ZIP Archive
  uploadZip: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/upload/zip`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('ZIP upload failed');
    return await response.json();
  },

  // Upload Local Folder Directory Manifest
  uploadFolder: async (files, folderName) => {
    const response = await fetch(`${API_BASE_URL}/upload/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, folderName })
    });
    if (!response.ok) throw new Error('Folder upload failed');
    return await response.json();
  },

  // Clone/Upload remote Git repository
  uploadGitRepo: async (cloneUrl, branch = 'main') => {
    const response = await fetch(`${API_BASE_URL}/upload/git`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cloneUrl, branch })
    });
    if (!response.ok) throw new Error('Failed to clone repository');
    return await response.json();
  },

  // Trigger Blast Radius Analysis
  runAnalysis: async (repoId, commitHash, diffText) => {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId, commitHash, diffText })
    });
    if (!response.ok) throw new Error('Analysis failed');
    return await response.json();
  },

  // Run master end-to-end analysis pipeline
  runFullPipeline: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/analyze/pipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!response.ok) throw new Error('Master pipeline execution failed');
    return await response.json();
  },

  // Get AST Call-Graph Dependency Tree
  getDependencyGraph: async (repoId) => {
    const response = await fetch(`${API_BASE_URL}/dependency?repoId=${encodeURIComponent(repoId || '')}`);
    if (!response.ok) throw new Error('Failed to fetch dependencies');
    return await response.json();
  },

  // Run full AST dependency analysis on codebase
  analyzeDependencies: async (repoId = 'repo-1', files = []) => {
    const response = await fetch(`${API_BASE_URL}/dependency/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId, files })
    });
    if (!response.ok) throw new Error('Dependency analysis failed');
    return await response.json();
  },

  // Get Concentric Blast Radius Scope Layers
  getImpactLayers: async (commitHash, diffText) => {
    const params = new URLSearchParams();
    if (commitHash) params.append('commitHash', commitHash);
    if (diffText) params.append('diffText', diffText);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/impact${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch impact layers');
    return await response.json();
  },

  // Calculate full impact analysis with algorithms & risk matrix
  calculateImpact: async (paramsOrFile, changedFunction) => {
    const payload = typeof paramsOrFile === 'object' && paramsOrFile !== null
      ? paramsOrFile
      : { changedFile: paramsOrFile, changedFunction };
    const response = await fetch(`${API_BASE_URL}/impact/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Impact calculation failed');
    return await response.json();
  },

  // Parse Unified Git Diff
  parseDiff: async (diffText) => {
    const response = await fetch(`${API_BASE_URL}/impact/diff/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diffText })
    });
    if (!response.ok) throw new Error('Diff parsing failed');
    return await response.json();
  },

  // Trigger AST Metadata Extraction with Incremental Loading
  scanMetadata: async (repoId = 'repo-1', forceRefresh = false) => {
    const response = await fetch(`${API_BASE_URL}/metadata/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId, forceRefresh })
    });
    if (!response.ok) throw new Error('Metadata AST scan failed');
    return await response.json();
  },

  // Get cached JSON metadata graph
  getMetadataCache: async () => {
    const response = await fetch(`${API_BASE_URL}/metadata/cache`);
    if (!response.ok) throw new Error('Failed to fetch metadata cache');
    return await response.json();
  },

  // Get AI Synthesis Explanation
  getAiExplanation: async (commitHash) => {
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commitHash })
    });
    if (!response.ok) throw new Error('Failed to fetch AI explanation');
    return await response.json();
  },

  // Parse Repository Metadata from ZIP, Folder, or GitHub URL
  parseRepositoryMetadata: async (payload = {}) => {
    const isFormData = payload instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/scanner/parse-metadata`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to parse repository metadata');
    return await response.json();
  },

  // Repository Analysis Engine - Single Scan & Metrics API
  analyzeRepository: async (payload = {}) => {
    const isFormData = payload instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/analysis-engine/analyze`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Repository analysis failed');
    return await response.json();
  },

  getAnalyzedRepository: async (repoId) => {
    const response = await fetch(`${API_BASE_URL}/analysis-engine/repository/${encodeURIComponent(repoId)}`);
    if (!response.ok) throw new Error('Failed to fetch analyzed repository');
    return await response.json();
  },

  getAllAnalyzedRepositories: async () => {
    const response = await fetch(`${API_BASE_URL}/analysis-engine/repositories`);
    if (!response.ok) throw new Error('Failed to fetch analyzed repositories list');
    return await response.json();
  },

  clearAnalyzedRepository: async (repoId) => {
    const response = await fetch(`${API_BASE_URL}/analysis-engine/repository/${encodeURIComponent(repoId)}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to clear repository analysis');
    return await response.json();
  },

  // Security Audit API
  getSecurityAudit: async (repoId) => {
    const response = await fetch(`${API_BASE_URL}/security/audit?repoId=${encodeURIComponent(repoId || '')}`);
    if (!response.ok) throw new Error('Failed to fetch security audit');
    return await response.json();
  },

  scanSecurity: async (files = [], repoName = 'repository') => {
    const response = await fetch(`${API_BASE_URL}/security/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, repoName })
    });
    if (!response.ok) throw new Error('Security scan failed');
    return await response.json();
  }
};
