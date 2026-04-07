import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { useWebhookEvents } from '@/hooks/useWebhookEvents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Webhook, RefreshCw, Activity, CheckCircle, XCircle, Clock,
} from 'lucide-react';

const SOURCE_OPTIONS = ['All', 'ghl', 'stripe', 'vercel', 'heygen'] as const;
const STATUS_OPTIONS = ['All', 'Processed', 'Failed', 'Pending'] as const;

type SourceFilter = (typeof SOURCE_OPTIONS)[number];
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function getProcessedFilter(status: StatusFilter): boolean | null {
  if (status === 'Processed') return true;
  if (status === 'Pending') return false;
  return null;
}

function getSourceIcon(source: string) {
  const s = source.toLowerCase();
  if (s === 'ghl' || s === 'gohighlevel') return 'GHL';
  if (s === 'stripe') return 'STR';
  if (s === 'vercel') return 'VCL';
  if (s === 'heygen') return 'HEY';
  return source.slice(0, 3).toUpperCase();
}

function truncateJson(payload: unknown, maxLen = 80): string {
  const str = JSON.stringify(payload);
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function WebhookLog() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const processedValue = getProcessedFilter(statusFilter);

  const { events, loading, stats, retryEvent } = useWebhookEvents({
    source: sourceFilter === 'All' ? undefined : sourceFilter,
    processed: processedValue,
  });

  // For the "Failed" filter, we also need to show events with processing_error
  const displayEvents = statusFilter === 'Failed'
    ? events.filter(e => !!e.processing_error)
    : events;

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Webhook className="h-5 w-5 text-accent" />
          Webhook Event Log
        </h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard label="Total Events" value={stats.total} icon={Activity} />
          <KPICard label="Processed" value={stats.processed} icon={CheckCircle} />
          <KPICard label="Failed" value={stats.failed} icon={XCircle} />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground uppercase mr-1 self-center">Source:</span>
            {SOURCE_OPTIONS.map(s => (
              <Button
                key={s}
                variant={sourceFilter === s ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => setSourceFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground uppercase mr-1 self-center">Status:</span>
            {STATUS_OPTIONS.map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading events...</div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No webhook events found</div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_1fr_80px_1.5fr_100px_60px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Source</span>
              <span>Event Type</span>
              <span>Payload</span>
              <span>Status</span>
              <span>Time</span>
              <span>Task ID</span>
              <span></span>
            </div>
            {displayEvents.map((event, i) => {
              const isFailed = !!event.processing_error;
              const isPending = !event.processed && !event.processing_error;
              const statusLabel = isFailed ? 'failed' : isPending ? 'pending' : 'completed';

              return (
                <div
                  key={event.id}
                  className={cn(
                    'grid grid-cols-[60px_1fr_1fr_80px_1.5fr_100px_60px] px-4 py-3 items-center text-[13px]',
                    i % 2 === 0 ? 'bg-card' : 'bg-background',
                  )}
                >
                  <span className="font-mono text-xs font-bold text-accent">{getSourceIcon(event.source)}</span>
                  <span className="font-medium truncate">{event.event_type}</span>
                  <span className="text-xs text-muted-foreground font-mono truncate" title={JSON.stringify(event.payload)}>
                    {truncateJson(event.payload)}
                  </span>
                  <StatusBadge status={statusLabel} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(event.created_at)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                    {event.agent_task_id ? event.agent_task_id.slice(0, 8) + '...' : '--'}
                  </span>
                  <div>
                    {isFailed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Retry this event"
                        onClick={() => retryEvent(event.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
