import React from 'react';
import { motion } from 'framer-motion';
import {
  FileCode,
  Layers,
  Radio
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

/**
 * BlastRadiusPanel (UI placeholder only)
 *
 * Enterprise architectural placeholder panel for Cascading Blast Radius & Change Impact Analysis.
 * Displays target ingestion delta, transitive risk score, cascading impact tiers, and simulation triggers.
 */
export const BlastRadiusPanel = ({
  targetFile = 'src/services/CoreService.ts',
  riskScore = 78,
  riskLevel = 'High',
  impactedFilesCount = 6,
  downstreamCount = 4,
  publicEndpointsCount = 2,
  databaseImpactCount = 1,
  onRunScanClick,
  onSelectFileClick,
  className = ''
}) => {
  const isHighRisk = Number(riskScore) >= 70;
  const isCritical = Number(riskScore) >= 85;

  const getRiskBadgeVariant = () => {
    if (isCritical) return 'critical';
    if (isHighRisk) return 'high';
    if (Number(riskScore) >= 40) return 'warning';
    return 'low';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between ${className}`}
      id="blast-radius-panel"
    >
      {/* 1. Header & Telemetry Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-100">
                Cascading Blast Radius & Change Impact
              </h2>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                RISK ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculates transitive blast radius, downstream dependent services, and breaking API endpoint propagation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={getRiskBadgeVariant()} className="text-[11px] font-mono font-bold px-2.5 py-0.5">
            Risk: {riskScore}/100 ({riskLevel})
          </Badge>
        </div>
      </div>

      {/* 2. Target File Ingestion Banner */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Changed File</span>
            <span className="text-xs font-mono font-bold text-cyan-300 truncate block">{targetFile}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onSelectFileClick && (
            <button
              onClick={onSelectFileClick}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Change Target File
            </button>
          )}
        </div>
      </div>

      {/* 3. Cascading Impact Waves (Visual Diagram Placeholder) */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" /> Cascading Propagation Tiers
          </span>
          <span className="text-[10px] font-mono text-slate-400">4 Architectural Tiers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          {/* Tier 0 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center">
            <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 block">Tier 0: Direct</span>
            <span className="text-xs font-bold text-slate-100 block mt-0.5">1 Changed File</span>
            <span className="text-[10px] text-slate-400 font-mono">AST Delta</span>
          </div>

          {/* Tier 1 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-center">
            <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 block">Tier 1: Callers</span>
            <span className="text-xs font-bold text-slate-100 block mt-0.5">{downstreamCount} Consumers</span>
            <span className="text-[10px] text-slate-400 font-mono">Direct Imports</span>
          </div>

          {/* Tier 2 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-center">
            <span className="text-[9px] uppercase font-mono font-bold text-amber-400 block">Tier 2: Endpoints</span>
            <span className="text-xs font-bold text-slate-100 block mt-0.5">{publicEndpointsCount} Public APIs</span>
            <span className="text-[10px] text-slate-400 font-mono">Route Contracts</span>
          </div>

          {/* Tier 3 */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/40 text-center">
            <span className="text-[9px] uppercase font-mono font-bold text-rose-400 block">Tier 3: Database</span>
            <span className="text-xs font-bold text-slate-100 block mt-0.5">{databaseImpactCount} ORM Tables</span>
            <span className="text-[10px] text-slate-400 font-mono">Schema Boundary</span>
          </div>
        </div>
      </div>

      {/* 4. Cascading Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Impacted</span>
          <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">{impactedFilesCount} Files</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Downstream</span>
          <span className="font-mono font-bold text-indigo-300 text-sm mt-0.5 block">{downstreamCount} Services</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Public Endpoints</span>
          <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">{publicEndpointsCount} Routes</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Breaking Risk</span>
          <span className="font-mono font-bold text-rose-400 text-sm mt-0.5 block">Low (12%)</span>
        </div>
      </div>

      {/* 5. Simulation Action Trigger */}
      {onRunScanClick && (
        <div className="pt-1">
          <Button
            variant="primary"
            icon={Radio}
            onClick={onRunScanClick}
            className="w-full text-xs shadow-lg shadow-cyan-500/20 justify-center"
          >
            Simulate Pull Request Impact & Re-run Blast Radius
          </Button>
        </div>
      )}
    </motion.div>
  );
};
