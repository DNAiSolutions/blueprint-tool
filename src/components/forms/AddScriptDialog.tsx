import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const PILLARS = ['The Math', 'Behind the Build', 'Systems Thinking', 'Industry Spotlights', 'Proof & Results', 'Founder POV', 'Education'];
const PLATFORMS = ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn', 'Facebook'];
const HOOK_METHODS = ['Pattern Interrupt', 'Question Hook', 'Stat/Number', 'Controversial Take', 'Story Open'];

interface AddScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddScriptDialog({ open, onOpenChange }: AddScriptDialogProps) {
  const { user } = useAuth();
  const { clients, selectedClientId } = useClientContext();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    client_id: selectedClientId || '',
    pillar: '',
    platform: '',
    hook_method: '',
    script_text: '',
    caption: '',
    offer: '',
    duration_target: '30',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('scripts').insert({
        user_id: user.id,
        title: form.title.trim(),
        client_id: form.client_id || null,
        pillar: form.pillar || null,
        platforms: form.platform ? [form.platform] : [],
        hook_method: form.hook_method || null,
        script_text: form.script_text.trim() || null,
        caption: form.caption.trim() || null,
        offer: form.offer.trim() || null,
        duration_target: form.duration_target ? Number(form.duration_target) : null,
        status: 'draft',
      });
      if (error) throw error;
      toast.success('Script created');
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      onOpenChange(false);
      setForm({ title: '', client_id: '', pillar: '', platform: '', hook_method: '', script_text: '', caption: '', offer: '', duration_target: '30' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create script');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Content Script</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Stop Paying $3,200/mo for Dead Leads" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={v => set('client_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.business_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pillar</Label>
              <Select value={form.pillar} onValueChange={v => set('pillar', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={v => set('platform', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hook Method</Label>
              <Select value={form.hook_method} onValueChange={v => set('hook_method', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {HOOK_METHODS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration (sec)</Label>
              <Input type="number" min="5" max="600" value={form.duration_target} onChange={e => set('duration_target', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Script Text</Label>
            <Textarea value={form.script_text} onChange={e => set('script_text', e.target.value)} placeholder="Write your script here…" rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input value={form.caption} onChange={e => set('caption', e.target.value)} placeholder="Post caption…" />
            </div>
            <div className="space-y-2">
              <Label>Offer / CTA</Label>
              <Input value={form.offer} onChange={e => set('offer', e.target.value)} placeholder="e.g. Free audit" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Script'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
