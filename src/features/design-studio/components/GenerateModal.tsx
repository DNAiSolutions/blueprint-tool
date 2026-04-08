// GenerateModal — unified AI image generation dialog.
// One component drives two modes:
//   mode = "background" → the picked image replaces the card's background
//   mode = "image"      → the picked image is added as a new image layer
//
// Wires into the Fal.ai generate-image edge function via ai-client. Users
// pick a model (nano-banana / flux / ideogram), aspect, and prompt, then
// click Generate. Results appear in a grid. Clicking a result either
// swaps the background or inserts a layer and closes the modal.

import { useState, useEffect } from 'react';
import { useDesignStore } from '../store';
import { generateImage, type GeneratedImage, type ImageModel, type Aspect } from '../lib/ai-client';
import { createImageLayer } from '../layer-factories';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ImageLayer, CardFormat } from '../types';

export type GenerateMode = 'background' | 'image';

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: GenerateMode;
}

const MODELS: { id: ImageModel; label: string; hint: string }[] = [
  { id: 'flux',        label: 'FLUX Pro',   hint: 'Cinematic, photorealistic' },
  { id: 'nano-banana', label: 'Nano Banana', hint: 'Fast, great for backgrounds' },
  { id: 'ideogram',    label: 'Ideogram',   hint: 'Best for text + typography' },
];

const ASPECTS: { id: Aspect; label: string }[] = [
  { id: '1:1',  label: 'Square 1:1' },
  { id: '4:5',  label: 'Portrait 4:5' },
  { id: '9:16', label: 'Story 9:16' },
  { id: '16:9', label: 'Landscape 16:9' },
];

// Map the active card format to the best-fitting aspect ratio preset
function cardFormatToAspect(format?: CardFormat): Aspect {
  switch (format) {
    case 'story':         return '9:16';
    case 'portrait':      return '4:5';
    case 'linkedin-wide': return '16:9';
    case 'feed-square':
    default:              return '1:1';
  }
}

