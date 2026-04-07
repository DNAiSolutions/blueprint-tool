import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Star, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalReviews() {
  return (
    <AppLayout>
      <header className="flex items-center h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Reviews</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Share Your Experience</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                We'd love to hear how DigitalDNA has helped your business. Upload a short video review
                and we'll feature it in our portfolio (with your permission).
              </p>
              <div className="mt-4">
                <div className="h-40 rounded-md bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <Star className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Upload Video Review
                    </Button>
                    <p className="text-[10px] text-muted-foreground/50 mt-2">MP4, MOV — up to 100MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
