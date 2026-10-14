import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Search,
  ArrowRight,
  Filter,
  FileCode,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const DependencyIndexCard = ({ onNextStep, onSelectFileForBlast }) => {
  const {
    dependencyNodes,
    dependencyEdges,
    selectedFile,
    setSelectedFile,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayerFilter, setSelectedLayerFilter] = useState('ALL');

  const nodes = useMemo(() => dependencyNodes || [], [dependencyNodes]);
  const edges = useMemo(() => dependencyEdges || [], [dependencyEdges]);

  // Filter nodes by query and layer
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchQuery =
        !searchQuery ||
        (node.label && node.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.path && node.path.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.category && node.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLayer =
        selectedLayerFilter === 'ALL' ||
        String(node.layerIndex) === String(selectedLayerFilter);

      return matchQuery && matchLayer;
    });
  }, [nodes, searchQuery, selectedLayerFilter]);

  const handlePickNode = (node) => {
    if (onSelectFileForBlast) {
      onSelectFileForBlast(node.path || node.id);
    } else {
      setSelectedFile({
        path: node.path || node.id,
        name: node.label || node.path?.split('/').pop(),
        status: 'modified',
        additions: 42,
        deletions: 12,
        risk: node.risk || 'High',
        impactReason: `Direct selection from repository dependency index.`,
        functionsModified: node.functions || ['handleOperation']
      });
      showToast(`Selected '${node.label || node.path}' as modified file for blast analysis`, 'success');
      if (onNextStep) onNextStep();
    }
  };

  const getLayerBadge = (layerIndex) => {
    switch (Number(layerIndex)) {
      case 0:
        return { label: 'Layer 0 (Origin)', variant: 'critical' };
      case 1:
        return { label: 'Layer 1 (Direct Dependent)', variant: 'warning' };
      case 2:
        return { label: 'Layer 2 (Downstream API)', variant: 'info' };
      case 3:
        return { label: 'Layer 3 (Database/DB)', variant: 'neutral' };
      default:
        return { label: `Layer ${layerIndex}`, variant: 'neutral' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6"
      id="dependency-index-section"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Network className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                STEP 3 OF 7
              </span>
              <h3 className="text-lg font-bold text-slate-100">Repository Dependency Index</h3>
              <Badge variant="info" className="text-[10px] font-mono">
                {nodes.length} Symbols Indexed • {edges.length} Call Edges
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Full symbol table, import/export dependency map, and callers/callees matrix across all modules
            </p>
          </div>
        </div>

        {onNextStep && (
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={onNextStep}
            className="shrink-0"
          >
            Select Changed File →
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indexed files, exports, or functions..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Layer Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Layer:
          </span>
          {[
            { id: 'ALL', label: `All (${nodes.length})` },
            { id: '0', label: 'L0 Origin' },
            { id: '1', label: 'L1 Direct' },
            { id: '2', label: 'L2 Downstream' },
            { id: '3', label: 'L3 DB/Infra' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLayerFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLayerFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indexed Files Table / Grid */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
        {filteredNodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
            No indexed symbols matching query &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredNodes.map((node, idx) => {
            const isSelected = selectedFile?.path === node.path || (idx === 0 && !selectedFile);
            const layerBadge = getLayerBadge(node.layerIndex);

            return (
              <div
                key={node.id || idx}
                onClick={() => handlePickNode(node)}
                className={`group p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl border shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 font-mono truncate">
                        {node.label || node.name || node.path}
                      </span>
                      <Badge variant={layerBadge.variant} className="text-[9px] py-0 px-1.5">
                        {layerBadge.label}
                      </Badge>
                      {node.category && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{node.category}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {node.path}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
                    Risk: <strong className="text-amber-300">{node.risk || 'Medium'}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickNode(node);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-cyan-600 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Active Target' : 'Select for Blast Radius'}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