export function GenerateModal({ open, onOpenChange, mode }: GenerateModalProps) {
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const updateCard = useDesignStore((s) => s.updateCard);
  const addLayer = useDesignStore((s) => s.addLayer);
  const selectLayer = useDesignStore((s) => s.selectLayer);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);
  const brandKits = useDesignStore((s) => s.brandKits);

  const activeCard =
    project?.cards.find((c) => c.id === selectedCardId) ?? project?.cards[0];
  const activeBrand = brandKits.find((k) => k.id === activeBrandKitId);

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('flux');
  const [aspect, setAspect] = useState<Aspect>(() => cardFormatToAspect(activeCard?.format));
  const [numImages, setNumImages] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [selectedResultUrl, setSelectedResultUrl] = useState<string | null>(null);

  // Sync aspect when opening with a different card format
  useEffect(() => {
    if (open) setAspect(cardFormatToAspect(activeCard?.format));
  }, [open, activeCard?.format]);

  // Reset ephemeral state on close
  useEffect(() => {
    if (!open) {
      setResults([]);
      setSelectedResultUrl(null);
    }
  }, [open]);

  const title = mode === 'background' ? 'Generate Background' : 'Generate Image';
  const description =
    mode === 'background'
      ? 'Claude-enhanced Fal.ai image gen. The result replaces the current card background.'
      : 'Generates a photorealistic image as a new layer. Use the Remove Background action after to get a cutout.';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!activeCard) {
      toast.error('Open a card first');
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setSelectedResultUrl(null);

    try {
      // Blend active brand palette into the prompt for subtle brand bias
      const brandHint = activeBrand?.colors && Object.values(activeBrand.colors).length > 0
        ? ` Brand palette: ${Object.values(activeBrand.colors).slice(0, 4).join(', ')}.`
        : '';

      const finalPrompt =
        mode === 'background'
          ? `${prompt.trim()}. Full-bleed background, no subject in foreground, editorial composition.${brandHint}`
          : `${prompt.trim()}. Isolated subject on a clean neutral backdrop, centered, studio lighting.${brandHint}`;

      const { images } = await generateImage({
        prompt: finalPrompt,
        model,
        aspect,
        numImages,
      });
      setResults(images);
      if (images.length === 0) {
        toast.error('No images generated');
      } else {
        toast.success(`Generated ${images.length} image${images.length === 1 ? '' : 's'}`);
      }
    } catch (err) {
      toast.error('Generation failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePick = (img: GeneratedImage) => {
    if (!activeCard) return;
    setSelectedResultUrl(img.url);

    if (mode === 'background') {
      // Replace the card background with an image layer acting as full-bleed bg
      const imgBg: ImageLayer = {
        id: `bg-img-${Date.now()}`,
        type: 'image',
        url: img.url,
        x: 0,
        y: 0,
        w: activeCard.width,
        h: activeCard.height,
        rotation: 0,
        flipH: false,
        flipV: false,
        opacity: 1,
        blend: 'normal',
        visible: true,
        locked: true,
      };
      // Prepend as the first layer so it stays underneath everything else.
      // (The card's `background` slot only supports solid/gradient, so we
      // insert the image as a locked first entry in `layers` instead.)
      updateCard(activeCard.id, {
        layers: [imgBg, ...activeCard.layers],
      });
      toast.success('Background updated');
    } else {
      const layer = createImageLayer(img.url, activeCard);
      addLayer(activeCard.id, layer);
      selectLayer(activeCard.id, layer.id);
      toast.success('Image added as layer');
    }

    // Close shortly after so the user sees the check animation
    setTimeout(() => onOpenChange(false), 350);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-accent" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">{description}</DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
          <div className="p-5 space-y-4">
            {/* Prompt */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                rows={3}
                placeholder={
                  mode === 'background'
                    ? 'e.g. dramatic red gradient studio backdrop, soft volumetric light, grainy film texture'
                    : 'e.g. crispy chicken sandwich, top-down, dramatic lighting, clean white background'
                }
                className="w-full text-sm bg-[hsl(var(--surface-low))] border border-border rounded-md px-3 py-2 focus:border-accent/40 outline-none placeholder:text-muted-foreground/40 resize-none"
              />
              <p className="text-[10px] text-muted-foreground/60">
                ⌘/Ctrl + Enter to generate.
              </p>
            </div>

            {/* Model picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={cn(
                      'text-left px-3 py-2 rounded-md border transition-colors',
                      model === m.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-border/80',
                    )}
                  >
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect + count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Aspect ratio
                </label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as Aspect)}
                  className="w-full h-8 text-xs bg-[hsl(var(--surface-low))] border border-border rounded-md px-2 focus:border-accent/40 outline-none"
                >
                  {ASPECTS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Variations
                </label>
                <select
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                  className="w-full h-8 text-xs bg-[hsl(var(--surface-low))] border border-border rounded-md px-2 focus:border-accent/40 outline-none"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} image{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results grid */}
            {(isGenerating || results.length > 0) && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Results
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {isGenerating && results.length === 0 && (
                    <>
                      {Array.from({ length: numImages }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-md bg-muted/30 border border-border flex items-center justify-center"
                        >
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ))}
                    </>
                  )}
                  {results.map((img) => {
                    const isPicked = img.url === selectedResultUrl;
                    return (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => handlePick(img)}
                        className={cn(
                          'relative group rounded-md overflow-hidden border-2 transition-all',
                          isPicked
                            ? 'border-accent ring-2 ring-accent/30'
                            : 'border-border hover:border-accent/50',
                        )}
                      >
                        <img
                          src={img.url}
                          alt="generated"
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-semibold text-white bg-accent/80 px-2 py-1 rounded">
                            {mode === 'background' ? 'Use as background' : 'Add as layer'}
                          </span>
                        </div>
                        {isPicked && (
                          <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between shrink-0">
          <p className="text-[10px] text-muted-foreground/60">
            {activeCard
              ? `Target: ${activeCard.name} · ${activeCard.width}×${activeCard.height}`
              : 'No card open'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 min-w-[110px]"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !activeCard}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
