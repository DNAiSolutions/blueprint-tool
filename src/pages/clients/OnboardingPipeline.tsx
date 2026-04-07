// @ts-nocheck - Columns not yet in schema
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Users, CheckCircle2, Phone, Clock } from 'lucide-react';

type Client = Database['public']['Tables']['clients']['Row'];

/* ---------- Column definitions ---------- */
const COLUMNS = [
  { key: 'need_to_onboard', label: 'Need to Onboard', icon: Users, color: 'text-warning' },
  { key: 'call_booked', label: 'Onboard Call Booked', icon: Phone, color: 'text-accent' },
  { key: 'onboarded', label: 'Onboarded', icon: CheckCircle2, color: 'text-success' },
] as const;

type ColumnKey = typeof COLUMNS[number]['key'];

/* ---------- Mock data fallback ---------- */
interface MockClient {
  id: string;
  business_name: string;
  package_tier: string;
  onboarding_status: ColumnKey;
  checklist_pct: number;
  days_in_stage: number;
}

const MOCK_CLIENTS: MockClient[] = [
  { id: 'm1', business_name: 'Gulf Coast HVAC', package_tier: 'growth', onboarding_status: 'need_to_onboard', checklist_pct: 10, days_in_stage: 3 },
  { id: 'm2', business_name: 'Krewe of Dage', package_tier: 'starter', onboarding_status: 'need_to_onboard', checklist_pct: 0, days_in_stage: 1 },
  { id: 'm3', business_name: 'Bayou Landscaping', package_tier: 'growth', onboarding_status: 'call_booked', checklist_pct: 35, days_in_stage: 2 },
  { id: 'm4', business_name: 'Sparkle Clean Pros', package_tier: 'scale', onboarding_status: 'onboarded', checklist_pct: 100, days_in_stage: 0 },
  { id: 'm5', business_name: 'Precision Plumbing', package_tier: 'growth', onboarding_status: 'onboarded', checklist_pct: 85, days_in_stage: 5 },
];

function mapOnboardingStatus(status: string | null): ColumnKey {
  if (!status) return 'need_to_onboard';
  const lower = status.toLowerCase();
  if (lower.includes('booked') || lower.includes('call')) return 'call_booked';
  if (lower.includes('complete') || lower.includes('onboarded') || lower.includes('done')) return 'onboarded';
  return 'need_to_onboard';
}

function tierBadge(tier: string | null) {
  const t = (tier ?? 'starter').toLowerCase();
  const colors: Record<string, string> = {
    starter: 'bg-muted text-muted-foreground',
    growth: 'bg-accent/15 text-accent',
    scale: 'bg-success/15 text-success',
  };
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', colors[t] ?? colors.starter)}>
      {tier ?? 'starter'}
    </span>
  );
}

export default function OnboardingPipeline() {
  // Query real clients
  const { data: dbClients = [] } = useQuery({
    queryKey: ['onboarding_clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .in('status', ['trial', 'onboarding', 'active'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  const hasRealData = dbClients.length > 0;

  // Build display cards
  type DisplayCard = {
    id: string;
    business_name: string;
    package_tier: string;
    column: ColumnKey;
    checklist_pct: number;
    days_in_stage: number;
  };

  const cards: DisplayCard[] = hasRealData
    ? dbClients.map(c => {
        const col = mapOnboardingStatus(c.onboarding_status);
        const daysSinceUpdate = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        // Estimate checklist completion from onboarding status
        const pct = col === 'onboarded' ? 100 : col === 'call_booked' ? 50 : 10;
        return {
          id: c.id,
          business_name: c.business_name,
          package_tier: c.package_tier ?? 'starter',
          column: col,
          checklist_pct: pct,
          days_in_stage: daysSinceUpdate,
        };
      })
    : MOCK_CLIENTS.map(c => ({
        id: c.id,
        business_name: c.business_name,
        package_tier: c.package_tier,
        column: c.onboarding_status,
        checklist_pct: c.checklist_pct,
        days_in_stage: c.days_in_stage,
      }));

  const columnCards = (key: ColumnKey) => cards.filter(c => c.column === key);

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Onboarding Pipeline</h1>
        <span className="text-xs text-muted-foreground font-mono">
          {cards.length} client{cards.length !== 1 ? 's' : ''} in pipeline
        </span>
      </header>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        <div className="grid grid-cols-3 gap-4 h-full">
          {COLUMNS.map(col => {
            const Icon = col.icon;
            const items = columnCards(col.key);
            return (
              <div key={col.key} className="flex flex-col rounded-lg border border-border bg-card/50 overflow-hidden">
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', col.color)} />
                    <span className="text-sm font-semibold">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-auto p-3 space-y-2 scrollbar-thin">
                  {items.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground/50">No clients</div>
                  )}
                  {items.map(card => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-border bg-card p-3 hover:border-accent/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{card.business_name}</span>
                        {tierBadge(card.package_tier)}
                      </div>

                      {/* Checklist Progress */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Checklist</span>
                          <span className="font-mono">{card.checklist_pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              card.checklist_pct === 100 ? 'bg-success' : card.checklist_pct >= 50 ? 'bg-accent' : 'bg-warning',
                            )}
                            style={{ width: `${card.checklist_pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Days in Stage */}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {card.days_in_stage === 0
                            ? 'Today'
                            : `${card.days_in_stage} day${card.days_in_stage !== 1 ? 's' : ''} in stage`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
