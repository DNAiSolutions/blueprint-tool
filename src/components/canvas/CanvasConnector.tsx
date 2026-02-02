import { SessionNode } from '@/types/session';
import { calculateConnectorPath } from '@/utils/funnelLayout';

interface CanvasConnectorProps {
  fromNode: SessionNode;
  toNode: SessionNode;
  isLeak?: boolean;
  isSelected?: boolean;
}

export function CanvasConnector({ fromNode, toNode, isLeak, isSelected }: CanvasConnectorProps) {
  const path = calculateConnectorPath(fromNode, toNode);
  
  // Determine styling based on state
  let strokeColor = 'hsl(var(--border))';
  let strokeWidth = 2;
  let strokeDasharray = 'none';
  
  if (isLeak) {
    strokeColor = 'hsl(0, 70%, 55%)'; // Red
    strokeDasharray = '8 4';
    strokeWidth = 2;
  } else if (isSelected) {
    strokeColor = 'hsl(170, 65%, 45%)'; // Teal
    strokeWidth = 3;
  }
  
  return (
    <g>
      {/* Shadow/glow for selected */}
      {isSelected && (
        <path
          d={path}
          stroke="hsl(170, 65%, 45%)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.3"
        />
      )}
      
      {/* Main connector line */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray === 'none' ? undefined : strokeDasharray}
        className={isLeak ? 'animate-pulse' : undefined}
      />
      
      {/* Arrow head at end */}
      <ArrowHead 
        path={path} 
        color={strokeColor}
      />
    </g>
  );
}

// Simple arrow head component
function ArrowHead({ path, color }: { path: string; color: string }) {
  // Parse the end point from the path
  // Path format: M x1 y1 C cx1 cy1, cx2 cy2, x2 y2
  const matches = path.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*$/);
  if (!matches) return null;
  
  const endX = parseFloat(matches[1]);
  const endY = parseFloat(matches[2]);
  
  // Draw a small triangle pointing down
  const arrowSize = 6;
  const points = [
    `${endX},${endY}`,
    `${endX - arrowSize},${endY - arrowSize * 1.5}`,
    `${endX + arrowSize},${endY - arrowSize * 1.5}`,
  ].join(' ');
  
  return (
    <polygon
      points={points}
      fill={color}
    />
  );
}

interface ConnectorsSVGProps {
  nodes: SessionNode[];
  selectedNodeId?: string;
}

export function ConnectorsSVG({ nodes, selectedNodeId }: ConnectorsSVGProps) {
  // Build all connections
  const connections: Array<{
    from: SessionNode;
    to: SessionNode;
    isLeak: boolean;
    isSelected: boolean;
  }> = [];
  
  nodes.forEach(node => {
    // Regular connections
    node.connections?.forEach(targetId => {
      const targetNode = nodes.find(n => n.id === targetId);
      if (targetNode) {
        connections.push({
          from: node,
          to: targetNode,
          isLeak: node.isLeak || targetNode.isLeak || false,
          isSelected: node.id === selectedNodeId || targetId === selectedNodeId,
        });
      }
    });
    
    // Source connections (intake -> source)
    node.sourceConnections?.forEach(sourceId => {
      const sourceNode = nodes.find(n => n.id === sourceId || n.sourceId === sourceId);
      if (sourceNode) {
        connections.push({
          from: sourceNode,
          to: node,
          isLeak: false,
          isSelected: node.id === selectedNodeId || sourceNode.id === selectedNodeId,
        });
      }
    });
  });
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', minHeight: '900px' }}
    >
      {connections.map((conn, idx) => (
        <CanvasConnector
          key={`${conn.from.id}-${conn.to.id}-${idx}`}
          fromNode={conn.from}
          toNode={conn.to}
          isLeak={conn.isLeak}
          isSelected={conn.isSelected}
        />
      ))}
    </svg>
  );
}
