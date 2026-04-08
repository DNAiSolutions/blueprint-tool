// Fonts panel — curated Google Fonts with live preview. Clicking a font
// injects the stylesheet and applies it to the selected text layer.

import { useMemo, useState, useEffect } from 'react';
import { useDesignStore } from '../../store';
import type { Layer } from '../../types';
import { GOOGLE_FONTS, loadGoogleFont, type GoogleFont } from '../../google-fonts';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES: { id: GoogleFont['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'display', label: 'Display' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
  { id: 'handwriting', label: 'Script' },
];

export function FontsPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GoogleFont['category'] | 'all'>('all');

  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const updateLayer = useDesignStore((s) => s.updateLayer);

  // Preload the visible fonts so their previews render
  useEffect(() => {
    GOOGLE_FONTS.slice(0, 12).forEach(loadGoogleFont);
  }, []);

  const filtered = useMemo(() => {
    return GOOGLE_FONTS.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, category]);

  const selectedLayer = useMemo(() => {
    if (!project || !selectedCardId || !selectedLayerId) return null;
    const card = project.cards.find((c) => c.id === selectedCardId);
    return card?.layers.find((l) => l.id === selectedLayerId) ?? null;
  }, [project, selectedCardId, selectedLayerId]);

  const applyFont = (font: GoogleFont) => {
    loadGoogleFont(font);
    if (!selectedLayer || selectedLayer.type !== 'text' || !selectedCardId) {
      toast.message('Select a text layer to apply this font');
      return;
    }
    updateLayer(selectedCardId, selectedLayer.id, { font: font.name } as Partial<Layer>);
  };

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="flex items-center gap-1.5 bg-[hsl(var(--surface-low))] border border-border rounded px-2">
        <Search className="h-3 w-3 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fonts"
          className="flex-1 h-7 text-[11px] bg-transparent outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
              category === c.id
                ? 'bg-accent text-accent-foreground border-accent'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Font list */}
      <div className="space-y-1">
        {filtered.map((font) => {
          const active = selectedLayer?.type === 'text' && selectedLayer.font === font.name;
          return (
            <button
              key={font.name}
              onMouseEnter={() => loadGoogleFont(font)}
              onClick={() => applyFont(font)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded border transition-colors',
                active
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/40',
              )}
            >
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
                {font.category}
              </div>
              <div
                className="text-sm leading-tight truncate"
                style={{ fontFamily: `"${font.name}", sans-serif` }}
              >
                {font.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
