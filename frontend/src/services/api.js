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
  runAnalysis: async (repoId, commitHash) => {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoId, commitHash })
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
  getImpactLayers: async (commitHash) => {
    const response = await fetch(`${API_BASE_URL}/impact?commitHash=${encodeURIComponent(commitHash || '')}`);
    if (!response.ok) throw new Error('Failed to fetch impact layers');
    return await response.json();
  },

  // Calculate full impact analysis with algorithms & risk matrix
  calculateImpact: async (changedFile, changedFunction) => {
    const response = await fetch(`${API_BASE_URL}/impact/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changedFile, changedFunction })
    });
    if (!response.ok) throw new Error('Impact calculation failed');
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
  }
};
