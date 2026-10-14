import React from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Layout,
  Server,
  Cpu,
  Database,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * ArchitectureExplorer
 *
 * Layered architectural breakdown and module topology overview.
 * Inspects presentation, domain, API gateway, data access, and infrastructure boundary separation.
 */
export const ArchitectureExplorer = ({
  patternName = 'Modular Clean Architecture',
  couplingRatio = 'Low (0.14)',
  circularity = '0 (Clean)',
  className = ''
}) => {
  const architecturalLayers = [
    {
      id: 'layer-presentation',
      name: 'Presentation & UI Layer',
      path: 'src/components, src/pages',
      icon: Layout,
      color: 'cyan',
      status: 'Decoupled',
      desc: 'View contracts, responsive UI components, and stateful interaction adapters.'
    },
    {
      id: 'layer-api',
      name: 'API & Gateway Layer',
      path: 'src/controllers, src/routes',
      icon: Server,
      color: 'indigo',
      status: 'Protected',
      desc: 'HTTP request handling, route guards, and payload validation.'
    },
    {
      id: 'layer-domain',
      name: 'Business Domain Layer',
      path: 'src/services, src/domain',
      icon: Cpu,
      color: 'purple',
      status: 'Isolated',
      desc: 'Pure business logic, orchestration workflows, and entity invariants.'
    },
    {
      id: 'layer-data',
      name: 'Data Access & ORM',
      path: 'src/db, src/repositories',
      icon: Database,
      color: 'rose',
      status: 'Abstracted',
      desc: 'Database queries, connection pools, and persistence repositories.'
    },
    {
      id: 'layer-infra',
      name: 'DevOps & Infrastructure',
      path: 'docker/, terraform/, .github/',
      icon: Workflow,
      color: 'emerald',
      status: 'Containerized',
      desc: 'Docker manifests, CI/CD pipeline automation, and deployment configurations.'
    }
  ];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between ${className}`}
      id="architecture-explorer-card"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-100">
                Architecture & Domain Boundary Explorer
              </h2>
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                LAYERED TOPOLOGY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Modular boundary inspection, clean architecture layer validation, and coupling ratios.
            </p>
          </div>
        </div>

        <Badge variant="info" className="text-[10px] font-mono self-start sm:self-auto">
          {patternName}
        </Badge>
      </div>

      {/* 2. Architectural Layers List */}
      <div className="space-y-2.5">
        {architecturalLayers.map((layer) => (
          <div
            key={layer.id}
            className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 group-hover:border-cyan-500/50 transition-colors">
                <layer.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{layer.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800 px-1.5 py-0.2 rounded">
                    {layer.path}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{layer.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {layer.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Structural Integrity Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Coupling Ratio</span>
          <span className="font-mono font-bold text-cyan-300 text-xs mt-0.5 block">{couplingRatio}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Circularity</span>
          <span className="font-mono font-bold text-emerald-400 text-xs mt-0.5 block">{circularity}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Flow Discipline</span>
          <span className="font-mono font-bold text-indigo-300 text-xs mt-0.5 block">Unidirectional</span>
        </div>
      </div>
    </motion.div>
  );
};
