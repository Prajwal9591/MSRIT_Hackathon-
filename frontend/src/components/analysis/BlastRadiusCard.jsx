import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Layers,
  Server,
  Globe,
  Database,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Download,
  Share2,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const BlastRadiusCard = () => {
  const { blastRadiusData, showToast } = useApp();
  const [activeLayer, setActiveLayer] = useState(0);

  const layerIcons = [FileCode, Server, Globe, Database];

  const handleExportReport = () => {
    showToast('Exporting Blast Radius Audit Report (PDF/JSON)...', 'info');
    setTimeout(() => {
      showToast('Blast Radius Report saved to downloads.', 'success');
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6"
    >
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-500 animate-pulse" /> Concentric Blast Radius Scope
            </h3>
            <Badge variant="critical" className="text-xs px-2.5">
              Index: {blastRadiusData.overallRiskIndex}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">Cascading impact propagation depth from commit {blastRadiusData.sourceCommit}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Share2} onClick={() => showToast('Shareable link copied to clipboard', 'info')}>
            Share
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportReport}>
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Direct Modified Files</span>
          <span className="text-2xl font-extrabold font-mono text-cyan-400">{blastRadiusData.directImpactCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Downstream Services</span>
          <span className="text-2xl font-extrabold font-mono text-amber-400">{blastRadiusData.downstreamServicesCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Exposed Public APIs</span>
          <span className="text-2xl font-extrabold font-mono text-rose-400">{blastRadiusData.publicEndpointsCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Database Tables</span>
          <span className="text-2xl font-extrabold font-mono text-indigo-400">{blastRadiusData.databaseTablesCount}</span>
        </div>
      </div>

      {/* Concentric Layer Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {blastRadiusData.layers.map((layer, idx) => {
          const Icon = layerIcons[idx % layerIcons.length];
          const isSelected = activeLayer === layer.level;
          return (
            <button
              key={layer.level}
              onClick={() => setActiveLayer(layer.level)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              {isSelected && (
                <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />
              )}
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <Badge variant={layer.riskColor} className="text-[9px] px-1.5 py-0">
                  {layer.items.length} Items
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-slate-200 truncate">{layer.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{layer.description}</p>
            </button>
          );
        })}
      </div>

      {/* Detailed Layer Items Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Layer {activeLayer}: {blastRadiusData.layers[activeLayer]?.name}
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {blastRadiusData.layers[activeLayer]?.description}
          </span>
        </div>

        <div className="space-y-2">
          {blastRadiusData.layers[activeLayer]?.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-100 font-mono block">{item.name}</span>
                  <span className="text-[11px] text-slate-400">{item.detail}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  {item.type}
                </span>
                <Badge
                  variant={
                    item.impact === 'Critical'
                      ? 'critical'
                      : item.impact === 'High'
                      ? 'high'
                      : item.impact === 'Medium'
                      ? 'medium'
                      : 'low'
                  }
                  className="text-[10px]"
                >
                  {item.impact} Impact
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
