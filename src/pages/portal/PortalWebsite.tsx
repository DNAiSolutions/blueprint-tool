import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Globe, ExternalLink, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Website = Database['public']['Tables']['websites']['Row'];

function deployStatusLabel(status: string) {
  switch (status) {
    case 'deployed':
    case 'live':
      return { label: 'Live', icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" /> };
    case 'pending':
    case 'building':
      return { label: 'Building', icon: <Clock className="h-3.5 w-3.5 text-warning" /> };
    case 'error':
      return { label: 'Error', icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> };
    default:
      return { label: 'Draft', icon: <Globe className="h-3.5 w-3.5 text-muted-foreground" /> };
  }
}

export default function PortalWebsite() {
  const { clientRecord } = useAuth();

  const { data: website } = useQuery({
    queryKey: ['portal_website', clientRecord?.id],
    queryFn: async () => {
      if (!clientRecord?.id) return null;
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('client_id', clientRecord.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Website | null;
    },
    enabled: !!clientRecord?.id,
  });

  const domain = website?.domain ?? 'yoursite.digitaldna.agency';
  const deployUrl = website?.deploy_url ?? null;
  const deployStatus = website?.deploy_status ?? 'draft';
  const lastDeployed = website?.last_deployed
    ? new Date(website.last_deployed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not deployed yet';
  const provider = website?.deploy_provider ?? 'Vercel';
  const statusInfo = deployStatusLabel(deployStatus);

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">My Website</h1>
        <StatusBadge status={deployStatus === 'deployed' ? 'live' : deployStatus} />
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Your Website</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Managed and hosted by DigitalDNA</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="h-3 w-3" /> Request Changes
              </Button>
              {deployUrl ? (
                <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5">
                    <ExternalLink className="h-3 w-3" /> View Live Site
                  </Button>
                </a>
              ) : (
                <Button size="sm" className="gap-1.5" disabled>
                  <ExternalLink className="h-3 w-3" /> View Live Site
                </Button>
              )}
            </div>
          </div>

          {/* Preview Frame */}
          {deployUrl ? (
            <div className="rounded-lg border border-border overflow-hidden aspect-video">
              <iframe
                src={deployUrl}
                title="Website Preview"
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-muted border border-border aspect-video flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Website preview will load here</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{domain}</p>
              </div>
            </div>
          )}

          {/* Site Details */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Domain</p>
              <p className="text-xs font-mono font-semibold mt-0.5">{domain}</p>
            </div>
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Deployed</p>
              <p className="text-xs font-mono font-semibold mt-0.5">{lastDeployed}</p>
            </div>
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deploy Status</p>
              <p className="text-xs font-mono font-semibold mt-0.5 flex items-center gap-1.5">
                {statusInfo.icon}
                {statusInfo.label}
              </p>
            </div>
          </div>

          {/* Hosting Info */}
          <div className="mt-3 p-3 rounded-md bg-background border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hosting Provider</p>
            <p className="text-xs font-mono font-semibold mt-0.5">{provider}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
