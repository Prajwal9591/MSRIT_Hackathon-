import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Search,
  Maximize2,
  ArrowRight,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { Button } from '../common/Button';

/**
 * DependencyGraphPanel (UI placeholder only)
 *
 * Enterprise architectural placeholder panel for the Interactive Dependency Graph & AST Call Graph.
 * Provides rich interactive toolbar controls, layer filtering, graph topology canvas, and structural metrics.
 */
export const DependencyGraphPanel = ({
  nodesCount = 0,
  edgesCount = 0,
  layersCount = 5,
  circularCount = 0,
  onExploreClick,
  className = ''
}) => {
  const [selectedLayer, setSelectedLayer] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [topologicalView, setTopologicalView] = useState(true);

  const displayNodesCount = nodesCount > 0 ? nodesCount : 28;
  const displayEdgesCount = edgesCount > 0 ? edgesCount : 42;

  const layers = [
    { id: 'ALL', label: 'All Layers' },
    { id: 'CONTROLLER', label: 'Controllers' },
    { id: 'SERVICE', label: 'Services' },
    { id: 'DOMAIN', label: 'Domain' },
    { id: 'REPOSITORY', label: 'Repositories' },
    { id: 'INFRA', label: 'Infrastructure' }
  ];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between ${className}`}
      id="dependency-graph-panel"
    >
      {/* 1. Header & Telemetry Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-100">
                Dependency Graph & AST Call Graph
              </h2>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                AST ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive directed call graph, circular dependency detection, and architectural layer isolation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onExploreClick && (
            <Button
              variant="outline"
              size="sm"
              icon={Maximize2}
              onClick={onExploreClick}
              className="text-xs"
            >
              Open Full Graph
            </Button>
          )}
        </div>
      </div>

      {/* 2. Interactive Toolbar & Layer Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-cyan-400" /> Layer:
          </span>
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all ${
                selectedLayer === layer.id
                  ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search AST nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 sm:w-36 font-mono"
            />
          </div>

          <button
            onClick={() => setTopologicalView(!topologicalView)}
            title="Toggle Topological Sort Layout"
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              topologicalView
                ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-slate-400">
            <button title="Zoom In" className="p-1 hover:text-slate-200 rounded-lg hover:bg-slate-800">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button title="Zoom Out" className="p-1 hover:text-slate-200 rounded-lg hover:bg-slate-800">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button title="Reset Viewport" className="p-1 hover:text-slate-200 rounded-lg hover:bg-slate-800">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Visual Graph Canvas Area (UI Placeholder) */}
      <div className="relative h-60 sm:h-64 w-full rounded-2xl bg-slate-950/90 border border-slate-800/90 overflow-hidden flex flex-col items-center justify-center p-4 group">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Mock visual architecture graph nodes representation */}
        <div className="relative z-10 w-full max-w-lg flex items-center justify-between gap-2 sm:gap-4 px-2 py-4">
          {/* Node 1: API / Controller */}
          <div className="flex flex-col items-center space-y-1">
            <div className="px-3 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 shadow-md shadow-cyan-500/10 text-center">
              <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 block">Layer 1: Entry</span>
              <span className="text-xs font-mono font-bold text-slate-100">AppController</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">/api/v1/auth</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-400" />
            <ArrowRight className="h-3.5 w-3.5 text-indigo-400 absolute right-0" />
          </div>

          {/* Node 2: Core Domain Service */}
          <div className="flex flex-col items-center space-y-1">
            <div className="px-3 py-2 rounded-xl bg-indigo-950/90 border border-indigo-500/50 shadow-md shadow-indigo-500/10 text-center">
              <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 block">Layer 2: Domain</span>
              <span className="text-xs font-mono font-bold text-slate-100">AuthService</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">verifySession()</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400 absolute right-0" />
          </div>

          {/* Node 3: Data Access Repository */}
          <div className="flex flex-col items-center space-y-1">
            <div className="px-3 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 shadow-md shadow-emerald-500/10 text-center">
              <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 block">Layer 3: Data</span>
              <span className="text-xs font-mono font-bold text-slate-100">UserRepository</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PostgresPool</span>
          </div>
        </div>

        {/* Overlay Placeholder Status Indicator */}
        <div className="mt-2 text-center relative z-10 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
            AST Call Graph Engine ready — direct and transitive dependencies mapped dynamically upon ingestion.
          </p>
        </div>
      </div>

      {/* 4. Graph Telemetry Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Nodes</span>
          <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">{displayNodesCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Edges</span>
          <span className="font-mono font-bold text-indigo-300 text-sm mt-0.5 block">{displayEdgesCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Layers</span>
          <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">{layersCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Circularity</span>
          <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{circularCount} (Clean)</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Isolation</span>
          <span className="font-mono font-bold text-teal-300 text-sm mt-0.5 block">94%</span>
        </div>
      </div>
    </motion.div>
  );
};
