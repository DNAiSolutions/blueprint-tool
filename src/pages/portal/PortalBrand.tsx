import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Palette, Upload, Camera, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalBrand() {
  return (
    <AppLayout>
      <header className="flex items-center h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Brand & Assets</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        <div className="grid grid-cols-2 gap-4">
          {/* Clone Photo */}
          <div className="rounded-lg bg-card border border-border p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Camera className="h-4 w-4 text-accent" /> AI Clone Photo
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Upload a photo for your AI clone avatar</p>
            <div className="h-40 rounded-md bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload Photo
              </Button>
            </div>
          </div>

          {/* Clone Recording */}
          <div className="rounded-lg bg-card border border-border p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Mic className="h-4 w-4 text-accent" /> Clone Recording
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Record a video for your HeyGen AI clone</p>
            <div className="h-40 rounded-md bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Follow the recording instructions</p>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload Recording
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Assets */}
        <div className="rounded-lg bg-card border border-border p-5">
          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Palette className="h-4 w-4 text-accent" /> Brand Assets
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Upload logos, brand colors, and any assets you want us to use</p>
          <div className="h-32 rounded-md bg-muted border-2 border-dashed border-border flex items-center justify-center">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload Assets
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
