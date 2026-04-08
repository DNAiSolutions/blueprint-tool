import { useDesignStore } from '../store';
import { cn } from '@/lib/utils';
import { Layers, Image, Palette, Type, Sparkles } from 'lucide-react';
import { LayersPanel } from './LayersPanel';

const TABS = [
  { id: 'layers' as const, label: 'Layers', icon: Layers },
  { id: 'assets' as const, label: 'Assets', icon: Image },
  { id: 'brand' as const, label: 'Brand', icon: Palette },
  { id: 'fonts' as const, label: 'Fonts', icon: Type },
  { id: 'effects' as const, label: 'Effects', icon: Sparkles },
];

export function LeftSidebar() {
  const sidebarTab = useDesignStore((s) => s.sidebarTab);
  const setSidebarTab = useDesignStore((s) => s.setSidebarTab);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Tab strip */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = sidebarTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              title={tab.label}
              className={cn(
                'flex-1 flex items-center justify-center h-10 border-b-2 transition-colors',
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3">
        {sidebarTab === 'layers' && <LayersPanel />}
        {sidebarTab === 'assets' && <AssetsPanel />}
        {sidebarTab === 'brand' && <BrandPanel />}
        {sidebarTab === 'fonts' && <FontsPanel />}
        {sidebarTab === 'effects' && <EffectsPanel />}
      </div>
    </aside>
  );
}

function PanelStub({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-8 px-2">
      <p className="text-xs font-semibold mb-1">{title}</p>
      <p className="text-[11px] text-muted-foreground/70">{description}</p>
    </div>
  );
}

function AssetsPanel() {
  return <PanelStub title="Assets" description="Paste Nano Banana / Kling URLs or upload files to use in your designs." />;
}
function BrandPanel() {
  return <PanelStub title="Brand" description="Color swatches and fonts from the active brand kit." />;
}
function FontsPanel() {
  return <PanelStub title="Fonts" description="Search Google Fonts and apply to text layers." />;
}
function EffectsPanel() {
  return <PanelStub title="Effects" description="Gradients, liquid glass, noise, vignette, glitch." />;
}
