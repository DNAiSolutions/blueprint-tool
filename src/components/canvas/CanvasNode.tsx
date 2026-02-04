import { useState, useCallback, useRef } from 'react';
import { SessionNode } from '@/types/session';
import { cn } from '@/lib/utils';

// Node type colors matching the plan
const NODE_COLORS: Record<string, { border: string; bg: string }> = {
  'lead-source': { border: 'hsl(210, 70%, 55%)', bg: 'hsl(210, 70%, 55%)' },    // Blue #3498DB
  'intake': { border: 'hsl(270, 50%, 55%)', bg: 'hsl(270, 50%, 55%)' },          // Purple #9B59B6
  'decision': { border: 'hsl(30, 75%, 55%)', bg: 'hsl(30, 75%, 55%)' },          // Orange #E67E22
  'conversion': { border: 'hsl(170, 65%, 45%)', bg: 'hsl(170, 65%, 45%)' },      // Teal #1ABC9C
  'close': { border: 'hsl(145, 60%, 45%)', bg: 'hsl(145, 60%, 45%)' },           // Green #27AE60
  'fulfillment': { border: 'hsl(220, 15%, 40%)', bg: 'hsl(220, 15%, 40%)' },     // Dark Gray #34495E
  'review': { border: 'hsl(220, 15%, 40%)', bg: 'hsl(220, 15%, 40%)' },          // Dark Gray
  'workflow': { border: 'hsl(45, 70%, 50%)', bg: 'hsl(45, 70%, 50%)' },          // Gold (default)
  'workflow-qualified': { border: 'hsl(145, 60%, 45%)', bg: 'hsl(145, 60%, 45%)' },     // Green for qualified
  'workflow-disqualified': { border: 'hsl(0, 60%, 50%)', bg: 'hsl(0, 60%, 50%)' },      // Red for disqualified
  'handoff': { border: 'hsl(200, 60%, 50%)', bg: 'hsl(200, 60%, 50%)' },         // Light Blue
  'verification': { border: 'hsl(280, 60%, 55%)', bg: 'hsl(280, 60%, 55%)' },    // Purple
  'custom': { border: 'hsl(0, 0%, 50%)', bg: 'hsl(0, 0%, 50%)' },                // Gray
};

const LEAK_COLOR = { border: 'hsl(0, 70%, 55%)', bg: 'hsl(0, 70%, 55%)' };        // Red #E74C3C

interface CanvasNodeProps {
  node: SessionNode;
  isSelected?: boolean;
  isConnectionDragging?: boolean;
  onClick?: (node: SessionNode) => void;
  onDoubleClick?: (node: SessionNode) => void;
  onDragEnd?: (nodeId: string, position: { x: number; y: number }) => void;
  onContextMenu?: (e: React.MouseEvent, node: SessionNode) => void;
  onStartConnectionDrag?: (nodeId: string, startPoint: { x: number; y: number }) => void;
  onCompleteConnectionDrop?: (nodeId: string) => void;
}

