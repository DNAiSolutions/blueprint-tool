import { useEffect } from 'react';
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

export default function Canvas() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { currentSession, loadSession } = useSession();
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
        <aside className="w-72 border-r border-border bg-card flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">📋</span>
              Questions
            </h2>
          </div>
          
          {/* Questions List - Placeholder */}
          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            <div className="space-y-3">
              {/* Completed Question */}
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm font-medium mb-1">
                  <span>✓</span>
                  Goals & Context
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>

              {/* Active Question */}
              <div className="p-3 rounded-lg bg-accent/10 border-l-2 border-accent">
                <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                  <span>▶</span>
                  Lead Sources
                </div>
                <p className="text-sm text-foreground mb-3">
                  How many leads do you get per month?
                </p>
                <input 
                  type="text" 
                  placeholder="e.g., 500"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                />
                <Button variant="primary" size="sm" className="w-full mt-3">
                  Answer & Continue
                </Button>
              </div>

              {/* Waiting Questions */}
              <div className="p-3 rounded-lg bg-muted/50 opacity-60">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <span>•</span>
                  Lead Handling
                </div>
                <p className="text-xs text-muted-foreground mt-1">Waiting</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 opacity-60">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <span>•</span>
                  Qualification
                </div>
                <p className="text-xs text-muted-foreground mt-1">Waiting</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 opacity-60">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <span>•</span>
                  Conversion Events
                </div>
                <p className="text-xs text-muted-foreground mt-1">Waiting</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 opacity-60">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <span>•</span>
                  Fulfillment
                </div>
                <p className="text-xs text-muted-foreground mt-1">Waiting</p>
              </div>
            </div>
          </div>

          {/* Add Node Button */}
          <div className="p-4 border-t border-border">
            <Button variant="primary" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Node
            </Button>
          </div>
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                <Plus className="h-10 w-10 text-accent" />
              </div>
              <h2 className="mb-2 text-h3 text-foreground">
                Start Building Your Map
              </h2>
              <p className="mb-6 text-muted-foreground text-sm">
                Use the questions on the left to guide your discovery call. Add nodes to map the prospect's business process.
              </p>
              <Button variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Node
              </Button>
            </div>
          </div>

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
                  <p className="text-xs">Add nodes to see metrics</p>
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
