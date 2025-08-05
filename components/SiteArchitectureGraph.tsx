
import React, { useMemo } from 'react';
import type { GraphData, Node, Edge } from '../types';

interface PositionedNode extends Node {
  x: number;
  y: number;
}

const nodeColors = {
  pillar: 'fill-blue-500/20 stroke-blue-400',
  cluster: 'fill-teal-500/20 stroke-teal-400',
  orphan: 'fill-gray-600/20 stroke-gray-500',
};

const nodeRadii = {
  pillar: 20,
  cluster: 12,
  orphan: 8,
};

const calculateLayout = (graphData: GraphData, width: number, height: number): PositionedNode[] => {
  if (!graphData || !graphData.nodes) return [];

  const pillarNodes = graphData.nodes.filter(n => n.type === 'pillar');
  const orphanNodes = graphData.nodes.filter(n => n.type === 'orphan');
  const clusterNodes = graphData.nodes.filter(n => n.type === 'cluster');

  const positionedNodes: PositionedNode[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const mainRadius = Math.min(width, height) / 3;

  // Position pillars
  const pillarAngleStep = (2 * Math.PI) / (pillarNodes.length || 1);
  pillarNodes.forEach((node, i) => {
    const angle = i * pillarAngleStep;
    positionedNodes.push({
      ...node,
      x: centerX + Math.cos(angle) * mainRadius * 0.5,
      y: centerY + Math.sin(angle) * mainRadius * 0.5,
    });
  });

  // Position cluster nodes around their pillars
  const positionedPillars = positionedNodes.filter(n => n.type === 'pillar');
  positionedPillars.forEach(pNode => {
    const children = clusterNodes.filter(c => c.cluster === pNode.cluster);
    const childAngleStep = (2 * Math.PI) / (children.length || 1);
    children.forEach((cNode, i) => {
      const angle = i * childAngleStep;
      positionedNodes.push({
        ...cNode,
        x: pNode.x + Math.cos(angle) * 80,
        y: pNode.y + Math.sin(angle) * 80,
      });
    });
  });
  
  // Position orphans at the bottom
   orphanNodes.forEach((node, i) => {
    positionedNodes.push({
      ...node,
      x: (i + 1) * (width / (orphanNodes.length + 1)),
      y: height - 40,
    });
  });

  return positionedNodes;
};

export const SiteArchitectureGraph: React.FC<{ graphData: GraphData }> = ({ graphData }) => {
    const width = 800;
    const height = 500;
    
    const positionedNodes = useMemo(() => calculateLayout(graphData, width, height), [graphData, width, height]);
    const nodeMap = useMemo(() => new Map(positionedNodes.map(n => [n.id, n])), [positionedNodes]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return <div className="text-center text-gray-500 p-8">No site architecture data available to display.</div>;
  }

  return (
    <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-700 w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px] w-full">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4a5568" />
                </marker>
            </defs>

            {/* Render edges */}
            {graphData.edges.map((edge, i) => {
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);
                if (!sourceNode || !targetNode) return null;
                return (
                    <line
                        key={i}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#4a5568"
                        strokeWidth="1.5"
                        markerEnd="url(#arrow)"
                    />
                );
            })}

            {/* Render nodes */}
            {positionedNodes.map(node => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="group cursor-pointer">
                    <circle
                        r={nodeRadii[node.type]}
                        className={`${nodeColors[node.type]} stroke-2 transition-all duration-300 group-hover:stroke-white`}
                    />
                    <title>{node.id}</title>
                    <text
                        textAnchor="middle"
                        y={nodeRadii[node.type] + 12}
                        className="text-[8px] fill-gray-400 group-hover:fill-white transition-colors select-none"
                    >
                        {node.label}
                    </text>
                </g>
            ))}
        </svg>
        <div className="flex justify-center items-center gap-6 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-400"></div>Pillar Page</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500/50 border border-teal-400"></div>Cluster Page</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-600/50 border border-gray-500"></div>Orphan Page</div>
        </div>
    </div>
  );
};
