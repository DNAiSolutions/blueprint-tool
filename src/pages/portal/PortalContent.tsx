import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Film, CheckCircle2, Clock, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockContent = [
  { id: '1', title: 'Mon — "3 things your driveway is begging you to do"', type: 'reel', status: 'pending', revision: 0, autoApproveIn: '2 days', thumbnail: null },
  { id: '2', title: 'Tue — "Your neighbors hired us. Here\'s what happened."', type: 'reel', status: 'pending', revision: 0, autoApproveIn: '3 days', thumbnail: null },
  { id: '3', title: 'Wed — "The $200 mistake every homeowner makes"', type: 'reel', status: 'approved', revision: 0, autoApproveIn: null, thumbnail: null },
  { id: '4', title: 'Thu — "We found this during a free inspection"', type: 'carousel', status: 'revision_requested', revision: 1, autoApproveIn: null, thumbnail: null },
  { id: '5', title: 'Fri — "POV: Your house gets a glow-up"', type: 'reel', status: 'approved', revision: 0, autoApproveIn: null, thumbnail: null },
];

export default function PortalContent() {
  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Your Content</h1>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Upload Assets
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {/* Content List */}
        <div className="space-y-2">
          {mockContent.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
              {/* Thumbnail placeholder */}
              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Film className="h-6 w-6 text-muted-foreground/40" />
              </div>

              {/* Info */}
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

              {/* Status */}
              <div className="text-right shrink-0">
                <StatusBadge status={item.status === 'revision_requested' ? 'in_review' : item.status} />
                {item.autoApproveIn && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5 justify-end">
                    <Clock className="h-2.5 w-2.5" /> Auto-approves in {item.autoApproveIn}
                  </p>
                )}
              </div>

              {/* Actions */}
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
      </div>
    </AppLayout>
  );
}
