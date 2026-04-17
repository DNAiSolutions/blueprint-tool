import { FormEvent, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SERVICES = [
  { id: 'website', label: 'Website' },
  { id: 'content', label: 'Content' },
  { id: 'automations', label: 'Automations' },
];

const INDUSTRIES = ['Restaurant', 'Roofing', 'HVAC', 'Landscaping', 'Plumbing', 'Dental', 'Barbershop', 'Beauty', 'Other'];

interface AddLeadEngineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadEngineDialog({ open, onOpenChange }: AddLeadEngineDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(['website']);
  const [form, setForm] = useState({
    sourceFunnel: 'manual_staff_intake',
    niche: '',
    contactName: '',
    businessName: '',
    email: '',
    phone: '',
    industry: '',
    websiteUrl: '',
    businessDescription: '',
    targetAudience: '',
    serviceArea: '',
    featuresNeeded: '',
    brandTone: '',
  });

  const canSubmit = useMemo(() => Boolean(user && form.businessName.trim() && selectedServices.length > 0), [form.businessName, selectedServices.length, user]);

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (serviceId: string, checked: boolean) => {
    setSelectedServices((prev) => checked ? [...prev, serviceId] : prev.filter((item) => item !== serviceId));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !canSubmit) return;

    setLoading(true);
    try {
      const intakePayload = { ...form, selectedServices };
      const { data, error } = await supabase.functions.invoke('lead-engine-submit', {
        body: {
          userId: user.id,
          sourceFunnel: form.sourceFunnel,
          niche: form.niche || null,
          contactName: form.contactName || null,
          businessName: form.businessName,
          industry: form.industry || null,
          email: form.email || null,
          phone: form.phone || null,
          websiteUrl: form.websiteUrl || null,
          selectedServices,
          intakePayload,
        },
      });

      if (error) throw error;

      toast.success('Lead engine submission created');
      queryClient.invalidateQueries({ queryKey: ['lead_engines'] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      if (data?.submissionId) {
        queryClient.invalidateQueries({ queryKey: ['lead_engine', data.submissionId] });
      }
      onOpenChange(false);
      setSelectedServices(['website']);
      setForm({
        sourceFunnel: 'manual_staff_intake',
        niche: '',
        contactName: '',
        businessName: '',
        email: '',
        phone: '',
        industry: '',
        websiteUrl: '',
        businessDescription: '',
        targetAudience: '',
        serviceArea: '',
        featuresNeeded: '',
        brandTone: '',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead engine submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lead Engine Intake</DialogTitle>
          <DialogDescription>
            Staff entrypoint for the same reusable lead magnet contract future funnels will submit by API.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Funnel</Label>
              <Input value={form.sourceFunnel} onChange={(e) => set('sourceFunnel', e.target.value)} placeholder="e.g. vibe_clone_restaurants" />
            </div>
            <div className="space-y-2">
              <Label>Niche</Label>
              <Input value={form.niche} onChange={(e) => set('niche', e.target.value)} placeholder="e.g. Restaurant" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name *</Label>
              <Input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Business name" required />
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Contact name" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 555-5555" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(value) => set('industry', value)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label>Service Area</Label>
              <Input value={form.serviceArea} onChange={(e) => set('serviceArea', e.target.value)} placeholder="New Orleans, LA" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input value={form.targetAudience} onChange={(e) => set('targetAudience', e.target.value)} placeholder="Who this is for" />
            </div>
            <div className="space-y-2">
              <Label>Brand Tone</Label>
              <Input value={form.brandTone} onChange={(e) => set('brandTone', e.target.value)} placeholder="Confident, welcoming, premium..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Description</Label>
            <Textarea value={form.businessDescription} onChange={(e) => set('businessDescription', e.target.value)} rows={4} placeholder="Short description used for research and generation." />
          </div>

          <div className="space-y-2">
            <Label>Features Needed</Label>
            <Textarea value={form.featuresNeeded} onChange={(e) => set('featuresNeeded', e.target.value)} rows={3} placeholder="Booking, testimonials, gallery, menus, forms..." />
          </div>

          <div className="space-y-3">
            <Label>Selected Services *</Label>
            <div className="grid grid-cols-3 gap-3">
              {SERVICES.map((service) => {
                const checked = selectedServices.includes(service.id);
                return (
                  <label key={service.id} className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer">
                    <Checkbox checked={checked} onCheckedChange={(value) => toggleService(service.id, value === true)} />
                    <span className="text-sm font-medium">{service.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit || loading}>{loading ? 'Creating…' : 'Create Lead Engine'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
