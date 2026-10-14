import React, { useState } from 'react';
import {
  Network,
  List,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Shield,
  Lock,
  Database,
  Settings,
  FolderTree
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DependencyCallGraphCard = ({
  onSelectNode,
  className = ''
}) => {
  const { setSelectedFile, showToast } = useApp();
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'list'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('AppController');

  const nodes = [
    {
      id: 'AppController',
      name: 'AppController',
      path: 'src/api',
      fullPath: 'src/api/controller/AppController.ts',
      icon: Layers,
      type: 'controller',
      borderColor: 'border-[#3b82f6]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      iconBg: 'bg-[#1d4ed8]/30 text-[#60a5fa]',
      badgeBg: 'bg-[#1e293b]',
      textColor: 'text-white',
      x: 50, // %
      y: 18,
      risk: 'High',
      directDeps: ['AuthService'],
      indirectDeps: ['UserService', 'UserRepository', 'Config', 'Database']
    },
    {
      id: 'UserService',
      name: 'UserService',
      path: 'src/services',
      fullPath: 'src/services/UserService.ts',
      icon: Shield,
      type: 'service',
      borderColor: 'border-[#10b981]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      iconBg: 'bg-[#065f46]/40 text-[#34d399]',
      badgeBg: 'bg-[#06261f]',
      textColor: 'text-white',
      x: 18,
      y: 44,
      risk: 'Medium',
      directDeps: ['UserRepository'],
      indirectDeps: ['Database']
    },
    {
      id: 'AuthService',
      name: 'AuthService',
      path: 'src/services',
      fullPath: 'src/services/AuthService.ts',
      icon: Lock,
      type: 'service',
      borderColor: 'border-[#3b82f6]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      iconBg: 'bg-[#1d4ed8]/30 text-[#60a5fa]',
      badgeBg: 'bg-[#1e293b]',
      textColor: 'text-white',
      x: 50,
      y: 50,
      risk: 'Medium',
      directDeps: ['UserService', 'Config', 'UserRepository'],
      indirectDeps: ['Database']
    },
    {
      id: 'UserRepository',
      name: 'UserRepository',
      path: 'src/repositories',
      fullPath: 'src/repositories/UserRepository.ts',
      icon: FolderTree,
      type: 'repository',
      borderColor: 'border-[#f59e0b]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      iconBg: 'bg-[#78350f]/40 text-[#fbbf24]',
      badgeBg: 'bg-[#291807]',
      textColor: 'text-white',
      x: 82,
      y: 44,
      risk: 'Low',
      directDeps: ['Database'],
      indirectDeps: []
    },
    {
      id: 'Config',
      name: 'Config',
      path: 'src/config',
      fullPath: 'src/config/index.ts',
      icon: Settings,
      type: 'config',
      borderColor: 'border-[#a855f7]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      iconBg: 'bg-[#581c87]/40 text-[#c084fc]',
      badgeBg: 'bg-[#2e1065]',
      textColor: 'text-white',
      x: 20,
      y: 78,
      risk: 'Low',
      directDeps: [],
      indirectDeps: []
    },
    {
      id: 'Database',
      name: 'Database',
      path: 'src/db',
      fullPath: 'src/db/connection.ts',
      icon: Database,
      type: 'database',
      borderColor: 'border-[#ef4444]',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      iconBg: 'bg-[#7f1d1d]/40 text-[#f87171]',
      badgeBg: 'bg-[#450a0a]',
      textColor: 'text-white',
      x: 80,
      y: 78,
      risk: 'Low',
      directDeps: [],
      indirectDeps: []
    }
  ];

  const handleZoomIn = () => setZoomLevel((z) => Math.min(160, z + 15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(70, z - 15));
  const handleResetZoom = () => setZoomLevel(100);

  const handleNodeClick = (node) => {
    setSelectedNodeId(node.id);
    if (setSelectedFile) {
      setSelectedFile({
        path: node.fullPath,
        name: node.name,
        risk: node.risk
      });
    }
    showToast(`Selected ${node.name} (${node.path})`, 'info');
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div
      id="dependency-call-graph-card"
      className={`bg-[#0c1322] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#0c1322]/98' : ''
      } ${className}`}
    >
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0f2847] border border-[#1e3a5f] text-[#38bdf8]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Dependency & Call Graph
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Visualize how components depend on each other
            </p>
          </div>
        </div>

        {/* View Switcher Pills & Fullscreen */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#101a2e] border border-[#233554] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'graph'
                  ? 'bg-[#1d4ed8] text-white shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Graph</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-[#1d4ed8] text-white shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="p-1.5 bg-[#101a2e] hover:bg-[#16233d] border border-[#233554] text-[#94a3b8] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      {viewMode === 'graph' ? (
        <div className="relative mt-4 w-full h-[380px] sm:h-[420px] rounded-xl bg-[#070d19] border border-[#172540] overflow-hidden select-none">
          {/* Subtle Blueprint Dot Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" width="100%" height="100%">
            <defs>
              <pattern id="graph-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="#38bdf8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid-dots)" />
          </svg>

          {/* SVG Connecting Arrows / Paths */}
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Arrow markers */}
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-dashed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="arrow-solid" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
                </marker>
              </defs>

              {/* 1. AppController (500, 110) <-> AuthService (500, 300) : Bidirectional vertical arrow */}
              <line
                x1="500"
                y1="140"
                x2="500"
                y2="270"
                stroke="#38bdf8"
                strokeWidth="2"
                markerStart="url(#arrow-blue)"
                markerEnd="url(#arrow-blue)"
              />

              {/* 2. AuthService (500, 300) -> UserService (180, 260) : Dashed curve */}
              <path
                d="M 440 290 C 330 270, 270 260, 240 260"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.75"
                strokeDasharray="5,4"
                markerEnd="url(#arrow-dashed)"
              />

              {/* 3. AuthService (500, 300) -> Config (200, 470) : Solid curved link */}
              <path
                d="M 440 320 C 320 370, 240 400, 220 440"
                fill="none"
                stroke="#475569"
                strokeWidth="1.75"
                markerEnd="url(#arrow-solid)"
              />

              {/* 4. AuthService (500, 300) -> UserRepository (820, 260) : Solid curved link */}
              <path
                d="M 560 300 C 660 290, 720 270, 760 265"
                fill="none"
                stroke="#475569"
                strokeWidth="1.75"
                markerEnd="url(#arrow-solid)"
              />

              {/* 5. UserRepository (820, 260) -> Database (800, 470) : Solid curved link */}
              <path
                d="M 820 295 C 830 350, 820 400, 800 440"
                fill="none"
                stroke="#475569"
                strokeWidth="1.75"
                markerEnd="url(#arrow-solid)"
              />
            </svg>

            {/* Render Component Node Badges */}
            {nodes.map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-10`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    className={`bg-[#0d1627] border ${node.borderColor} ${node.bgGlow} rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg min-w-[130px] sm:min-w-[155px] ${
                      isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${node.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-[13px] font-bold text-white tracking-tight">
                        {node.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {node.path}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: Legend on Left, Zoom Controls on Right */}
          <div className="absolute bottom-0 inset-x-0 bg-[#09101f]/90 backdrop-blur-sm border-t border-[#172540] px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#94a3b8]">
            {/* Legend */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#38bdf8] rounded-sm inline-block" />
                <span>Direct dependency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-b-2 border-dashed border-slate-400 inline-block" />
                <span>Indirect dependency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-b-2 border-dotted border-slate-500 inline-block" />
                <span>External library</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                Zoom: {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 bg-[#101a2e] hover:bg-[#16233d] border border-[#233554] text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 bg-[#101a2e] hover:bg-[#16233d] border border-[#233554] text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1 bg-[#101a2e] hover:bg-[#16233d] border border-[#233554] text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="mt-4 rounded-xl bg-[#070d19] border border-[#172540] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1424] text-slate-400 border-b border-[#1e293b]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Component</th>
                <th className="px-4 py-2.5 font-medium">Path</th>
                <th className="px-4 py-2.5 font-medium">Direct Dependencies</th>
                <th className="px-4 py-2.5 font-medium">Indirect</th>
                <th className="px-4 py-2.5 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172540]">
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <tr
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className="hover:bg-[#0e192f] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 font-semibold text-white flex items-center gap-2">
                      <div className={`p-1 rounded ${node.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{node.name}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">{node.path}</td>
                    <td className="px-4 py-2.5 text-slate-300">
                      {node.directDeps.length > 0 ? node.directDeps.join(', ') : 'None'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {node.indirectDeps.length > 0 ? node.indirectDeps.join(', ') : 'None'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          node.risk === 'High'
                            ? 'bg-[#450a0a] text-[#f87171] border border-[#7f1d1d]'
                            : node.risk === 'Medium'
                            ? 'bg-[#291807] text-[#fbbf24] border border-[#78350f]'
                            : 'bg-[#06261f] text-[#34d399] border border-[#065f46]'
                        }`}
                      >
                        {node.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
