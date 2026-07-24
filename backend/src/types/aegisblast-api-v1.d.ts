/**
 * AegisBlast AI Backend Type Definitions (v1.0.0)
 */

export interface RepositoryMetadata {
  repoId: string;
  name: string;
  owner: string;
  defaultBranch: string;
  language: string;
  fileCount: number;
  dependenciesCount: number;
  latestCommit?: {
    hash: string;
    author: string;
    message: string;
    timestamp: string;
  };
}

export interface ChangedItem {
  filePath: string;
  functionName: string;
  commitHash: string;
  author: string;
  additions: number;
  deletions: number;
  diffSnippet?: string;
}

export interface RiskScore {
  score: number;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskWeights: {
    securityGuardWeight: number;
    databaseLockWeight: number;
    apiExposureWeight: number;
    blastRadiusWeight: number;
  };
}

export interface Confidence {
  score: number;
  aiModel: string;
  precisionLevel: string;
}

export interface AffectedFile {
  path: string;
  layer: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  additions?: number;
  deletions?: number;
  status: string;
}

export interface AffectedApi {
  endpoint: string;
  protocol: string;
  authStatus: string;
  riskImpact: string;
}

export interface AffectedService {
  name: string;
  type: string;
  region: string;
  status: string;
  risk: string;
}

export interface AffectedTeam {
  name: string;
  lead: string;
  membersCount: number;
  role: string;
}

export interface AffectedTest {
  testSuite: string;
  type: string;
  framework: string;
  priority: string;
}

export interface BlastRadius {
  score: number;
  scope: string;
  maxDepth: number;
  impactedNodesCount: number;
  totalNodesCount: number;
}

export interface Recommendation {
  title: string;
  category: string;
  description: string;
  codeFix?: string;
}

export interface AegisBlastAnalysisPayload {
  schemaVersion: '1.0.0';
  timestamp: string;
  repositoryMetadata: RepositoryMetadata;
  changedItem: ChangedItem;
  riskScore: RiskScore;
  confidence: Confidence;
  affectedFiles: AffectedFile[];
  affectedApis: AffectedApi[];
  affectedServices: AffectedService[];
  affectedTeams: AffectedTeam[];
  affectedTests: AffectedTest[];
  blastRadius: BlastRadius;
  recommendations: Recommendation[];
}
