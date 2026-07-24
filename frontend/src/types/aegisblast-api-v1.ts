/**
 * AegisBlast AI — Versioned TypeScript Interfaces (v1.0.0)
 * Data contracts exchanged between Express Backend and React Frontend.
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

export interface RiskWeights {
  securityGuardWeight: number;
  databaseLockWeight: number;
  apiExposureWeight: number;
  blastRadiusWeight: number;
}

export interface RiskScore {
  score: number; // 0 - 100
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskWeights: RiskWeights;
}

export interface Confidence {
  score: number; // 0 - 100
  aiModel: string;
  precisionLevel: string;
}

export interface AffectedFile {
  path: string;
  layer: string; // e.g. 'L0 (Origin)', 'L1 (Direct)'
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  additions?: number;
  deletions?: number;
  status: 'Modified' | 'Impacted' | 'Transitive';
}

export interface AffectedApi {
  endpoint: string;
  protocol: 'REST / HTTPS' | 'gRPC / HTTP2' | 'GraphQL';
  authStatus: string;
  riskImpact: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface AffectedService {
  name: string;
  type: string;
  region: string;
  status: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
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
  score: number; // 0 - 100
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

/**
 * Root AegisBlast Analysis Payload (Schema Version 1.0.0)
 */
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
