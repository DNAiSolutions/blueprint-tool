import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Users, 
  Target,
  ArrowRight,
  Clock,
  Building2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { INDUSTRY_CATEGORIES, IndustryCategory } from '@/types/session';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { createSession, sessions, deleteSession } = useSession();
  
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState<IndustryCategory | ''>('');
  const [isCreating, setIsCreating] = useState(false);

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const handleCreateSession = () => {
    if (!clientName.trim()) return;
    
    setIsCreating(true);
    const session = createSession(clientName.trim(), industry || undefined);
    
    // Navigate to canvas with the new session
    setTimeout(() => {
      navigate(`/canvas/${session.id}`);
    }, 300);
  };

  const recentSessions = sessions.slice(-3).reverse();

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
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {/* Stats Overview - Phase 1: Increased breathing room */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold metric-value">{sessions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {sessions.length === 0 ? 'Start your first session' : 'Discovery calls mapped'}
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

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Start New Session Card */}
            <Card className="lg:row-span-2">
              <CardHeader>
                <CardTitle className="text-h2 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-accent" />
                  </div>
                  Start a New Session
                </CardTitle>
                <CardDescription>
                  Begin mapping your prospect's business process and quantify revenue leakage in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Client Name Input */}
                <div className="space-y-2.5">
                  <Label htmlFor="clientName" className="text-sm font-medium">
                    Client Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., Gretna Xpress Roofing"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Industry Select */}
                <div className="space-y-2.5">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    Industry <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Select value={industry} onValueChange={(val) => setIndustry(val as IndustryCategory)}>
                    <SelectTrigger id="industry" className="h-11">
                      <SelectValue placeholder="Select an industry..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {INDUSTRY_CATEGORIES.map((category) => (
                        <SelectGroup key={category.value}>
                          <SelectItem value={category.value} className="py-3">
                            <div className="flex items-start gap-2">
                              <span className="text-base">{category.icon}</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{category.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {category.examples.slice(0, 3).join(', ')}...
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    AI will customize questions and templates based on your industry.
                  </p>
                </div>

                {/* Create Button */}
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={handleCreateSession}
                  disabled={!clientName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>Creating Session...</>
                  ) : (
                    <>
                      Create New Session
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Sessions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Recent Sessions
                </CardTitle>
                <CardDescription>
                  Resume where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No sessions yet</p>
                    <p className="text-xs">Create your first session to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div 
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-card/80 transition-all cursor-pointer group"
                        onClick={() => navigate(`/canvas/${session.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{session.clientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.updatedAt).toLocaleDateString()}
                              {session.industry && ` • ${session.industry}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete session "${session.clientName}"?`)) {
                                deleteSession(session.id);
                                toast.success('Session deleted');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            Resume
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">1</span>
                    <span>Follow the guided questions in the sidebar during calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">2</span>
                    <span>Create nodes as you gather data—metrics update in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">3</span>
                    <span>Export a PDF proposal at the end of the discovery call</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
