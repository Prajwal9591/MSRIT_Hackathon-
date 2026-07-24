import React from 'react';
import { motion } from 'framer-motion';
import { FolderUp } from 'lucide-react';
import { UploadComponent } from '../components/upload/UploadComponent';
import { RepositoryIntelligence } from '../components/upload/RepositoryIntelligence';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';

export const UploadPage = () => {
  const {
    repositoryMetadata,
    isMetadataLoading,
    loadingStep,
    metadataError,
    selectedRepo,
    runAnalysis
  } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderUp className="h-6 w-6 text-cyan-400" /> Repository Upload & Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ingest local source code or clone remote Git repositories to parse call hierarchy graph
          </p>
        </div>

        <Badge variant="info" className="text-xs px-3 py-1">
          AST Call-Graph Parser Active
        </Badge>
      </div>

      {/* Main Upload Box */}
      <UploadComponent />

      {/* Dynamic Repository Intelligence Section */}
      <RepositoryIntelligence
        metadata={repositoryMetadata}
        isLoading={isMetadataLoading}
        loadingStep={loadingStep}
        error={metadataError}
        onLaunchScan={() => {
          if (selectedRepo?.id) {
            runAnalysis(selectedRepo.id);
          }
        }}
      />
    </motion.div>
  );
};
