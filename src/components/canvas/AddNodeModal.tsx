import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NodeType } from '@/types/session';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';

interface AddNodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (node: {
    type: NodeType;
    label: string;
    volume: number;
    conversionRate: number;
    spend?: number;
  }) => void;
}

const NODE_TYPE_OPTIONS: { value: NodeType; label: string; icon: string; description: string }[] = [
  { value: 'lead-source', label: 'Lead Source', icon: '📣', description: 'Where prospects come from' },
  { value: 'intake', label: 'Intake', icon: '📞', description: 'First contact handling' },
  { value: 'decision', label: 'Qualification', icon: '✅', description: 'Qualification/approval step' },
  { value: 'conversion', label: 'Conversion', icon: '📈', description: 'Sales call/meeting' },
  { value: 'close', label: 'Close', icon: '💰', description: 'Deal closure' },
  { value: 'fulfillment', label: 'Fulfillment', icon: '🏁', description: 'Post-sale delivery' },
  { value: 'review', label: 'Review', icon: '⭐', description: 'Reviews & Referrals' },
  { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Custom stage' },
];

export function AddNodeModal({ open, onOpenChange, onAdd }: AddNodeModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<NodeType | ''>('');
  const [label, setLabel] = useState('');
  const [volume, setVolume] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [spend, setSpend] = useState('');

  const resetForm = () => {
    setStep('type');
    setSelectedType('');
    setLabel('');
    setVolume('');
    setConversionRate('');
    setSpend('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleNext = () => {
    if (selectedType) {
      // Pre-fill label based on type
      const typeOption = NODE_TYPE_OPTIONS.find(o => o.value === selectedType);
      setLabel(typeOption?.label || '');
      setStep('details');
    }
  };

  const handleBack = () => {
    setStep('type');
  };

  const handleAdd = () => {
    if (!selectedType) return;

    onAdd({
      type: selectedType,
      label: label.trim() || NODE_TYPE_OPTIONS.find(o => o.value === selectedType)?.label || 'Node',
      volume: parseFloat(volume) || 0,
      conversionRate: parseFloat(conversionRate) || 0,
      spend: selectedType === 'lead-source' && spend ? parseFloat(spend) : undefined,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {step === 'type' ? 'Add New Node' : 'Node Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'type' 
              ? 'Select the type of node to add to your canvas.'
              : 'Fill in the details for your new node.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="py-4">
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as NodeType)}
              className="grid grid-cols-2 gap-3"
            >
              {NODE_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col gap-1 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:border-accent peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="add-label">Label</Label>
              <Input
                id="add-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter node label..."
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="add-volume">Volume (per month)</Label>
              <Input
                id="add-volume"
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g., 500"
                min={0}
              />
            </div>

            {/* Conversion Rate */}
            <div className="space-y-2">
              <Label htmlFor="add-conversionRate">Conversion Rate (%)</Label>
              <div className="relative">
                <Input
                  id="add-conversionRate"
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

            {/* Spend (only for lead-source) */}
            {selectedType === 'lead-source' && (
              <div className="space-y-2">
                <Label htmlFor="add-spend">Monthly Spend (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="add-spend"
                    type="number"
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    placeholder="e.g., 1500"
                    min={0}
                    className="pl-7"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === 'details' && (
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'type' ? (
            <Button onClick={handleNext} disabled={!selectedType} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Node
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
