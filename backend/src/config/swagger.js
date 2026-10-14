import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AegisBlast AI Platform API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API endpoints for Repository Ingestion, AST Metadata Parsing, Call-Graph Dependency Analysis, Blast Radius Calculation, and Gemini AI Explanation Synthesis.',
      contact: {
        name: 'AegisBlast AI DevSecOps Team',
        url: 'https://aegisblast.ai'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'AegisBlast API Server'
      }
    ],
    paths: {
      '/upload/git': {
        post: {
          summary: 'Upload & ingest repository via GitHub URL',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['repoUrl'],
                  properties: {
                    repoUrl: { type: 'string', example: 'https://github.com/aegisblast/payment-gateway-service' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Repository ingested successfully with extracted metadata' }
          }
        }
      },
      '/metadata/scan': {
        post: {
          summary: 'Trigger AST Metadata Extraction with Hash-Based Incremental Loading',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    repoId: { type: 'string', example: 'repo-1' },
                    forceRefresh: { type: 'boolean', example: false }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'AST metadata extraction completed' }
          }
        }
      },
      '/dependency/analyze': {
        post: {
          summary: 'Build high-performance AST call-graph dependency structure',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    repoId: { type: 'string', example: 'repo-1' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Dependency graph generated successfully' }
          }
        }
      },
      '/impact/calculate': {
        post: {
          summary: 'Calculate Concentric Blast Radius & Multi-Factor Risk Score Matrix (Change & Git Diff-Aware)',
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    changedFile: { type: 'string', example: 'src/services/StripeWebhookHandler.ts' },
                    changedFunction: { type: 'string', example: 'handlePaymentIntentSucceeded' },
                    diffText: { type: 'string', description: 'Raw Git unified diff text to seed exact changed files and symbols' },
                    commitHash: { type: 'string', example: '8f92a1b' },
                    baseSha: { type: 'string', example: 'HEAD~1' },
                    targetSha: { type: 'string', example: 'HEAD' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Concentric blast radius impact calculated from exact Git change set' }
          }
        }
      },
      '/impact/diff/parse': {
        post: {
          summary: 'Parse unified Git diff text and extract modified files, hunks, line changes, and symbols',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['diffText'],
                  properties: {
                    diffText: { type: 'string', example: 'diff --git a/src/index.js b/src/index.js\n--- a/src/index.js\n+++ b/src/index.js\n@@ -1,1 +1,2 @@\n+export function test() {}\n const a = 1;' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Git unified diff parsed into structured file changes and symbols' }
          }
        }
      },
      '/explain': {
        post: {
          summary: 'Synthesize 7-Part Markdown Architectural Explanation using Gemini AI',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    commitHash: { type: 'string', example: '8f92a1b' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'AI architectural Markdown report generated' }
          }
        }
      },
      '/dashboard': {
        get: {
          summary: 'Get system-wide analysis dashboard metrics and active repositories summary',
          responses: {
            200: { description: 'Dashboard metrics retrieved successfully' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
