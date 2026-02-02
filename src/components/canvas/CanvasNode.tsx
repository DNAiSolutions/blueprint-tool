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
  'custom': { border: 'hsl(0, 0%, 50%)', bg: 'hsl(0, 0%, 50%)' },                // Gray
};

const LEAK_COLOR = { border: 'hsl(0, 70%, 55%)', bg: 'hsl(0, 70%, 55%)' };        // Red #E74C3C

interface CanvasNodeProps {
  node: SessionNode;
  isSelected?: boolean;
  onClick?: (node: SessionNode) => void;
}

export function CanvasNode({ node, isSelected, onClick }: CanvasNodeProps) {
  const colors = node.isLeak ? LEAK_COLOR : (NODE_COLORS[node.type] || NODE_COLORS.custom);
  
  // Get type icon
  const getTypeIcon = () => {
    const icons: Record<string, string> = {
      'lead-source': '📣',
      'intake': '📞',
      'decision': '✅',
      'conversion': '📈',
      'close': '💰',
      'fulfillment': '🏁',
      'review': '⭐',
      'custom': '⚙️',
    };
    return icons[node.type] || '📦';
  };

  // Format conversion rate color
  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 dark:text-green-400';
    if (rate >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div
      className={cn(
        "absolute p-3 bg-card rounded-lg shadow-md min-w-[150px] max-w-[200px] transition-all cursor-pointer",
        "hover:shadow-lg hover:scale-105",
        isSelected && "ring-2 ring-accent ring-offset-2",
        node.isLeak && "animate-pulse"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        borderWidth: '2px',
        borderStyle: node.isLeak ? 'dashed' : 'solid',
        borderColor: colors.border,
      }}
      onClick={() => onClick?.(node)}
    >
      {/* Node Type Badge */}
      <div 
        className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full text-white flex items-center gap-1"
        style={{ backgroundColor: colors.bg }}
      >
        <span>{getTypeIcon()}</span>
        <span>{node.type.replace('-', ' ')}</span>
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
