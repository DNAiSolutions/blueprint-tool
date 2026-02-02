import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Save, 
  Menu,
  Plus,
  BarChart3,
  FileDown,
} from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';
import { QuestionPanel } from '@/components/canvas/QuestionPanel';

export default function Canvas() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { currentSession, loadSession, addNode } = useSession();
  const { user } = useAuth();

  useEffect(() => {
    if (sessionId && !currentSession) {
      loadSession(sessionId);
    }
  }, [sessionId, currentSession, loadSession]);

  // Redirect if no session found
  if (!sessionId) {
    navigate('/');
    return null;
  }

  // Handle node creation from question answers
  const handleNodeCreate = useCallback((nodeType: string, data: Record<string, any>) => {
    if (!currentSession) return;
    
    // Create node based on type and data
    addNode({
      type: nodeType as any,
      label: getNodeLabel(nodeType),
      volume: data.volume || 0,
      conversionRate: data.conversionRate || 0,
      value: data.value || 0,
      position: calculateNodePosition(currentSession.nodes.length),
      connections: [],
    });
  }, [currentSession, addNode]);

  const displayName = user?.user_metadata?.full_name || user?.email || 'Unknown';

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo & Back */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <img src={dnaiLogo} alt="DNAi" className="h-6 w-auto" />
          </Button>
          
          {/* Session Info */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">
              {currentSession?.clientName || 'New Session'}
            </span>
            {currentSession?.industry && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground capitalize">
                  {currentSession.industry.replace('-', ' ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Canvas Area - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Questions Panel */}
        <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0 hidden lg:flex">
          <QuestionPanel 
            sessionId={sessionId} 
            onNodeCreate={handleNodeCreate}
          />
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 relative overflow-hidden bg-background">
          {/* Canvas Grid Background */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas Content - Empty State */}
          {(!currentSession?.nodes || currentSession.nodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md p-8">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                  <Plus className="h-10 w-10 text-accent" />
                </div>
                <h2 className="mb-2 text-h3 text-foreground">
                  Start Building Your Map
                </h2>
                <p className="mb-6 text-muted-foreground text-sm">
                  Answer the questions on the left to guide your discovery call. Nodes will be created automatically as you progress.
                </p>
              </div>
            </div>
          )}

          {/* TODO: Render nodes when they exist */}
          {currentSession?.nodes && currentSession.nodes.length > 0 && (
            <div className="absolute inset-0 p-8">
              {/* Nodes will be rendered here */}
              {currentSession.nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute p-4 bg-card border-2 border-accent rounded-lg shadow-level-2 min-w-[160px]"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                  }}
                >
                  <p className="text-sm font-medium">{node.label}</p>
                  {node.volume > 0 && (
                    <p className="text-xs text-muted-foreground">{node.volume}/mo</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Canvas Action Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-level-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Funnel View
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </main>

        {/* Right Sidebar - Metrics Panel */}
        <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0 hidden xl:flex">
          <div className="p-4 border-b border-border border-t-2 border-t-accent">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">📊</span>
              Metrics
            </h2>
          </div>

          {/* Metrics Content - Placeholder */}
          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            <div className="space-y-6">
              {/* Funnel Breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Funnel Breakdown
                </h3>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No data yet</p>
                  <p className="text-xs">Answer questions to see metrics</p>
                </div>
              </div>

              {/* Top Leak Alert - Hidden until data */}
              <div className="p-4 rounded-lg border-2 border-dashed border-destructive/30 bg-destructive/5">
                <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
                  Top Leak
                </h3>
                <p className="text-sm text-muted-foreground">
                  Leaks will appear here once you add conversion data
                </p>
              </div>

              {/* Revenue at Risk */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Revenue at Risk
                </h3>
                <p className="text-2xl font-bold metric-value">$0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total monthly leakage
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Helper: Get node label from type
function getNodeLabel(nodeType: string): string {
  const labels: Record<string, string> = {
    'lead-source': 'Lead Source',
    'intake': 'Intake',
    'decision': 'Qualification',
    'conversion': 'Conversion',
    'close': 'Close',
    'fulfillment': 'Fulfillment',
    'review': 'Reviews & Referrals',
  };
  return labels[nodeType] || 'Custom';
}

// Helper: Calculate node position
function calculateNodePosition(existingCount: number): { x: number; y: number } {
  const baseX = 100;
  const baseY = 100;
  const offsetX = 200;
  const offsetY = 120;
  
  // Simple left-to-right, slight diagonal layout
  return {
    x: baseX + (existingCount * offsetX),
    y: baseY + (existingCount * offsetY * 0.5),
  };
}
