import React from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

// Database probe items
const DB_ITEMS = [
  { label: 'MongoDB', key: 'mongodb' },
  { label: 'MySQL', key: 'mysql' },
  { label: 'PostgreSQL', key: 'postgresql' },
  { label: 'SQLite', key: 'sqlite' },
  { label: 'Redis', key: 'redis' },
  { label: 'Supabase', key: 'supabase' },
  { label: 'Firebase', key: 'firebase' },
  { label: 'Prisma', key: 'prisma' },
  { label: 'Drizzle', key: 'drizzle' },
  { label: 'TypeORM', key: 'typeorm' }
];

// DevOps & Container items
const DEVOPS_ITEMS = [
  { label: 'Dockerfile', key: 'dockerfile' },
  { label: 'docker-compose', key: 'dockerCompose' },
  { label: 'GitHub Actions', key: 'githubActions' },
  { label: 'GitLab CI', key: 'gitlabCi' },
  { label: 'Jenkins', key: 'jenkins' },
  { label: 'Terraform', key: 'terraform' },
  { label: 'Kubernetes', key: 'kubernetes' },
  { label: 'Helm Charts', key: 'helmCharts' },
  { label: 'Nginx', key: 'nginx' },
  { label: 'Apache', key: 'apache' }
];

/**
 * InfrastructureDetection
 *
 * Dedicated combined probe grid for database ORM and DevOps CI/CD manifests.
 */
export const InfrastructureDetection = ({
  database = {},
  infrastructure = {},
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`} id="infrastructure-detection-grid">
      {/* 1. Database & ORM Probe */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
        id="database-detection-card"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" /> Database Detection
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">ORM & Data Store Probe</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DB_ITEMS.map((item) => {
            const detected = Boolean(database[item.key]);
            return (
              <Tooltip
                key={item.key}
                title={`${item.label} Database`}
                content={
                  detected
                    ? `${item.label} ORM or driver detected in project imports.`
                    : `${item.label} was not detected in active dependencies.`
                }
                position="top"
                className="w-full"
              >
                <div
                  className={`p-3 rounded-2xl border text-center transition-all w-full cursor-help ${
                    detected
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="block text-[11px] font-semibold truncate">
                    {item.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold mt-1">
                    {detected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-cyan-400" /> Detected
                      </>
                    ) : (
                      'Not Found'
                    )}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>

      {/* 2. DevOps & Infrastructure Probe */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
        id="devops-detection-card"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-cyan-400" /> DevOps Detection
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">CI/CD & Container Manifests</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DEVOPS_ITEMS.map((item) => {
            const detected = Boolean(infrastructure[item.key]);
            return (
              <Tooltip
                key={item.key}
                title={`${item.label} Infrastructure`}
                content={
                  detected
                    ? `${item.label} configuration detected in container/server manifests.`
                    : `${item.label} was not found in repository manifests.`
                }
                position="top"
                className="w-full"
              >
                <div
                  className={`p-3 rounded-2xl border text-center transition-all w-full cursor-help ${
                    detected
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="block text-[11px] font-semibold truncate">
                    {item.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold mt-1">
                    {detected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Detected
                      </>
                    ) : (
                      'Not Found'
                    )}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
