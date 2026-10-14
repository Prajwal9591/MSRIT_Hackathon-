import React from 'react';
import { AIInsightsSection } from '../analysis/AIInsightsSection';

/**
 * AIInsights
 *
 * Enterprise AI architectural reasoning, recommendations, and query interface.
 * Wraps and exposes AIInsightsSection for the unified dashboard layout.
 */
export const AIInsights = ({ onRunAnalysis, className = '', ...props }) => {
  return (
    <div className={className} id="ai-insights-container">
      <AIInsightsSection onRunAnalysis={onRunAnalysis} {...props} />
    </div>
  );
};

export { AIInsightsSection };
