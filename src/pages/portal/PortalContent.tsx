import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useClientPortal } from '@/hooks/useClientPortal';
import { Film, CheckCircle2, Clock, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockContent = [
  { id: '1', title: 'Mon -- "3 things your driveway is begging you to do"', type: 'reel', status: 'pending', revision: 0, autoApproveIn: '2 days', thumbnail: null },
  { id: '2', title: 'Tue -- "Your neighbors hired us. Here\'s what happened."', type: 'reel', status: 'pending', revision: 0, autoApproveIn: '3 days', thumbnail: null },
  { id: '3', title: 'Wed -- "The $200 mistake every homeowner makes"', type: 'reel', status: 'approved', revision: 0, autoApproveIn: null, thumbnail: null },
  { id: '4', title: 'Thu -- "We found this during a free inspection"', type: 'carousel', status: 'revision_requested', revision: 1, autoApproveIn: null, thumbnail: null },
  { id: '5', title: 'Fri -- "POV: Your house gets a glow-up"', type: 'reel', status: 'approved', revision: 0, autoApproveIn: null, thumbnail: null },
];

function getAutoApproveCountdown(autoApproveAt: string | null): string | null {
  if (!autoApproveAt) return null;
  const now = new Date();
  const target = new Date(autoApproveAt);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'auto-approving soon';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}

export default function PortalContent() {
  const { contentApprovals, loading, approve, requestRevision } = useClientPortal();

  const hasRealData = contentApprovals.length > 0;

  const handleApprove = async (approvalId: string) => {
    await approve(approvalId);
  };

  const handleRevise = async (approvalId: string) => {
    const notes = window.prompt('Describe the changes you would like:');
    if (notes) {
      await requestRevision(approvalId, notes);
    }
  };

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Your Content</h1>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Upload Assets
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {loading && (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading content...</div>
        )}

        {/* Real data from Supabase */}
        {!loading && hasRealData && (
          <div className="space-y-2">
            {contentApprovals.map(item => {
              const countdown = getAutoApproveCountdown(item.auto_approve_at);
              const statusDisplay = item.status === 'revision_requested' ? 'in_review' : item.status;

              return (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Film className="h-6 w-6 text-muted-foreground/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">
                      {item.script_id ? `Script ${item.script_id.slice(0, 8)}...` : 'Content piece'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.revision_number > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <RotateCcw className="h-2.5 w-2.5" /> Revision {item.revision_number}/3
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <StatusBadge status={statusDisplay} />
                    {countdown && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 justify-end">
                        <Clock className="h-2.5 w-2.5" /> Auto-approves in {countdown}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {item.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleApprove(item.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleRevise(item.id)}>
                          <RotateCcw className="h-3 w-3" /> Revise
                        </Button>
                      </>
                    )}
                    {(item.status === 'approved' || item.status === 'auto_approved') && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {item.status === 'escalated' && (
                      <StatusBadge status="error" className="text-[10px]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback to mock data when no real data */}
        {!loading && !hasRealData && (
          <div className="space-y-2">
            {mockContent.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Film className="h-6 w-6 text-muted-foreground/40" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={item.type} />
                    {item.revision > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <RotateCcw className="h-2.5 w-2.5" /> Revision {item.revision}/3
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge status={item.status === 'revision_requested' ? 'in_review' : item.status} />
                  {item.autoApproveIn && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 justify-end">
                      <Clock className="h-2.5 w-2.5" /> Auto-approves in {item.autoApproveIn}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {item.status === 'pending' && (
                    <>
                      <Button size="sm" className="h-7 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <RotateCcw className="h-3 w-3" /> Revise
                      </Button>
                    </>
                  )}
                  {item.status === 'approved' && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="h-3 w-3" /> Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
