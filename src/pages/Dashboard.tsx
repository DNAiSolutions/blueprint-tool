import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, TrendingUp, Users, Target } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Map business processes and quantify revenue leakage
            </p>
          </div>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold metric-value">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Start your first session
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue Identified
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold metric-value text-success">$0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leakage to recover
                </p>
              </CardContent>
            </Card>

            {isAdmin && (
              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold metric-value">1</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active users
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. AI Readiness
                </CardTitle>
                <Target className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold metric-value text-warning">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No assessments yet
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Empty State - Canvas Preview */}
          <Card className="flex flex-col items-center justify-center py-16 px-8 text-center border-dashed border-2">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
              <Target className="h-10 w-10 text-accent" />
            </div>
            <h2 className="mb-2 text-h3 text-foreground">
              Start Your First ALIGN Session
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Map your prospect's business processes, quantify revenue leakage, and generate a data-backed proposal in real-time.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
              <Button variant="ghost">
                View Demo
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-h3 mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="card-hover cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-node-lead-source/20 flex items-center justify-center group-hover:bg-node-lead-source/30 transition-colors">
                    <FileText className="h-5 w-5 text-node-lead-source" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">New Discovery Call</p>
                    <p className="text-sm text-muted-foreground">Map a prospect's process</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-node-conversion/20 flex items-center justify-center group-hover:bg-node-conversion/30 transition-colors">
                    <TrendingUp className="h-5 w-5 text-node-conversion" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Templates</p>
                    <p className="text-sm text-muted-foreground">Pre-built process maps</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-node-close/20 flex items-center justify-center group-hover:bg-node-close/30 transition-colors">
                    <Target className="h-5 w-5 text-node-close" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Export Report</p>
                    <p className="text-sm text-muted-foreground">Generate PDF proposals</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
