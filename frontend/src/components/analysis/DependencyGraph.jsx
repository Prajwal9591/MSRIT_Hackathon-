import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  FileCode,
  FolderUp,
  X,
  Zap,
  Server,
  Database,
  Code2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

// Layer and category color styling definitions
const LAYER_CONFIG = {
  0: {
    label: 'Entry / Controllers (L0)',
    shortLabel: 'Entry / L0',
    color: '#38bdf8', // Cyan / Sky
    bgClass: 'bg-cyan-950/80',
    borderClass: 'border-cyan-500/60',
    textClass: 'text-cyan-300',
    badgeVariant: 'info',
    icon: Server
  },
  1: {
    label: 'Services / Domain (L1)',
    shortLabel: 'Services / L1',
    color: '#818cf8', // Indigo
    bgClass: 'bg-indigo-950/80',
    borderClass: 'border-indigo-500/60',
    textClass: 'text-indigo-300',
    badgeVariant: 'info',
    icon: Code2
  },
  2: {
    label: 'Repositories / Data (L2)',
    shortLabel: 'Data / L2',
    color: '#34d399', // Emerald
    bgClass: 'bg-emerald-950/80',
    borderClass: 'border-emerald-500/60',
    textClass: 'text-emerald-300',
    badgeVariant: 'success',
    icon: Database
  },
  3: {
    label: 'Utilities / Shared (L3)',
    shortLabel: 'Utils / L3',
    color: '#fbbf24', // Amber
    bgClass: 'bg-amber-950/80',
    borderClass: 'border-amber-500/60',
    textClass: 'text-amber-300',
    badgeVariant: 'warning',
    icon: FileCode
  }
};

const DEFAULT_LAYER_CONFIG = {
  label: 'Module / Helper',
  shortLabel: 'Module',
  color: '#94a3b8',
  bgClass: 'bg-slate-900',
  borderClass: 'border-slate-700',
  textClass: 'text-slate-300',
  badgeVariant: 'neutral',
  icon: FileCode
};

