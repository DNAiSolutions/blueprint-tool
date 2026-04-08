// Brand panel — swatches + fonts from the active brand kit.
// Clicking a swatch applies the color to the selected layer (context-aware:
// text gets .color, solid gets .color, gradient gets stop[0].color, etc.).

import { useDesignStore } from '../../store';
import type { Layer } from '../../types';
import { ensureFontLoaded } from '../../google-fonts';
import { toast } from 'sonner';
import { Type } from 'lucide-react';

export function BrandPanel() {
  const brandKits = useDesignStore((s) => s.brandKits);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);
  const setActiveBrandKit = useDesignStore((s) => s.setActiveBrandKit);
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const updateLayer = useDesignStore((s) => s.updateLayer);

  const activeKit = brandKits.find((k) => k.id === activeBrandKitId) ?? brandKits[0];

  const applyColor = (hex: string) => {
    if (!project || !selectedCardId || !selectedLayerId) {
      toast.message('Select a layer first', { description: 'Then click a swatch to apply.' });
      return;
    }
    const card = project.cards.find((c) => c.id === selectedCardId);
    const layer = card?.layers.find((l) => l.id === selectedLayerId);
    if (!layer) return;

    // Context-aware: decide which field to set
    switch (layer.type) {
      case 'solid':
      case 'text':
        updateLayer(selectedCardId, selectedLayerId, { color: hex } as Partial<Layer>);
        break;
      case 'gradient': {
        const stops = layer.stops.map((s, i) => (i === 0 ? { ...s, color: hex } : s));
        updateLayer(selectedCardId, selectedLayerId, { stops } as Partial<Layer>);
        break;
      }
      case 'liquid-glass':
        updateLayer(selectedCardId, selectedLayerId, { baseColor: hex } as Partial<Layer>);
        break;
      case 'overlay-gradient':
        updateLayer(selectedCardId, selectedLayerId, { to: hex } as Partial<Layer>);
        break;
      default:
        toast.message('Can\'t apply color to this layer type');
    }
  };

  const applyFont = (font: string) => {
    if (!project || !selectedCardId || !selectedLayerId) {
      toast.message('Select a text layer first');
      return;
    }
    const card = project.cards.find((c) => c.id === selectedCardId);
    const layer = card?.layers.find((l) => l.id === selectedLayerId);
    if (!layer || layer.type !== 'text') {
      toast.message('Font can only be applied to text layers');
      return;
    }
    ensureFontLoaded(font);
    updateLayer(selectedCardId, selectedLayerId, { font } as Partial<Layer>);
  };

  if (!activeKit) {
    return <div className="text-[11px] text-muted-foreground/70 text-center py-6">No brand kit loaded.</div>;
  }

  const colorEntries = Object.entries(activeKit.colors);

  return (
    <div className="space-y-3">
      {/* Kit switcher */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Brand kit
        </label>
        <select
          value={activeKit.id}
          onChange={(e) => setActiveBrandKit(e.target.value)}
          className="w-full h-7 text-[11px] bg-[hsl(var(--surface-low))] border border-border rounded px-2 focus:border-accent/40 outline-none"
        >
          {brandKits.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Color swatches */}
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
          Colors
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {colorEntries.map(([name, hex]) => (
            <button
              key={name}
              onClick={() => applyColor(hex)}
              title={`${name} · ${hex}`}
              className="group aspect-square rounded-md border border-border hover:border-accent/60 hover:scale-105 transition-all relative overflow-hidden"
              style={{ backgroundColor: hex }}
            >
              <div className="absolute inset-x-0 bottom-0 text-[8px] font-mono text-white bg-black/50 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fonts */}
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
          Fonts
        </div>
        <div className="space-y-1">
          <button
            onClick={() => applyFont(activeKit.fonts.display)}
            className="w-full text-left px-2 py-2 rounded border border-border hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
              <Type className="h-2.5 w-2.5" /> Display
            </div>
            <div className="text-sm font-semibold" style={{ fontFamily: `"${activeKit.fonts.display}", serif` }}>
              {activeKit.fonts.display}
            </div>
          </button>
          <button
            onClick={() => applyFont(activeKit.fonts.body)}
            className="w-full text-left px-2 py-2 rounded border border-border hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
              <Type className="h-2.5 w-2.5" /> Body
            </div>
            <div className="text-sm font-semibold" style={{ fontFamily: `"${activeKit.fonts.body}", sans-serif` }}>
              {activeKit.fonts.body}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
