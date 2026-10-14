import React from 'react';
import { RepositoryHealth } from './RepositoryHealth';

/**
 * Backwards-compatible export for RepositoryHealthSection.
 */
export const RepositoryHealthSection = (props) => {
  return <RepositoryHealth {...props} />;
};

export { RepositoryHealth };
export { HealthProgressMetric } from '../common/HealthProgressMetric';