export const DependencyGraph = ({ className = '' }) => {
  const {
    selectedRepo,
    repositoryMetadata,
    dependencyNodes = [],
    dependencyEdges = [],
    selectedFile,
    selectChangedFile,
    runAnalysis,
    setActiveTab,
    showToast
  } = useApp();

  // Container & Canvas references
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const simulationRef = useRef(null);

  // Layout & UI State
  const [layoutMode, setLayoutMode] = useState('concentric'); // 'concentric' | 'force' | 'hierarchical'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayerFilter, setSelectedLayerFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [tooltipData, setTooltipData] = useState({ visible: false, x: 0, y: 0, node: null });
  const [dimensions, setDimensions] = useState({ width: 920, height: 560 });

  // 1. Prepare and normalize nodes & edges
  const activeChangedFilePath = useMemo(() => {
    if (selectedFile?.path) return selectedFile.path;
    if (typeof selectedFile === 'string') return selectedFile;
    return null;
  }, [selectedFile]);

  // Derive master node list
  const masterNodes = useMemo(() => {
    if (dependencyNodes && dependencyNodes.length > 0) {
      return dependencyNodes.map((n, idx) => {
        const layerIdx = typeof n.layerIndex === 'number' ? n.layerIndex : (idx % 4);
        const isTarget = activeChangedFilePath && (n.path === activeChangedFilePath || n.id === activeChangedFilePath);
        return {
          id: n.id || n.path || `node-${idx}`,
          name: n.label || n.name || (n.path ? n.path.split(/[/\\]/).pop() : `module-${idx}`),
          path: n.path || n.fullName || n.id || `src/module_${idx}.ts`,
          type: n.type || n.category || 'module',
          category: n.category || n.nodeType || 'Source Module',
          layer: n.layer || `Layer ${layerIdx}`,
          layerIndex: layerIdx,
          risk: n.risk || 'Medium',
          riskScore: n.riskScore || (isTarget ? 88 : 50),
          callers: n.callers || [],
          callees: n.callees || n.imports || [],
          isTarget: Boolean(isTarget)
        };
      });
    }

    // Fallback: scanned files from repository if available
    const files = selectedRepo?.scannedFiles || repositoryMetadata?.scannedFiles || [];
    if (files.length > 0) {
      return files.slice(0, 30).map((f, idx) => {
        const p = typeof f === 'string' ? f : (f.path || f.name || `src/file_${idx}.ts`);
        const fileName = p.split(/[/\\]/).pop() || p;
        const layerIdx = p.includes('controller') || p.includes('route') ? 0 :
                         p.includes('service') || p.includes('domain') ? 1 :
                         p.includes('repo') || p.includes('db') || p.includes('model') ? 2 : 3;
        const isTarget = activeChangedFilePath && p === activeChangedFilePath;
        return {
          id: p,
          name: fileName,
          path: p,
          type: 'file',
          category: layerIdx === 0 ? 'Controller' : layerIdx === 1 ? 'Service' : layerIdx === 2 ? 'Data Repository' : 'Helper Utility',
          layer: `Layer ${layerIdx}`,
          layerIndex: layerIdx,
          risk: isTarget ? 'Critical' : 'Medium',
          riskScore: isTarget ? 85 : 55,
          callers: [],
          callees: [],
          isTarget: Boolean(isTarget)
        };
      });
    }

    return [];
  }, [dependencyNodes, selectedRepo, repositoryMetadata, activeChangedFilePath]);

  // Derive master edges list
  const masterEdges = useMemo(() => {
    if (dependencyEdges && dependencyEdges.length > 0 && masterNodes.length > 0) {
      const nodeIds = new Set(masterNodes.map(n => n.id));
      return dependencyEdges
        .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e, idx) => ({
          id: e.id || `edge-${idx}`,
          source: e.source,
          target: e.target,
          label: e.label || 'imports',
          relationshipType: e.relationshipType || 'call',
          impactLevel: e.impactLevel || 'normal'
        }));
    }

    // Fallback: synthetic edges connecting layers sequentially
    if (masterNodes.length > 1) {
      const edges = [];
      for (let i = 0; i < masterNodes.length - 1; i++) {
        const source = masterNodes[i];
        const nextNode = masterNodes[i + 1];
        edges.push({
          id: `fallback-edge-${i}`,
          source: source.id,
          target: nextNode.id,
          label: 'imports',
          relationshipType: 'call',
          impactLevel: 'normal'
        });
        if (i + 2 < masterNodes.length && i % 2 === 0) {
          edges.push({
            id: `fallback-edge-${i}-skip`,
            source: source.id,
            target: masterNodes[i + 2].id,
            label: 'calls',
            relationshipType: 'call',
            impactLevel: 'normal'
          });
        }
      }
      return edges;
    }

    return [];
  }, [dependencyEdges, masterNodes]);

  // Filtered nodes based on search & layer filter
  const filteredGraphData = useMemo(() => {
    if (masterNodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const query = searchQuery.trim().toLowerCase();
    const nodes = masterNodes.filter(node => {
      // 1. Layer filter
      if (selectedLayerFilter !== 'ALL' && String(node.layerIndex) !== String(selectedLayerFilter)) {
        return false;
      }
      // 2. Search query
      if (query) {
        const matchName = node.name.toLowerCase().includes(query);
        const matchPath = node.path.toLowerCase().includes(query);
        const matchCategory = node.category.toLowerCase().includes(query);
        if (!matchName && !matchPath && !matchCategory) return false;
      }
      return true;
    });

    const visibleNodeIds = new Set(nodes.map(n => n.id));
    const edges = masterEdges.filter(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      return visibleNodeIds.has(s) && visibleNodeIds.has(t);
    });

    return { nodes, edges };
  }, [masterNodes, masterEdges, searchQuery, selectedLayerFilter]);

  // Connected nodes and edges for selected node highlighting
  const { connectedNodeIds, connectedEdgeIds } = useMemo(() => {
    if (!selectedNode) {
      return { connectedNodeIds: new Set(), connectedEdgeIds: new Set() };
    }

    const nodeIds = new Set([selectedNode.id]);
    const edgeIds = new Set();

    filteredGraphData.edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      if (s === selectedNode.id) {
        nodeIds.add(t);
        edgeIds.add(e.id);
      } else if (t === selectedNode.id) {
        nodeIds.add(s);
        edgeIds.add(e.id);
      }
    });

    return { connectedNodeIds: nodeIds, connectedEdgeIds: edgeIds };
  }, [selectedNode, filteredGraphData.edges]);

  // ResizeObserver for canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const height = isFullscreen ? window.innerHeight - 240 : 540;
        setDimensions({
          width: Math.max(clientWidth, 480),
          height: Math.max(height, 420)
        });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

  // Zoom & Pan Viewport handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const transform = d3.zoomIdentity.translate(0, 0).scale(1);
    svg.transition().duration(400).call(zoomBehaviorRef.current.transform, transform);
    setZoomLevel(100);
  }, []);

  const handleFitView = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current || filteredGraphData.nodes.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const padding = 60;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    filteredGraphData.nodes.forEach(n => {
      if (typeof n.x === 'number' && typeof n.y === 'number') {
        minX = Math.min(minX, n.x - 80);
        maxX = Math.max(maxX, n.x + 80);
        minY = Math.min(minY, n.y - 30);
        maxY = Math.max(maxY, n.y + 30);
      }
    });

    if (minX === Infinity || maxX === -Infinity) {
      handleResetView();
      return;
    }

    const boxWidth = Math.max(100, maxX - minX);
    const boxHeight = Math.max(100, maxY - minY);
    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    const scale = Math.max(
      0.4,
      Math.min(
        (width - padding * 2) / boxWidth,
        (height - padding * 2) / boxHeight,
        1.3
      )
    );

    const translate = [
      width / 2 - scale * boxCenterX,
      height / 2 - scale * boxCenterY
    ];

    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, transform)
      .on('end', () => setZoomLevel(Math.round(scale * 100)));
  }, [dimensions, filteredGraphData.nodes, handleResetView]);

  // Export SVG snapshot
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dependency-graph-${selectedRepo?.name || 'project'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast?.('Exported Dependency Graph (SVG)', 'success');
    } catch {
      showToast?.('Unable to export SVG', 'error');
    }
  };

  // 2. D3 RENDERING ENGINE
  useEffect(() => {
    if (!svgRef.current || filteredGraphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // 2.1 SVG Defs & Arrowhead Markers
    const defs = svg.append('defs');

    // Arrow Marker: Normal
    defs.append('marker')
      .attr('id', 'dep-arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L9,0L0,4')
      .attr('fill', '#475569');

    // Arrow Marker: Highlighted (Cyan)
    defs.append('marker')
      .attr('id', 'dep-arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4.5L10,0L0,4.5')
      .attr('fill', '#06b6d4');

    // Arrow Marker: Target / Origin (Rose)
    defs.append('marker')
      .attr('id', 'dep-arrow-target')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4.5L10,0L0,4.5')
      .attr('fill', '#f43f5e');

    // 2.2 Zoom Container Group
    const g = svg.append('g').attr('class', 'graph-root-group');

    // Zoom behavior setup
    const zoom = d3.zoom()
      .scaleExtent([0.2, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100));
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // 2.3 Clone nodes and edges for D3 simulation
    const nodes = filteredGraphData.nodes.map(d => ({ ...d }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const links = filteredGraphData.edges
      .filter(e => {
        const sId = typeof e.source === 'object' ? e.source.id : e.source;
        const tId = typeof e.target === 'object' ? e.target.id : e.target;
        return nodeMap.has(sId) && nodeMap.has(tId);
      })
      .map(e => ({
        ...e,
        source: nodeMap.get(typeof e.source === 'object' ? e.source.id : e.source),
        target: nodeMap.get(typeof e.target === 'object' ? e.target.id : e.target)
      }));

    // 2.4 Pre-position nodes based on chosen layout
    if (layoutMode === 'concentric') {
      const radiusStep = Math.min(width, height) * 0.17;
      const layerGroups = {};

      nodes.forEach(n => {
        const l = n.layerIndex || 0;
        if (!layerGroups[l]) layerGroups[l] = [];
        layerGroups[l].push(n);
      });

      Object.keys(layerGroups).forEach(l => {
        const layerNodes = layerGroups[l];
        const r = Number(l) === 0 ? 0 : Number(l) * radiusStep + 40;
        const angleStep = (2 * Math.PI) / Math.max(1, layerNodes.length);

        layerNodes.forEach((n, idx) => {
          if (Number(l) === 0 && layerNodes.length === 1) {
            n.x = centerX;
            n.y = centerY;
          } else {
            const angle = idx * angleStep;
            n.x = centerX + r * Math.cos(angle);
            n.y = centerY + r * Math.sin(angle);
          }
        });
      });
    } else if (layoutMode === 'hierarchical') {
      const colStep = (width - 160) / 4;
      const colGroups = {};

      nodes.forEach(n => {
        const l = Math.min(3, Math.max(0, n.layerIndex || 0));
        if (!colGroups[l]) colGroups[l] = [];
        colGroups[l].push(n);
      });

      Object.keys(colGroups).forEach(l => {
        const colNodes = colGroups[l];
        const rowStep = Math.min(75, (height - 100) / Math.max(1, colNodes.length));
        const startY = centerY - ((colNodes.length - 1) * rowStep) / 2;

        colNodes.forEach((n, idx) => {
          n.x = 80 + Number(l) * colStep;
          n.y = startY + idx * rowStep;
        });
      });
    } else {
      // Force random initial scatter
      nodes.forEach(n => {
        n.x = centerX + (Math.random() - 0.5) * 300;
        n.y = centerY + (Math.random() - 0.5) * 260;
      });
    }

    // 2.5 D3 Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('collide', d3.forceCollide().radius(50).strength(0.8))
      .force('center', d3.forceCenter(centerX, centerY).strength(0.08))
      .alphaDecay(0.04);

    simulationRef.current = simulation;

    // 2.6 Draw Edges (Links)
    const linkGroup = g.append('g').attr('class', 'links-layer');
    const link = linkGroup.selectAll('.graph-link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'graph-link')
      .attr('stroke', d => {
        if (connectedEdgeIds.has(d.id)) return '#06b6d4';
        return '#334155';
      })
      .attr('stroke-width', d => (connectedEdgeIds.has(d.id) ? 2.5 : 1.5))
      .attr('stroke-dasharray', d => (d.relationshipType === 'dynamic' ? '4 3' : 'none'))
      .attr('fill', 'none')
      .attr('opacity', d => {
        if (selectedNode) {
          return connectedEdgeIds.has(d.id) ? 1 : 0.15;
        }
        return 0.75;
      })
      .attr('marker-end', d => {
        if (connectedEdgeIds.has(d.id)) return 'url(#dep-arrow-highlight)';
        return 'url(#dep-arrow-default)';
      });

    // 2.7 Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');
    const node = nodeGroup.selectAll('.graph-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'graph-node cursor-pointer select-none')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Pill Outer Glow/Active Ring for selected or target nodes
    node.append('rect')
      .attr('x', -68)
      .attr('y', -18)
      .attr('width', 136)
      .attr('height', 36)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.isTarget) return '#f43f5e';
        if (selectedNode?.id === d.id) return '#38bdf8';
        return 'transparent';
      })
      .attr('stroke-width', d => (d.isTarget || selectedNode?.id === d.id ? 2.5 : 0))
      .attr('opacity', 0.9);

    // Node Pill Background Card
    node.append('rect')
      .attr('x', -64)
      .attr('y', -15)
      .attr('width', 128)
      .attr('height', 30)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (d.isTarget) return '#1e1017';
        if (selectedNode?.id === d.id) return '#0c2338';
        const cfg = LAYER_CONFIG[d.layerIndex] || DEFAULT_LAYER_CONFIG;
        return cfg.bgClass.includes('cyan') ? '#081e2b' :
               cfg.bgClass.includes('indigo') ? '#121833' :
               cfg.bgClass.includes('emerald') ? '#06261c' : '#1e1c10';
      })
      .attr('stroke', d => {
        if (d.isTarget) return '#f43f5e';
        if (selectedNode?.id === d.id) return '#38bdf8';
        if (connectedNodeIds.has(d.id)) return '#06b6d4';
        const cfg = LAYER_CONFIG[d.layerIndex] || DEFAULT_LAYER_CONFIG;
        return cfg.color;
      })
      .attr('stroke-width', d => (d.isTarget || selectedNode?.id === d.id ? 1.8 : 1.2))
      .attr('opacity', d => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 1 : 0.25;
        }
        return 1;
      });

    // Node Status Indicator Dot
    node.append('circle')
      .attr('cx', -52)
      .attr('cy', 0)
      .attr('r', 3.5)
      .attr('fill', d => {
        if (d.isTarget) return '#f43f5e';
        const cfg = LAYER_CONFIG[d.layerIndex] || DEFAULT_LAYER_CONFIG;
        return cfg.color;
      });

    // Node Text Label
    node.append('text')
      .attr('x', -42)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', '600')
      .attr('fill', d => {
        if (d.isTarget) return '#fda4af';
        if (selectedNode?.id === d.id) return '#e0f2fe';
        return '#f1f5f9';
      })
      .text(d => {
        const name = d.name || 'node';
        return name.length > 13 ? name.substring(0, 11) + '..' : name;
      })
      .attr('opacity', d => {
        if (selectedNode) {
          return connectedNodeIds.has(d.id) ? 1 : 0.25;
        }
        return 1;
      });

    // Node Category / Layer Mini Label
    node.append('text')
      .attr('x', 56)
      .attr('y', 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', d => {
        const cfg = LAYER_CONFIG[d.layerIndex] || DEFAULT_LAYER_CONFIG;
        return cfg.color;
      })
      .attr('opacity', d => (selectedNode && !connectedNodeIds.has(d.id) ? 0.2 : 0.8))
      .text(d => `L${d.layerIndex ?? 0}`);

    // Node Interactions: Hover Tooltip & Click Selection
    node
      .on('mouseenter', (event, d) => {
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipData({
          visible: true,
          x: x + 15,
          y: y + 15,
          node: d
        });
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipData(prev => ({
          ...prev,
          x: x + 15,
          y: y + 15
        }));
      })
      .on('mouseleave', () => {
        setTooltipData(prev => ({ ...prev, visible: false }));
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(prev => (prev?.id === d.id ? null : d));
      });

    // Background click deselects
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // 2.8 Simulation Tick Updates
    simulation.on('tick', () => {
      link.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.3;
        // Smooth curved path for clean readability
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions, filteredGraphData, layoutMode, selectedNode, connectedNodeIds, connectedEdgeIds]);

  const hasData = masterNodes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl relative flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-6 bg-slate-950/98 backdrop-blur-2xl rounded-none' : className
      }`}
      id="dependency-graph-section"
      ref={containerRef}
    >
      {/* 1. Header & Quick Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-800/70 text-cyan-400 shadow-sm shadow-cyan-950/40">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Interactive Dependency Graph
              </h3>
              <Badge variant="info" className="text-[10px] font-mono">
                AST Topology
              </Badge>
              {hasData ? (
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {masterNodes.length} Nodes • {masterEdges.length} Edges
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                  Standby
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore codebase architecture, module hierarchy, and caller relationships.
            </p>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant={showLegend ? 'secondary' : 'outline'}
            size="sm"
            icon={showLegend ? EyeOff : Eye}
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs px-2.5"
          >
            Legend
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportSVG}
            className="text-xs px-2.5 hidden sm:inline-flex"
            title="Download SVG Diagram"
          >
            Export
          </Button>

          <Button
            variant={isFullscreen ? 'primary' : 'outline'}
            size="sm"
            icon={isFullscreen ? Minimize2 : Maximize2}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs px-2.5"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* 2. Interactive Toolbar (Search, Layers, Layout Mode, Zoom) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module, path, or layer..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Layer Filter Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-cyan-400" /> Layer:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: '0', label: 'L0: Entry' },
            { id: '1', label: 'L1: Services' },
            { id: '2', label: 'L2: Data' },
            { id: '3', label: 'L3: Utils' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLayerFilter(l.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all ${
                selectedLayerFilter === l.id
                  ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Layout Modes */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 font-mono text-[11px]">
          {[
            { id: 'concentric', label: 'Concentric' },
            { id: 'force', label: 'Force' },
            { id: 'hierarchical', label: 'Tree' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setLayoutMode(m.id)}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                layoutMode === m.id
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Camera Zoom & Reset Controls */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[36px] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleFitView}
            className="p-1 text-slate-400 hover:text-cyan-300 border-l border-slate-800 ml-0.5"
            title="Fit to Screen"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Collapsible Legend Strip */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Layers:
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  L0: Entry / Controllers
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  L1: Services & Domain
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  L2: Data & Repositories
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  L3: Utils & Config
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-slate-400 inline-block" /> Direct Call
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-cyan-400 inline-block" /> Active Path
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Core Visualization Canvas */}
      <div
        className="relative w-full rounded-2xl bg-slate-950/95 border border-slate-800/90 overflow-hidden shadow-inner flex flex-col justify-between"
        style={{ height: isFullscreen ? 'calc(100vh - 280px)' : '540px' }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Empty State when no repository is loaded or 0 nodes */}
        {!hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-10 space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Network className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-slate-100">
                No Dependency Graph Available
              </h4>
              <p className="text-xs text-slate-400">
                Upload or analyze a repository to generate the interactive module call hierarchy and AST graph.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={() => (runAnalysis ? runAnalysis() : setActiveTab?.('upload'))}
                className="text-xs"
              >
                Run Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FolderUp}
                onClick={() => setActiveTab?.('upload')}
                className="text-xs"
              >
                Upload Codebase
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* SVG Graph Canvas */}
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              width={dimensions.width}
              height={dimensions.height}
            />

            {/* Hover Tooltip Card */}
            {tooltipData.visible && tooltipData.node && (
              <div
                className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-xl min-w-[220px] max-w-xs space-y-1.5 text-left font-mono"
                style={{
                  left: `${Math.min(dimensions.width - 240, Math.max(12, tooltipData.x))}px`,
                  top: `${Math.min(dimensions.height - 150, Math.max(12, tooltipData.y))}px`
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-xs text-slate-100 truncate block max-w-[140px]">
                    {tooltipData.node.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {tooltipData.node.layer}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 break-all">
                  {tooltipData.node.path}
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Category:</span>
                    <span className="text-slate-300">{tooltipData.node.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Risk Score:</span>
                    <span className={tooltipData.node.riskScore >= 75 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {tooltipData.node.riskScore}/100
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Canvas Bottom Information HUD */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400">
          <span>Layout: <strong className="text-cyan-300 capitalize">{layoutMode}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Showing: <strong className="text-slate-200">{filteredGraphData.nodes.length} Nodes</strong></span>
          {selectedNode && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[150px]">
                Selected: {selectedNode.name}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white underline ml-0.5"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5. Selected Node Detail Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
                <FileCode className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-100 font-mono">{selectedNode.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedNode.layer}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {selectedNode.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono break-all">{selectedNode.path}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Button
                variant="primary"
                size="sm"
                icon={Zap}
                onClick={() => {
                  if (selectChangedFile) {
                    selectChangedFile(selectedNode.path);
                    showToast?.(`Selected ${selectedNode.name} as modified file for blast analysis`, 'success');
                  }
                }}
                className="text-xs"
              >
                Test Blast Radius
              </Button>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Close Inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
