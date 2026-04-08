// Effects panel — one-click presets that spawn pre-configured layers on the
// current card. Each preset can inject multiple layers at once.

import { useDesignStore } from '../../store';
import { EFFECT_PRESETS, type EffectPreset } from '../../presets';
import { Sparkles, Droplet, Wind, Film } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_META: Record<
  EffectPreset['category'],
  { label: string; icon: React.ComponentType<{ className?: string }>; }
> = {
  gradients: { label: 'Gradients', icon: Droplet },
  glass: { label: 'Glass', icon: Sparkles },
  texture: { label: 'Texture', icon: Wind },
  cinematic: { label: 'Cinematic', icon: Film },
};

export function EffectsPanel() {
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const addLayer = useDesignStore((s) => s.addLayer);
  const selectLayer = useDesignStore((s) => s.selectLayer);

  const activeCard =
    project?.cards.find((c) => c.id === selectedCardId) ?? project?.cards[0];

  const apply = (preset: EffectPreset) => {
    if (!activeCard) {
      toast.error('Open a card first');
      return;
    }
    const layers = preset.build(activeCard);
    layers.forEach((layer) => addLayer(activeCard.id, layer));
    if (layers.length > 0) selectLayer(activeCard.id, layers[layers.length - 1].id);
    toast.success(`${preset.name} applied`);
  };

  // Group by category
  const grouped = EFFECT_PRESETS.reduce<Record<string, EffectPreset[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {(Object.keys(grouped) as EffectPreset['category'][]).map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <div key={cat}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className="h-3 w-3 text-accent" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {meta.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {grouped[cat].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => apply(preset)}
                  className={cn(
                    'text-left px-2 py-2 rounded border border-border hover:border-accent/50 bg-card hover:bg-muted/20 transition-colors',
                  )}
                >
                  <div className="text-[11px] font-semibold truncate">{preset.name}</div>
                  <div className="text-[9px] text-muted-foreground/70 line-clamp-2 leading-tight mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
