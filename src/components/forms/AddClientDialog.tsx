import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const INDUSTRIES = [
  'Pressure Washing', 'Landscaping', 'Roofing', 'HVAC', 'Plumbing',
  'Pool Services', 'Painting', 'Concrete', 'Fencing', 'Lawn Care',
  'Electrical', 'Cleaning', 'Pest Control', 'Moving', 'Other',
];

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    location: '',
    monthly_value: '',
    pipeline_stage: 'leads',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.business_name.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        business_name: form.business_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        industry: form.industry || null,
        location: form.location.trim() || null,
        monthly_value: form.monthly_value ? Number(form.monthly_value) : 0,
        pipeline_stage: form.pipeline_stage,
        is_internal: false,
      });
      if (error) throw error;
      toast.success('Client added');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-context-list'] });
      onOpenChange(false);
      setForm({ business_name: '', contact_name: '', email: '', phone: '', industry: '', location: '', monthly_value: '', pipeline_stage: 'leads' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="e.g. Acme Pressure Washing" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={v => set('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(504) 555-0101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="New Orleans, LA" />
            </div>
            <div className="space-y-2">
              <Label>Monthly Value ($)</Label>
              <Input type="number" min="0" value={form.monthly_value} onChange={e => set('monthly_value', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pipeline Stage</Label>
            <Select value={form.pipeline_stage} onValueChange={v => set('pipeline_stage', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['leads', 'audit', 'strategy', 'build', 'produce', 'live'].map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add Client'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