export function CanvasNode({ 
  node, 
  isSelected, 
  isConnectionDragging,
  onClick, 
  onDoubleClick,
  onDragEnd,
  onContextMenu,
  onStartConnectionDrag,
  onCompleteConnectionDrop,
}: CanvasNodeProps) {
  // Determine color based on node type and pathType
  const getNodeColor = () => {
    if (node.isLeak) return LEAK_COLOR;
    // Workflow nodes have special colors based on pathType
    if (node.type === 'workflow' && node.pathType) {
      return NODE_COLORS[`workflow-${node.pathType}`] || NODE_COLORS.workflow;
    }
    return NODE_COLORS[node.type] || NODE_COLORS.custom;
  };
  const colors = getNodeColor();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: node.position.x, y: node.position.y });
  const clickTimeRef = useRef<number>(0);
  const clickNodeRef = useRef<string>('');

  // Get type icon - with special handling for workflow paths
  const getTypeIcon = () => {
    // Special icons for qualified/disqualified workflow nodes
    if (node.type === 'workflow' && node.pathType === 'qualified') return '✅';
    if (node.type === 'workflow' && node.pathType === 'disqualified') return '❌';
    
    const icons: Record<string, string> = {
      'lead-source': '📣',
      'intake': '📞',
      'decision': '✅',
      'conversion': '📈',
      'close': '💰',
      'fulfillment': '🏁',
      'review': '⭐',
      'workflow': '⚙️',
      'handoff': '🔄',
      'verification': '✔️',
      'custom': '📦',
    };
    return icons[node.type] || '📦';
  };

  // Get type label - with special handling for workflow paths
  const getTypeLabel = () => {
    if (node.type === 'workflow' && node.pathType === 'qualified') return 'qualified';
    if (node.type === 'workflow' && node.pathType === 'disqualified') return 'not qualified';
    return node.type.replace('-', ' ');
  };

  // Format conversion rate color
  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 dark:text-green-400';
    if (rate >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.target as HTMLElement).closest('.canvas-node')?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    setDragPosition({ x: node.position.x, y: node.position.y });
  }, [node.position.x, node.position.y]);

  // Handle mouse move while dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const canvas = document.querySelector('main.flex-1');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.scrollLeft;
    const scrollTop = canvas.scrollTop;
    
    const newX = e.clientX - canvasRect.left + scrollLeft - dragOffset.x;
    const newY = e.clientY - canvasRect.top + scrollTop - dragOffset.y;
    
    setDragPosition({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
    });
  }, [isDragging, dragOffset]);

  // Handle mouse up - end dragging
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) {
        onDragEnd(node.id, dragPosition);
      }
    }
  }, [isDragging, dragPosition, node.id, onDragEnd]);

  // Attach global listeners when dragging
  useState(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  });

  // Handle click with double-click detection
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const now = Date.now();
    const isDoubleClick = 
      clickNodeRef.current === node.id && 
      now - clickTimeRef.current < 300;
    
    clickTimeRef.current = now;
    clickNodeRef.current = node.id;
    
    if (isDoubleClick && onDoubleClick) {
      onDoubleClick(node);
    } else if (onClick) {
      onClick(node);
    }
  }, [node, onClick, onDoubleClick]);

  // Handle right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, node);
    }
  }, [node, onContextMenu]);

  const displayPosition = isDragging ? dragPosition : node.position;

  // Handle connector handle drag start
  const handleConnectorMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStartConnectionDrag) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      onStartConnectionDrag(node.id, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [node.id, onStartConnectionDrag]);

  // Handle drop target when connection is being dragged
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isConnectionDragging && onCompleteConnectionDrop) {
      e.stopPropagation();
      onCompleteConnectionDrop(node.id);
    }
  }, [isConnectionDragging, onCompleteConnectionDrop, node.id]);

  return (
    <div
      className={cn(
        "canvas-node absolute p-3 bg-card rounded-lg shadow-md min-w-[150px] max-w-[200px] transition-all select-none group",
        isDragging ? "cursor-grabbing opacity-80 shadow-xl z-50" : "cursor-grab hover:shadow-lg hover:scale-105",
        isSelected && "ring-2 ring-accent ring-offset-2",
        isConnectionDragging && "ring-2 ring-accent/50 ring-dashed",
        node.isLeak && "animate-pulse"
      )}
      style={{
        left: displayPosition.x,
        top: displayPosition.y,
        borderWidth: '2px',
        borderStyle: node.isLeak ? 'dashed' : 'solid',
        borderColor: colors.border,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Connector Handle - Right side */}
      {onStartConnectionDrag && (
        <div
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-background shadow-md cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-125"
          onMouseDown={handleConnectorMouseDown}
          title="Drag to connect to another node"
        />
      )}
      
      {/* Node Type Badge */}
      <div 
        className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full text-white flex items-center gap-1"
        style={{ backgroundColor: colors.bg }}
      >
        <span>{getTypeIcon()}</span>
        <span>{getTypeLabel()}</span>
      </div>
      
      {/* Primary Label - Actual content name */}
      <p className="text-sm font-medium mt-3 leading-tight text-foreground">
        {node.label}
      </p>
      
      {/* Secondary Info Row */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Volume Badge */}
        {node.volume > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
            <span className="text-[10px] text-muted-foreground">📊</span>
            <span className="text-xs font-medium text-foreground">{node.volume}/mo</span>
          </div>
        )}
        
        {/* Spend Badge */}
        {node.spend && node.spend > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
            <span className="text-[10px] text-muted-foreground">💵</span>
            <span className="text-xs font-medium text-foreground">${node.spend.toLocaleString()}</span>
          </div>
        )}
        
        {/* Conversion Rate Badge */}
        {node.conversionRate > 0 && (
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50",
            getConversionColor(node.conversionRate)
          )}>
            <span className="text-[10px]">📈</span>
            <span className="text-xs font-medium">{node.conversionRate}%</span>
          </div>
        )}
      </div>
      
      {/* Qualification Criteria Display */}
      {node.type === 'decision' && node.criteriaLabels && node.criteriaLabels.length > 0 && (
        <div className="mt-2 p-1.5 rounded bg-muted/50 border border-border">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            📋 {node.criteriaLabels.length} Criteria
          </p>
          <ul className="space-y-0.5">
            {node.criteriaLabels.slice(0, 3).map((label, idx) => (
              <li key={idx} className="text-[10px] text-foreground/80 flex items-start gap-1">
                <span className="text-muted-foreground">•</span>
                <span className="truncate">{label}</span>
              </li>
            ))}
            {node.criteriaLabels.length > 3 && (
              <li className="text-[10px] text-muted-foreground italic">
                +{node.criteriaLabels.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Leak Indicator */}
      {node.isLeak && (
        <div className="mt-2 p-1.5 rounded bg-red-500/10 border border-red-500/30">
          <p className="text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
            🚨 Leak Point
          </p>
          {node.leakReason && (
            <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-0.5">
              {node.leakReason}
            </p>
          )}
        </div>
      )}
      
      {/* Connection indicator */}
      {(node.sourceConnections?.length || 0) > 0 && (
        <div className="mt-1.5 text-[10px] text-muted-foreground">
          ↑ Connected to {node.sourceConnections?.length} source(s)
        </div>
      )}
    </div>
  );
}

// Export colors for use in connector rendering
export { NODE_COLORS, LEAK_COLOR };
