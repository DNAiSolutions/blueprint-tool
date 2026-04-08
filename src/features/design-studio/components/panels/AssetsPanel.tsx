// Assets panel — paste a URL to drop an image/video layer onto the current
// card. Files dropped or selected become object URLs for the session so the
// user can see them immediately (persistent upload comes in Commit 4).

import { useState } from 'react';
import { useDesignStore } from '../../store';
import { createImageLayer, createVideoLayer } from '../../layer-factories';
import { Button } from '@/components/ui/button';
import {
  Upload, Link as LinkIcon, Film, Image as ImageIcon, Sparkles, Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GenerateModal, type GenerateMode } from '../GenerateModal';

interface SessionAsset {
  id: string;
  url: string;
  kind: 'image' | 'video';
  name: string;
}

function guessKind(url: string): 'image' | 'video' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) return 'video';
  return 'image';
}

export function AssetsPanel() {
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const addLayer = useDesignStore((s) => s.addLayer);
  const selectLayer = useDesignStore((s) => s.selectLayer);

  const [url, setUrl] = useState('');
  const [assets, setAssets] = useState<SessionAsset[]>([]);
  const [genMode, setGenMode] = useState<GenerateMode | null>(null);

  const activeCard =
    project?.cards.find((c) => c.id === selectedCardId) ?? project?.cards[0];

  const addAssetToCanvas = (asset: SessionAsset) => {
    if (!activeCard) {
      toast.error('Open a card first');
      return;
    }
    const layer =
      asset.kind === 'video'
        ? createVideoLayer(asset.url, activeCard)
        : createImageLayer(asset.url, activeCard);
    addLayer(activeCard.id, layer);
    selectLayer(activeCard.id, layer.id);
  };

  const handleAddUrl = () => {
    if (!url.trim()) return;
    const kind = guessKind(url);
    const asset: SessionAsset = {
      id: `asset-${Date.now()}`,
      url: url.trim(),
      kind,
      name: url.split('/').pop() ?? 'Asset',
    };
    setAssets((prev) => [asset, ...prev]);
    addAssetToCanvas(asset);
    setUrl('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      const asset: SessionAsset = {
        id: `asset-${Date.now()}-${Math.random()}`,
        url: objectUrl,
        kind: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
      };
      setAssets((prev) => [asset, ...prev]);
      addAssetToCanvas(asset);
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* AI Generation */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-accent" /> Generate with AI
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] gap-1 justify-start"
            onClick={() => setGenMode('background')}
          >
            <Wand2 className="h-3 w-3 text-accent" /> Background
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] gap-1 justify-start"
            onClick={() => setGenMode('image')}
          >
            <ImageIcon className="h-3 w-3 text-accent" /> Image
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          FLUX Pro, Nano Banana, Ideogram via Fal.ai.
        </p>
      </div>

      {/* Paste URL */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Paste image / video URL
        </label>
        <div className="flex gap-1">
          <div className="flex-1 flex items-center gap-1 bg-[hsl(var(--surface-low))] border border-border rounded px-2">
            <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              placeholder="https://…"
              className="flex-1 h-7 text-[11px] bg-transparent outline-none"
            />
          </div>
          <Button size="sm" className="h-7 text-[11px] px-2" onClick={handleAddUrl}>
            Add
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          Works with Nano Banana, Kling, any CDN. .mp4 / .webm / .mov become video layers.
        </p>
      </div>

      {/* Upload */}
      <label className="block cursor-pointer border border-dashed border-border hover:border-accent/40 rounded-md p-3 text-center transition-colors">
        <Upload className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
        <div className="text-[11px] text-muted-foreground">Upload file</div>
        <div className="text-[10px] text-muted-foreground/50 mt-0.5">
          Session only — persists on save
        </div>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </label>

      <GenerateModal
        open={genMode !== null}
        onOpenChange={(open) => !open && setGenMode(null)}
        mode={genMode ?? 'image'}
      />

      {/* Session assets */}
      {assets.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
            Session assets
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => addAssetToCanvas(asset)}
                title={asset.name}
                className="group aspect-square rounded overflow-hidden bg-muted border border-border hover:border-accent/50 transition-colors relative"
              >
                {asset.kind === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-0.5 right-0.5 bg-background/80 rounded px-1 py-0.5">
                  {asset.kind === 'image' ? (
                    <ImageIcon className="h-2.5 w-2.5" />
                  ) : (
                    <Film className="h-2.5 w-2.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
