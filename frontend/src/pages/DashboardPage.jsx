import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisDashboard } from '../components/dashboard/AnalysisDashboard';

export const DashboardPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AnalysisDashboard />
    </motion.div>
  );
};
