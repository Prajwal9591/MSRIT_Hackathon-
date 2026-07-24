import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  FileCode,
  Code2,
  Box,
  Server,
  Database,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const DependencyGraph = () => {
  const { showToast } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'file' | 'function' | 'class' | 'service'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Nodes (Files, Functions, Classes, Services)
  const nodes = [
    {
      id: 'node-stripe-file',
      label: 'StripeWebhookHandler.ts',
      type: 'file',
      nodeType: 'File',
      category: 'Source File',
      layer: 'L0 (Origin)',
      risk: 'Critical',
      riskScore: 92,
      path: 'src/services/StripeWebhookHandler.ts',
      details: 'Primary modified source file containing payment intent webhook logic.'
    },
    {
      id: 'node-func-handle',
      label: 'handlePaymentIntentSucceeded()',
      type: 'function',
      nodeType: 'Function',
      category: 'Async Method',
      layer: 'L0 (Origin)',
      risk: 'Critical',
      riskScore: 95,
      path: 'src/services/StripeWebhookHandler.ts#L9',
      details: 'Executes transaction ledger inserts & locks Redis mutexes.'
    },
    {
      id: 'node-class-guard',
      label: 'AuthenticationGuard',
      type: 'class',
      nodeType: 'Class',
      category: 'Security Class',
      layer: 'L1 (Direct)',
      risk: 'Critical',
      riskScore: 88,
      path: 'src/middleware/AuthenticationGuard.ts',
      details: 'Validates cryptographic JWT tokens and session headers.'
    },
    {
      id: 'node-func-validate',
      label: 'validateToken()',
      type: 'function',
      nodeType: 'Function',
      category: 'Member Function',
      layer: 'L1 (Direct)',
      risk: 'High',
      riskScore: 80,
      path: 'src/middleware/AuthenticationGuard.ts#L7',
      details: 'Checks authorization token string length and secret signatures.'
    },
    {
      id: 'node-class-ledger',
      label: 'TransactionLedger',
      type: 'class',
      nodeType: 'Class',
      category: 'ORM Model Class',
      layer: 'L1 (Direct)',
      risk: 'Medium',
      riskScore: 65,
      path: 'src/database/models/TransactionLedger.ts',
      details: 'Interacts with PostgreSQL database transaction ledger table.'
    },
    {
      id: 'node-service-payment',
      label: 'payment-gateway-service',
      type: 'service',
      nodeType: 'Service',
      category: 'Node.js Microservice',
      layer: 'L2 (Downstream)',
      risk: 'High',
      riskScore: 78,
      path: 'services/payment-gateway',
      details: 'Ingress service handling external webhook HTTP requests.'
    },
    {
      id: 'node-service-order',
      label: 'order-processing-service',
      type: 'service',
      nodeType: 'Service',
      category: 'Go Microservice',
      layer: 'L2 (Downstream)',
      risk: 'High',
      riskScore: 74,
      path: 'services/order-processing',
      details: 'Event driven worker service listening for ledger creation events.'
    },
    {
      id: 'node-db-postgres',
      label: 'PostgreSQL Ledger DB',
      type: 'service',
      nodeType: 'Service',
      category: 'Database Cluster',
      layer: 'L3 (Database Lock)',
      risk: 'Critical',
      riskScore: 96,
      path: 'db/transaction_ledgers',
      details: 'Holds primary transaction ledger write locks.'
    }
  ];

  // Edges (Imports, Calls, Dependencies)
  const edges = [
    { source: 'node-stripe-file', target: 'node-func-handle', relationship: 'Calls', type: 'call', label: 'defines method' },
    { source: 'node-stripe-file', target: 'node-class-guard', relationship: 'Imports', type: 'import', label: 'imports class' },
    { source: 'node-func-handle', target: 'node-func-validate', relationship: 'Calls', type: 'call', label: 'invokes validateToken()' },
    { source: 'node-stripe-file', target: 'node-class-ledger', relationship: 'Dependencies', type: 'dependency', label: 'instantiates ledger' },
    { source: 'node-service-payment', target: 'node-stripe-file', relationship: 'Calls', type: 'call', label: 'routes HTTP POST' },
    { source: 'node-func-handle', target: 'node-service-order', relationship: 'Dependencies', type: 'dependency', label: 'triggers gRPC event' },
    { source: 'node-class-ledger', target: 'node-db-postgres', relationship: 'Dependencies', type: 'dependency', label: 'executes SQL write lock' }
  ];

  // Standard positions on graph canvas
  const nodePositions = {
    'node-service-payment': { x: 100, y: 200 },
    'node-stripe-file': { x: 300, y: 200 },
    'node-func-handle': { x: 480, y: 120 },
    'node-class-guard': { x: 480, y: 280 },
    'node-func-validate': { x: 660, y: 280 },
    'node-class-ledger': { x: 660, y: 120 },
    'node-service-order': { x: 840, y: 100 },
    'node-db-postgres': { x: 840, y: 260 }
  };

  const filteredNodes = nodes.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getNodeIcon = (type) => {
    switch (type) {
      case 'file': return <FileCode className="h-4 w-4 text-cyan-400" />;
      case 'function': return <Code2 className="h-4 w-4 text-emerald-400" />;
      case 'class': return <Box className="h-4 w-4 text-amber-400" />;
      case 'service': return <Server className="h-4 w-4 text-indigo-400" />;
      default: return <FileCode className="h-4 w-4 text-cyan-400" />;
    }
  };

  const getNodeBadgeColor = (risk) => {
    if (risk === 'Critical') return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (risk === 'High') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" /> Interactive Blast Radius Call-Graph Canvas
          </h3>
          <p className="text-xs text-slate-400">Click any node to inspect AST metadata, callers, and risk impact propagation</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search AST node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 w-36"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Node Types</option>
            <option value="file">Files Only</option>
            <option value="function">Functions Only</option>
            <option value="class">Classes Only</option>
            <option value="service">Services & DB Only</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1.5">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Metadata Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Box */}
        <div className="lg:col-span-3 relative h-[440px] rounded-2xl bg-slate-950/95 border border-slate-800 overflow-hidden">
          {/* Canvas Legend Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1"><FileCode className="h-3 w-3 text-cyan-400" /> Files</span>
            <span className="flex items-center gap-1"><Code2 className="h-3 w-3 text-emerald-400" /> Functions</span>
            <span className="flex items-center gap-1"><Box className="h-3 w-3 text-amber-400" /> Classes</span>
            <span className="flex items-center gap-1"><Server className="h-3 w-3 text-indigo-400" /> Services</span>
            <span className="text-rose-400 animate-pulse font-bold">• Impacted Edge Traversal</span>
          </div>

          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="0 0 980 440"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* Edges with Animated Particle Traversal */}
            {edges.map((edge, idx) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2 + (idx % 2 === 0 ? -20 : 20);

              return (
                <g key={idx}>
                  <path
                    d={`M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`}
                    fill="none"
                    stroke={edge.type === 'dependency' ? '#f43f5e' : edge.type === 'call' ? '#10b981' : '#38bdf8'}
                    strokeWidth="2"
                    strokeDasharray={edge.type === 'dependency' ? '4 2' : 'none'}
                    markerEnd="url(#arrowhead)"
                    className="opacity-60"
                  />

                  {/* Relationship Label Pill */}
                  <rect
                    x={midX - 25}
                    y={midY - 8}
                    width="50"
                    height="14"
                    rx="4"
                    fill="#0f172a"
                    stroke="#1e293b"
                  />
                  <text
                    x={midX}
                    y={midY + 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    className="text-[8px] font-mono font-semibold"
                  >
                    {edge.relationship}
                  </text>

                  {/* Animated Traversal Particle */}
                  <circle r="3.5" fill={edge.type === 'dependency' ? '#f43f5e' : '#38bdf8'}>
                    <animateMotion
                      path={`M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 200, y: 200 };
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all"
                >
                  {/* Outer Pulsing Impact Aura Glow */}
                  <circle
                    r={isSelected ? '32' : '26'}
                    fill={node.risk === 'Critical' ? '#f43f5e' : node.risk === 'High' ? '#f59e0b' : '#6366f1'}
                    opacity={isSelected ? '0.4' : '0.2'}
                    className="animate-pulse"
                  />

                  {/* Inner Node Shape */}
                  <rect
                    x="-20"
                    y="-20"
                    width="40"
                    height="40"
                    rx="12"
                    fill="#090d16"
                    stroke={isSelected ? '#38bdf8' : node.risk === 'Critical' ? '#f43f5e' : '#334155'}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Node Type Layer Badge */}
                  <rect
                    x="-30"
                    y="-34"
                    width="60"
                    height="12"
                    rx="4"
                    fill="#0f172a"
                    stroke="#1e293b"
                  />
                  <text
                    x="0"
                    y="-25"
                    textAnchor="middle"
                    fill={node.risk === 'Critical' ? '#f43f5e' : '#38bdf8'}
                    className="text-[8px] font-mono font-bold uppercase"
                  >
                    {node.layer.split(' ')[0]}
                  </text>

                  {/* Label background pill */}
                  <rect
                    x="-75"
                    y="26"
                    width="150"
                    height="22"
                    rx="8"
                    fill="#0f172a"
                    stroke="#1e293b"
                    className="shadow-xl"
                  />
                  <text
                    x="0"
                    y="41"
                    textAnchor="middle"
                    fill="#f1f5f9"
                    className="text-[10px] font-mono font-semibold"
                  >
                    {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  {getNodeIcon(selectedNode.type)}
                  <span className="text-xs font-mono font-bold text-slate-200">{selectedNode.nodeType} Inspector</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getNodeBadgeColor(selectedNode.risk)}`}>
                  {selectedNode.risk} ({selectedNode.riskScore}/100)
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 font-mono truncate">{selectedNode.label}</h4>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{selectedNode.path}</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Impact Layer:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedNode.layer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AST Category:</span>
                  <span className="font-mono text-slate-200">{selectedNode.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Node ID:</span>
                  <span className="font-mono text-slate-400">{selectedNode.id}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Architectural Rationale</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {selectedNode.details}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-12 text-slate-500 space-y-2">
              <Info className="h-8 w-8 text-slate-600 animate-bounce" />
              <p className="text-xs text-slate-400 font-medium">Click any node on the graph canvas to inspect AST metadata & calls</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              AegisBlast React Flow AST Visualizer v3.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
