import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SessionNode } from '@/types/session';
import { Save, Trash2 } from 'lucide-react';

interface NodeEditModalProps {
  node: SessionNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, updates: Partial<SessionNode>) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeEditModal({ node, open, onOpenChange, onSave, onDelete }: NodeEditModalProps) {
  const [label, setLabel] = useState('');
  const [volume, setVolume] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync form with node data when modal opens
  useEffect(() => {
    if (node) {
      setLabel(node.label || '');
      setVolume(node.volume?.toString() || '');
      setConversionRate(node.conversionRate?.toString() || '');
      setNotes(node.notes || '');
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    onSave(node.id, {
      label: label.trim() || node.label,
      volume: parseFloat(volume) || 0,
      conversionRate: parseFloat(conversionRate) || 0,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!node) return;
    onDelete(node.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  if (!node) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Node
            </DialogTitle>
            <DialogDescription>
              Update the details for this node. Changes will be reflected on the canvas immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter node label..."
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (per month)</Label>
              <Input
                id="volume"
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g., 500"
                min={0}
              />
            </div>

            {/* Conversion Rate */}
            <div className="space-y-2">
              <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
              <div className="relative">
                <Input
                  id="conversionRate"
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  placeholder="e.g., 50"
                  min={0}
                  max={100}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this stage..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{node.label}" from the canvas and disconnect it from all other nodes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
