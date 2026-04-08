// DesignToolbar — header with project name, brand kit, new card, undo/redo,
// zoom, fit-to-view, save (with dirty indicator), and export (PNG or ZIP).

import { useState } from 'react';
import { useDesignStore } from '../store';
import { useDesignProjects } from '../useDesignProjects';
import { Button } from '@/components/ui/button';
import {
  Save, Download, Plus, Minus, Undo2, Redo2, LayoutGrid,
  ChevronLeft, Maximize2, Loader2, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARD_DIMENSIONS } from '../types';
import type { Card, CardFormat, SolidLayer } from '../types';
import { exportProject } from '../export';
import { toast } from 'sonner';

interface DesignToolbarProps {
  scopeProjectId?: string;
}

export function DesignToolbar({ scopeProjectId }: DesignToolbarProps) {
  const project = useDesignStore((s) => s.project);
  const setProject = useDesignStore((s) => s.setProject);
  const updateProjectMeta = useDesignStore((s) => s.updateProjectMeta);
  const renameProject = useDesignStore((s) => s.renameProject);
  const setDirty = useDesignStore((s) => s.setDirty);
  const dirty = useDesignStore((s) => s.dirty);
  const addCard = useDesignStore((s) => s.addCard);
  const zoom = useDesignStore((s) => s.zoom);
  const setZoom = useDesignStore((s) => s.setZoom);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const canUndo = useDesignStore((s) => s.canUndo());
  const canRedo = useDesignStore((s) => s.canRedo());
  const brandKits = useDesignStore((s) => s.brandKits);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);
  const setActiveBrandKit = useDesignStore((s) => s.setActiveBrandKit);

  const { saveProject } = useDesignProjects(scopeProjectId);

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  if (!project) return null;

  const handleNewCard = () => {
    const format: CardFormat = (project.cards[0]?.format ?? 'feed-square') as CardFormat;
    const dims = CARD_DIMENSIONS[format];
    const bg: SolidLayer = {
      id: `bg-${Date.now()}`,
      type: 'solid',
      color: '#F5F1E8',
      visible: true,
      locked: true,
    };
    const newCard: Card = {
      id: `card-${Date.now()}`,
      name: `Card ${project.cards.length + 1}`,
      format,
      width: dims.w,
      height: dims.h,
      background: bg,
      layers: [],
    };
    addCard(newCard);
  };

  const handleFit = () => {
    // Simple heuristic: pick a zoom that roughly fits all cards side-by-side
    const n = project.cards.length || 1;
    const fit = n === 1 ? 0.5 : n === 2 ? 0.35 : n <= 4 ? 0.22 : 0.15;
    setZoom(fit);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await saveProject(project);
      // Persist the new server-assigned id and timestamps without resetting history
      updateProjectMeta({
        id: saved.id,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
      setDirty(false);
      toast.success('Saved', { description: project.name });
    } catch (err) {
      toast.error('Save failed', { description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { count } = await exportProject(project);
      if (count === 0) {
        toast.error('Nothing to export');
      } else if (count === 1) {
        toast.success('PNG downloaded');
      } else {
        toast.success(`${count} PNGs bundled as ZIP`);
      }
    } catch (err) {
      toast.error('Export failed', { description: (err as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBack = () => {
    if (dirty) {
      if (!window.confirm('You have unsaved changes. Close this project?')) return;
    }
    setProject(null);
  };

  return (
    <div className="h-11 shrink-0 border-b border-border bg-card flex items-center px-3 gap-3">
      {/* Left — back + project name (click to rename) + brand kit */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Back to project grid"
          onClick={handleBack}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {isEditingName ? (
          <input
            type="text"
            value={project.name}
            autoFocus
            onChange={(e) => renameProject(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') setIsEditingName(false);
            }}
            className="text-sm font-semibold bg-transparent border-b border-accent outline-none max-w-[240px]"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
            className="text-sm font-semibold truncate max-w-[200px] hover:text-accent transition-colors"
          >
            {project.name}
          </button>
        )}

        {/* Dirty indicator */}
        {dirty ? (
          <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Unsaved changes" />
        ) : (
          <Check className="h-3 w-3 text-muted-foreground/40" aria-label="Saved" />
        )}

        <span className="text-muted-foreground/30">·</span>
        <select
          value={activeBrandKitId ?? ''}
          onChange={(e) => setActiveBrandKit(e.target.value || null)}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 hover:border-accent/40 focus:border-accent outline-none"
        >
          {brandKits.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Center — layout + new card */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <LayoutGrid className="h-3 w-3" />
          <span className="capitalize">{project.layout.replace('-', ' ')}</span>
        </div>
        <span className="text-muted-foreground/30">·</span>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleNewCard}>
          <Plus className="h-3 w-3" /> New card
        </Button>
      </div>

      {/* Right — undo/redo, zoom, fit, save, export */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canUndo} onClick={undo} title="Undo (Cmd+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canRedo} onClick={redo} title="Redo (Shift+Cmd+Z)">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-0.5 mx-2 rounded border border-border px-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom - 0.1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className={cn('text-[11px] font-mono w-10 text-center text-muted-foreground')}>
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom + 0.1)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFit} title="Fit to view">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save
        </Button>

        <Button
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          Export
        </Button>
      </div>
    </div>
  );
}
