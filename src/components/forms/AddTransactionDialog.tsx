import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CATEGORIES = ['Revenue', 'Software', 'Contractors', 'Advertising', 'Equipment', 'Office', 'Travel', 'Other'];

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { user } = useAuth();
  const { clients, selectedClientId } = useClientContext();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    client_id: selectedClientId || '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.amount || !form.date) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: form.type,
        amount: Number(form.amount),
        description: form.description.trim() || null,
        category: form.category || null,
        client_id: form.client_id || null,
        date: form.date,
        is_recurring: form.is_recurring,
        source: 'manual',
      });
      if (error) throw error;
      toast.success('Transaction logged');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onOpenChange(false);
      setForm({ type: 'income', amount: '', description: '', category: '', client_id: '', date: new Date().toISOString().split('T')[0], is_recurring: false });
    } catch (err: any) {
      toast.error(err.message || 'Failed to log transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($) *</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Monthly retainer — Acme PW" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={v => set('client_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.business_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={e => set('is_recurring', e.target.checked)} className="rounded" />
              <Label htmlFor="recurring" className="cursor-pointer">Recurring</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Log Transaction'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
