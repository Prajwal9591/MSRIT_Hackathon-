export const impactService = {
  getBlastRadiusLayers: (commitHash = '8f92a1b') => {
    return {
      commitHash,
      overallRiskIndex: 'HIGH (78/100)',
      metrics: {
        directImpactCount: 3,
        downstreamServicesCount: 5,
        publicEndpointsCount: 12,
        databaseTablesCount: 2
      },
      layers: [
        {
          level: 0,
          name: 'Layer 0: Modified Source Files',
          riskColor: 'rose',
          items: [
            { name: 'StripeWebhookHandler.ts', type: 'TypeScript', impact: 'High', detail: 'Signature & Lock handling changed' },
            { name: 'AuthenticationGuard.ts', type: 'TypeScript', impact: 'Critical', detail: 'Bypass flag parameter added' }
          ]
        },
        {
          level: 1,
          name: 'Layer 1: Direct Internal Dependents',
          riskColor: 'amber',
          items: [
            { name: 'PaymentRoutes.ts', type: 'Express Controller', impact: 'High', detail: 'Exposes altered handler parameters' },
            { name: 'TransactionLedger.ts', type: 'TypeORM Model', impact: 'Medium', detail: 'Modifies SQL update behavior' }
          ]
        },
        {
          level: 2,
          name: 'Layer 2: Downstream Microservices',
          riskColor: 'indigo',
          items: [
            { name: 'order-processing-service', type: 'gRPC Service', impact: 'High', detail: 'Relies on payment ledger status confirmation' },
            { name: 'billing-analytics-worker', type: 'Kafka Consumer', impact: 'Medium', detail: 'Processes payment metadata streams' }
          ]
        },
        {
          level: 3,
          name: 'Layer 3: Public APIs & Gateways',
          riskColor: 'cyan',
          items: [
            { name: 'POST /api/v2/webhooks/stripe', type: 'Public Webhook', impact: 'Critical', detail: 'Entry point for external Stripe triggers' },
            { name: 'GET /api/v2/payments/status/:id', type: 'REST API', impact: 'High', detail: 'Used by Mobile iOS/Android apps' }
          ]
        }
      ]
    };
  }
};
