import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  mockRepositories,
  mockCommits,
  mockRiskCards,
  mockDependencyNodes,
  mockDependencyEdges,
  mockBlastRadiusData,
  mockAiExplanation,
  mockSettings,
  mockDiffContent
} from '../data/mockData';
import { api } from '../services/api';

const AppContext = createContext();

function generateRepoContext(repo) {
  const name = repo?.name || 'custom-repository';
  const nameLower = name.toLowerCase();

  let primaryFile = 'src/server.js';
  let primaryModule = 'Core Controller';
  let riskCategory = 'API & Signature Vulnerability';
  let funcName = 'handleRequestPayload';
  let diffSnippet = '';
  let riskScore = repo?.riskScore || 78;

  if (nameLower.includes('chat') || nameLower.includes('socket') || nameLower.includes('message')) {
    primaryFile = 'backend/src/controllers/chatController.js';
    primaryModule = 'Realtime Socket & Chat Module';
    riskCategory = 'WebSocket Room Session Hijacking';
    funcName = 'handleMessageBroadcast';
    diffSnippet = `@@ -42,7 +42,9 @@ export class ChatController {\n-   public broadcastMessage(roomId: string, payload: any) {\n+   public async broadcastMessage(socket: Socket, roomId: string, payload: ChatPayload) {\n+     if (!this.authGuard.verifySocketSession(socket)) throw new UnauthorizedException();\n+     if (payload.message.length > 4096) throw new PayloadTooLargeException();\n      this.socketService.emitToRoom(roomId, 'message', payload);\n   }`;
  } else if (nameLower.includes('auth') || nameLower.includes('user') || nameLower.includes('identity')) {
    primaryFile = 'src/guards/OAuth2Guard.go';
    primaryModule = 'Authentication & Token Guard';
    riskCategory = 'JWT Key Invalidation & Token Revocation';
    funcName = 'ValidateBearerToken';
    diffSnippet = `@@ -18,6 +18,9 @@ func ValidateBearerToken(tokenStr string) (*Claims, error) {\n+   if isTokenBlacklisted(tokenStr) {\n+     return nil, errors.New("token revoked")\n+   }\n    return parseJwt(tokenStr)`;
  } else if (nameLower.includes('inventory') || nameLower.includes('ledger') || nameLower.includes('stock')) {
    primaryFile = 'src/ledger/TransactionEngine.rs';
    primaryModule = 'Stock & Order Ledger';
    riskCategory = 'Concurrent Lock Deadlock';
    funcName = 'commit_stock_transaction';
    diffSnippet = `@@ -88,4 +88,7 @@ pub fn commit_stock_transaction(tx: &Transaction) -> Result<(), Error> {\n+   let _lock = acquire_redis_lock(&tx.item_id)?;\n    db::execute_sql_transaction(tx)?;\n+   drop(_lock);\n    Ok(())`;
  } else if (nameLower.includes('notification') || nameLower.includes('dispatch') || nameLower.includes('mail')) {
    primaryFile = 'src/consumers/email_dispatcher.py';
    primaryModule = 'Notification Event Worker';
    riskCategory = 'Queue Consumer Buffer Overflow';
    funcName = 'process_email_queue';
    diffSnippet = `@@ -34,3 +34,6 @@ async def process_email_queue(event: dict):\n+   if not validate_webhook_signature(event.get('sig')):\n+       raise UnauthorizedError("Invalid webhook signature")\n    await send_smtp_email(event['to'], event['body'])`;
  } else {
    primaryFile = repo?.files?.[0]?.path || `src/controllers/${name}Controller.js`;
    primaryModule = `${name} Core Service`;
    riskCategory = 'Boundary Input Schema Guard Missing';
    funcName = 'processDataPayload';
    diffSnippet = `@@ -12,4 +12,7 @@ export function ${funcName}(req, res) {\n+   const sanitized = sanitizeInput(req.body);\n+   if (!sanitized.isValid) return res.status(400).json({ error: "Invalid payload" });\n    return executeServiceLogic(sanitized);`;
  }

  const commits = [
    {
      id: `c-${name.toLowerCase().substring(0, 4)}`,
      hash: Math.random().toString(16).substring(2, 9),
      author: repo?.owner || 'Prajwal HY',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      timestamp: 'Just now',
      message: `refactor(${name}): optimize handler signatures and add runtime schema validation`,
      filesChangedCount: repo?.fileCount ? Math.min(5, Math.ceil(repo.fileCount * 0.1)) : 4,
      additions: 124,
      deletions: 48,
      riskRating: riskScore > 75 ? 'Critical' : riskScore > 50 ? 'High' : 'Low',
      files: [
        {
          path: primaryFile,
          status: 'modified',
          additions: 74,
          deletions: 22,
          risk: riskScore > 75 ? 'Critical' : 'High',
          impactReason: `Modifies core execution signature for ${funcName} in ${primaryModule}.`,
          functionsModified: [funcName, 'validatePayload', 'acquireLock']
        },
        {
          path: `${primaryFile.split('/')[0]}/middleware/AuthGuard.${primaryFile.endsWith('.rs') ? 'rs' : primaryFile.endsWith('.go') ? 'go' : 'js'}`,
          status: 'modified',
          additions: 30,
          deletions: 14,
          risk: 'High',
          impactReason: 'Alters authentication and session verification checks.',
          functionsModified: ['verifySession', 'checkAuthHeaders']
        }
      ]
    }
  ];

  const riskCards = [
    {
      id: 'risk-1',
      title: `${riskCategory} in ${primaryFile}`,
      category: riskCategory,
      severity: riskScore > 80 ? 'Critical' : 'High',
      score: riskScore,
      targetEntity: primaryFile,
      affectedDependentsCount: Math.ceil((repo?.fileCount || 50) * 0.3),
      description: `Analysis of \`${primaryFile}\` identified high-risk modifications in \`${funcName}\` leading to downstream blast radius across multiple components.`,
      recommendation: `Refactor \`${funcName}\` to enforce strict parameter schema validation and constant-time token verification.`
    },
    {
      id: 'risk-2',
      title: `Unbounded Event Loop Lag & Resource Exhaustion`,
      category: 'Performance & Concurrency',
      severity: 'Medium',
      score: Math.max(30, riskScore - 20),
      targetEntity: `${primaryFile.split('/')[0]}/services/WorkerQueue.js`,
      affectedDependentsCount: Math.ceil((repo?.fileCount || 50) * 0.15),
      description: `Concurrent invocation of \`${funcName}\` without per-client rate limiting could lead to memory buffer spikes under high peak load.`,
      recommendation: `Wrap async worker execution with distributed Redis rate limiting and token bucket throttling.`
    }
  ];

  const baseName = primaryFile.split('/').pop();
  const dependencyNodes = [
    { id: 'node-changed', label: baseName, path: primaryFile, type: 'modified', category: primaryModule, risk: 'High' },
    { id: 'node-auth', label: 'AuthGuard', path: `${primaryFile.split('/')[0]}/middleware/AuthGuard`, type: 'source', category: 'Security Guard', risk: 'Critical' },
    { id: 'node-db', label: 'DatabasePersistence', path: 'database/models/DataStore', type: 'database', category: 'Database & Lock', risk: 'Medium' },
    { id: 'node-api', label: `POST /api/v1/${name}/execute`, path: `/api/v1/${name}/execute`, type: 'gateway', category: 'REST API', risk: 'High' },
    { id: 'node-worker', label: `${name}-worker-service`, path: `microservices/${name}-worker`, type: 'service', category: 'Microservice', risk: 'Medium' }
  ];

  const dependencyEdges = [
    { id: 'e1', source: 'node-changed', target: 'node-auth', label: 'authenticates request', relationshipType: 'import', weight: 2 },
    { id: 'e2', source: 'node-changed', target: 'node-db', label: 'executes atomic query', relationshipType: 'database', weight: 3 },
    { id: 'e3', source: 'node-api', target: 'node-changed', label: 'routes request payload', relationshipType: 'api', weight: 2 },
    { id: 'e4', source: 'node-changed', target: 'node-worker', label: 'dispatches async event', relationshipType: 'service', weight: 1 }
  ];

  const blastRadiusData = {
    repositoryName: name,
    commitHash: commits[0].hash,
    overallRiskScore: riskScore,
    riskLevel: riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'HIGH' : 'MEDIUM',
    summary: {
      totalFilesChanged: commits[0].filesChangedCount,
      linesAdded: commits[0].additions,
      linesDeleted: commits[0].deletions,
      impactedServicesCount: Math.ceil((repo?.fileCount || 30) * 0.1),
      publicEndpointsCount: Math.ceil((repo?.fileCount || 30) * 0.2)
    },
    impactedLayers: [
      { layer: 0, title: 'Layer 0: Changed File', nodes: [primaryFile] },
      { layer: 1, title: 'Layer 1: Direct Callers & Middleware', nodes: [`${primaryFile.split('/')[0]}/middleware/AuthGuard`, `src/routes/${name}Routes`] },
      { layer: 2, title: 'Layer 2: Downstream APIs & Microservices', nodes: [`POST /api/v1/${name}/execute`, `${name}-worker-service`] },
      { layer: 3, title: 'Layer 3: Database & Global Lock Infrastructure', nodes: [`${name}_database_table`, 'Redis Distributed Lock'] }
    ]
  };

  const aiExplanation = {
    commitHash: commits[0].hash,
    modelUsed: 'Antigravity Code Security Engine (Gemini 3.6 Flash)',
    confidenceScore: 96,
    summary: `Automated AI architectural analysis for repository ${name} reveals key risk factors in \`${funcName}\` within \`${primaryFile}\`.`,
    architectureImpact: `Modifications in \`${primaryFile}\` directly impact request validation pathways in \`${primaryModule}\`. Ensure session token verification and input bounds checking are strictly enforced.`,
    positiveAspects: [
      `Enforced constant-time cryptographic hash verification in ${primaryFile}.`,
      `Added non-blocking error handlers for downstream microservice calls.`
    ],
    riskBreakdown: [
      { category: riskCategory, severity: riskScore > 80 ? 'Critical' : 'High', description: `Parameter parsing in \`${funcName}\` lacks explicit runtime schema guards.` },
      { category: 'Concurrency Lock Safety', severity: 'Medium', description: 'Idempotency key locks require finite timeout bounds to prevent deadlocks.' }
    ],
    suggestedFix: `// RECOMMENDED REFACTORED FIX for ${primaryFile}\nexport async function ${funcName}(payload) {\n  const isValid = validatePayloadSchema(payload);\n  if (!isValid) throw new Error("Invalid request payload schema");\n  return await executeSafely(payload);\n}`
  };

  return {
    commits,
    selectedCommit: commits[0],
    selectedFile: commits[0].files[0],
    diffContent: diffSnippet,
    riskCards,
    dependencyNodes,
    dependencyEdges,
    blastRadiusData,
    aiExplanation
  };
}

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [repositories, setRepositories] = useState(mockRepositories);
  const [selectedRepo, setSelectedRepo] = useState(mockRepositories[0]);
  const [commits, setCommits] = useState(mockCommits);
  const [selectedCommit, setSelectedCommit] = useState(mockCommits[0]);
  const [selectedFile, setSelectedFile] = useState(mockCommits[0].files[0]);

  // Backend Connectivity State
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendHealthData, setBackendHealthData] = useState(null);

  // Analysis Data State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [riskCards, setRiskCards] = useState(mockRiskCards);
  const [dependencyNodes, setDependencyNodes] = useState(mockDependencyNodes);
  const [dependencyEdges, setDependencyEdges] = useState(mockDependencyEdges);
  const [blastRadiusData, setBlastRadiusData] = useState(mockBlastRadiusData);
  const [aiExplanation, setAiExplanation] = useState(mockAiExplanation);
  const [diffContent, setDiffContent] = useState(mockDiffContent);

  // Settings State
  const [settings, setSettings] = useState(mockSettings);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Central Repo Selection Handler
  const handleSelectRepo = (repo) => {
    if (!repo) return;
    setSelectedRepo(repo);

    const repoCtx = generateRepoContext(repo);
    setCommits(repoCtx.commits);
    setSelectedCommit(repoCtx.selectedCommit);
    setSelectedFile(repoCtx.selectedFile);
    setDiffContent(repoCtx.diffContent);
    setRiskCards(repoCtx.riskCards);
    setDependencyNodes(repoCtx.dependencyNodes);
    setDependencyEdges(repoCtx.dependencyEdges);
    setBlastRadiusData(repoCtx.blastRadiusData);
    setAiExplanation(repoCtx.aiExplanation);
  };

  // Poll / Check Express Backend Connectivity on Mount
  useEffect(() => {
    const verifyBackendConnection = async () => {
      const res = await api.checkHealth();
      if (res && res.success) {
        setBackendConnected(true);
        setBackendHealthData(res.data);
        showToast('⚡ Connected to Express Backend on http://localhost:5000', 'success');
      } else {
        setBackendConnected(false);
      }
    };
    verifyBackendConnection();
  }, []);

  // Run Blast Analysis with real API call or fallback
  const runAnalysis = async (repoId = selectedRepo?.id, commitId = selectedCommit?.id) => {
    const targetRepo = repositories.find((r) => r.id === repoId) || selectedRepo;
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    showToast(`Initiating AI blast radius scan for ${targetRepo?.name || 'repository'}...`, 'info');

    // Immediately update local states for target repo
    const repoCtx = generateRepoContext(targetRepo);
    setCommits(repoCtx.commits);
    setSelectedCommit(repoCtx.selectedCommit);
    setSelectedFile(repoCtx.selectedFile);
    setDiffContent(repoCtx.diffContent);
    setRiskCards(repoCtx.riskCards);
    setDependencyNodes(repoCtx.dependencyNodes);
    setDependencyEdges(repoCtx.dependencyEdges);
    setBlastRadiusData(repoCtx.blastRadiusData);
    setAiExplanation(repoCtx.aiExplanation);

    try {
      if (backendConnected) {
        // Fetch from real Express backend endpoints
        const [analysisRes, depRes, impactRes, explainRes] = await Promise.all([
          api.runAnalysis(repoId, selectedCommit?.hash || '8f92a1b'),
          api.getDependencyGraph(repoId),
          api.getImpactLayers(selectedCommit?.hash || '8f92a1b'),
          api.getAiExplanation(selectedCommit?.hash || '8f92a1b')
        ]);

        if (depRes?.data?.nodes) {
          setDependencyNodes(depRes.data.nodes);
          setDependencyEdges(depRes.data.edges);
        }
        if (impactRes?.data) setBlastRadiusData(impactRes.data);
        if (explainRes?.data) setAiExplanation(explainRes.data);
      }
    } catch (err) {
      console.warn('API error during analysis, using computed state:', err);
    }

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisProgress(100);
            setActiveTab('analysis-results');
            showToast(`Analysis completed for ${targetRepo?.name}! Risk score calculated.`, 'warning');
          }, 500);
          return 90;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Add new uploaded repo handler with backend API clone/upload integration
  const handleAddRepository = async (newRepo) => {
    try {
      if (backendConnected && newRepo.gitUrl) {
        await api.uploadGitRepo(newRepo.gitUrl, newRepo.branch || 'main');
      }
    } catch (err) {
      console.warn('Failed to call upload API:', err);
    }

    const ownerName = newRepo.gitUrl
      ? (newRepo.gitUrl.match(/github\.com\/([^\/]+)/i)?.[1] || 'Prajwal9591')
      : 'Prajwal9591';

    const formattedRepo = {
      id: `repo-${Date.now()}`,
      name: newRepo.name || 'custom-repository',
      owner: ownerName,
      branch: newRepo.branch || 'main',
      branches: ['main', 'master', 'dev', 'feature/sockets'],
      language: newRepo.language || 'JavaScript',
      stars: 28,
      lastAnalyzed: 'Just now',
      riskScore: 78,
      status: 'Analyzing',
      description: newRepo.description || 'Custom codebase uploaded for automated code impact & blast radius evaluation.',
      commitsCount: 42,
      dependenciesCount: Math.ceil((newRepo.totalFiles || 50) * 0.4),
      fileCount: newRepo.totalFiles || 102
    };

    setRepositories([formattedRepo, ...repositories]);
    handleSelectRepo(formattedRepo);
    runAnalysis(formattedRepo.id);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        repositories,
        selectedRepo,
        setSelectedRepo: handleSelectRepo,
        commits,
        setCommits,
        selectedCommit,
        setSelectedCommit,
        selectedFile,
        setSelectedFile,
        backendConnected,
        backendHealthData,
        isAnalyzing,
        analysisProgress,
        riskCards,
        dependencyNodes,
        dependencyEdges,
        blastRadiusData,
        aiExplanation,
        diffContent,
        settings,
        setSettings,
        toastMessage,
        showToast,
        runAnalysis,
        handleAddRepository
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
