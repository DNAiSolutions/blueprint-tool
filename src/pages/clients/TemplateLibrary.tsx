import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useTemplates } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutTemplate, Plus, Clock, Hash,
} from 'lucide-react';

const CATEGORIES = [
  'All', 'website', 'script', 'carousel', 'email_sequence', 'automation', 'content_plan', 'agreement',
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  website: 'bg-accent/15 text-accent border-accent/30',
  script: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,60%)] border-[hsl(270,60%,60%)]/30',
  carousel: 'bg-warning/15 text-warning border-warning/30',
  email_sequence: 'bg-success/15 text-success border-success/30',
  automation: 'bg-[hsl(210,80%,55%)]/15 text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]/30',
  content_plan: 'bg-[hsl(28,80%,55%)]/15 text-[hsl(28,80%,55%)] border-[hsl(28,80%,55%)]/30',
  agreement: 'bg-muted text-muted-foreground border-border',
};

function categoryBadge(cat: string) {
  const style = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.agreement;
  const label = cat.replace(/_/g, ' ');
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border',
      style,
    )}>
      {label}
    </span>
  );
}

/* ---------- mock templates ---------- */
interface MockTemplate {
  id: string;
  category: string;
  industry: string;
  name: string;
  description: string;
  usage_count: number;
}

const MOCK_TEMPLATES: MockTemplate[] = [
  { id: '1', category: 'website', industry: 'Pressure Washing', name: 'Pressure Washing Starter Site', description: 'Full service landing page with booking form, gallery, and review section for pressure washing businesses.', usage_count: 14 },
  { id: '2', category: 'script', industry: 'General', name: 'Before & After Reel Script', description: 'Short-form video script template showing dramatic before/after transformation with hook, reveal, and CTA.', usage_count: 32 },
  { id: '3', category: 'carousel', industry: 'General', name: 'Audit Reveal Carousel', description: '5-slide carousel template for revealing business audit findings with problem-agitation-solution flow.', usage_count: 21 },
  { id: '4', category: 'email_sequence', industry: 'General', name: '7-Day Welcome Sequence', description: 'Automated 7-email onboarding sequence for new clients. Covers expectations, brand kit collection, and first wins.', usage_count: 18 },
  { id: '5', category: 'automation', industry: 'General', name: 'Review Request Automation', description: 'GHL workflow that triggers review requests 24h after service completion with smart follow-up logic.', usage_count: 27 },
  { id: '6', category: 'content_plan', industry: 'Landscaping', name: '60-Day Content Plan -- Landscaping', description: 'Full 60-day posting calendar with pillar topics, hooks, and platform-specific adaptations for landscaping.', usage_count: 9 },
  { id: '7', category: 'agreement', industry: 'General', name: 'Standard Service Agreement', description: 'Legal-reviewed service agreement covering deliverables, timelines, payment terms, and IP ownership.', usage_count: 35 },
  { id: '8', category: 'script', industry: 'HVAC', name: 'HVAC Emergency Offer Reel', description: 'Urgency-driven reel script for HVAC emergency service promotions. Includes seasonal hook variants.', usage_count: 11 },
];

const INDUSTRY_OPTIONS = ['All', 'General', 'Pressure Washing', 'Landscaping', 'HVAC'];

export default function TemplateLibrary() {
  const [catFilter, setCatFilter] = useState<CategoryFilter>('All');
  const [industryFilter, setIndustryFilter] = useState('All');

  const filterCat = catFilter === 'All' ? undefined : catFilter;
  const { templates, loading } = useTemplates({ category: filterCat });

  const hasRealData = templates.length > 0;

  const displayTemplates = hasRealData
    ? templates.map((t) => ({
        id: t.id,
        category: t.category,
        industry: t.industry ?? 'General',
        name: t.name,
        description: t.description ?? '',
        usage_count: t.usage_count,
      }))
    : MOCK_TEMPLATES.filter((t) => {
        if (catFilter !== 'All' && t.category !== catFilter) return false;
        if (industryFilter !== 'All' && t.industry !== industryFilter) return false;
        return true;
      });

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-accent" />
          Template Library
        </h1>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Create Template
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {!hasRealData && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3" /> Showing sample templates
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={catFilter === c ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => setCatFilter(c)}
              >
                {c === 'All' ? 'All' : c.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="h-7 rounded-md border border-border bg-background text-xs px-2 text-foreground"
          >
            {INDUSTRY_OPTIONS.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading templates...</div>
        ) : displayTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No templates match your filters</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTemplates.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 card-hover"
              >
                <div className="flex items-start justify-between">
                  {categoryBadge(t.category)}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Hash className="h-3 w-3" /> {t.usage_count} uses
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug">{t.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{t.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                  <StatusBadge status={t.industry} />
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
