import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalWebsite() {
  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">My Website</h1>
        <StatusBadge status="live" />
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
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="h-3 w-3" /> View Live Site
              </Button>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="rounded-lg bg-muted border border-border aspect-video flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Website preview will load here</p>
              <p className="text-xs text-muted-foreground/50 mt-1">yoursite.digitaldna.agency</p>
            </div>
          </div>

          {/* Site Details */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Domain</p>
              <p className="text-xs font-mono font-semibold mt-0.5">yoursite.digitaldna.agency</p>
            </div>
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Updated</p>
              <p className="text-xs font-mono font-semibold mt-0.5">Apr 5, 2026</p>
            </div>
            <div className="p-3 rounded-md bg-background border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hosting</p>
              <p className="text-xs font-mono font-semibold mt-0.5">Vercel</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
