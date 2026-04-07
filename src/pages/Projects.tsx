import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  FolderKanban, Plus, Search, ArrowRight, Briefcase, AlertCircle,
  LayoutGrid, Globe, Sparkles, Zap, Palette, Target, Settings2,
} from 'lucide-react';
import { useState } from 'react';

const SERVICE_ICONS: Record<string, typeof Globe> = {
  ai_content: Sparkles,
  website: Globe,
  growth_automations: Zap,
  client_acquisition: Target,
  social_media: LayoutGrid,
  branding: Palette,
  seo: Search,
  custom: Settings2,
};

const SERVICE_LABELS: Record<string, string> = {
  ai_content: 'AI Content',
  website: 'Website',
  growth_automations: 'Growth Automations',
  client_acquisition: 'Client Acquisition',
  social_media: 'Social Media',
  branding: 'Branding',
  seo: 'SEO',
  custom: 'Custom',
};

/* ---------- Mock Projects for empty state ---------- */
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    name: 'DigitalDNA',
    status: 'active',
    services: ['ai_content', 'website', 'growth_automations'],
    openTickets: 1,
    healthScore: 92,
  },
  {
    id: 'mock-2',
    name: 'Sparkle Clean Pros',
    status: 'active',
    services: ['ai_content', 'website', 'social_media'],
    openTickets: 0,
    healthScore: 78,
  },
  {
    id: 'mock-3',
    name: 'Green Valley Landscaping',
    status: 'active',
    services: ['ai_content', 'client_acquisition'],
    openTickets: 2,
    healthScore: 65,
  },
  {
    id: 'mock-4',
    name: 'CoolBreeze HVAC',
    status: 'paused',
    services: ['website'],
    openTickets: 0,
    healthScore: 44,
  },
  {
    id: 'mock-5',
    name: 'Precision Plumbing',
    status: 'active',
    services: ['ai_content', 'website', 'growth_automations', 'client_acquisition'],
    openTickets: 0,
    healthScore: 89,
  },
  {
    id: 'mock-6',
    name: 'Atlas Roofing Co',
    status: 'active',
    services: ['ai_content', 'social_media'],
    openTickets: 1,
    healthScore: 51,
  },
];

function healthColor(score: number) {
  if (score > 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

export default function Projects() {
  const navigate = useNavigate();
  const { projects, services, loading } = useProjects();
  const { stats: ticketStats } = useSupportTickets();
  const [search, setSearch] = useState('');

  // Get client names for real projects
  const clientIds = projects.map(p => p.client_id);
  const { data: clientMap = {} } = useQuery({
    queryKey: ['client_names_projects', clientIds],
    queryFn: async () => {
      if (clientIds.length === 0) return {};
      const { data } = await supabase
        .from('clients')
        .select('id, business_name')
        .in('id', clientIds);
      const map: Record<string, string> = {};
      (data ?? []).forEach(c => { map[c.id] = c.business_name ?? 'Unnamed'; });
      return map;
    },
    enabled: clientIds.length > 0,
  });

  const hasRealData = projects.length > 0;

  const displayProjects = hasRealData
    ? projects.map(p => ({
        id: p.id,
        name: clientMap[p.client_id] ?? p.name,
        status: p.status,
        services: services
          .filter(s => s.project_id === p.id && s.status === 'active')
          .map(s => s.service_type),
        openTickets: 0,
        healthScore: 0,
      }))
    : MOCK_PROJECTS;

  const filtered = search
    ? displayProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : displayProjects;

  const activeCount = displayProjects.filter(p => p.status === 'active').length;
  const totalServices = displayProjects.reduce((s, p) => s + p.services.length, 0);

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-accent" />
          Projects
        </h1>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Project
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Active Projects" value={activeCount} icon={FolderKanban} />
          <KPICard label="Total Services" value={totalServices} icon={Briefcase} />
          <KPICard label="Open Tickets" value={hasRealData ? ticketStats.open : 4} icon={AlertCircle} />
          <KPICard label="Total Projects" value={displayProjects.length} icon={LayoutGrid} />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(project => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group rounded-xl bg-card border border-border p-5 text-left hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold group-hover:text-accent transition-colors">{project.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {project.services.length} active service{project.services.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.openTickets > 0 && (
                      <span className="h-5 min-w-[20px] px-1 rounded-full bg-warning/15 text-warning text-[10px] font-bold flex items-center justify-center">
                        {project.openTickets}
                      </span>
                    )}
                    <StatusBadge status={project.status} />
                  </div>
                </div>

                {/* Service Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.services.map(svc => {
                    const Icon = SERVICE_ICONS[svc] ?? Settings2;
                    return (
                      <span
                        key={svc}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)] text-[10px] font-medium text-muted-foreground"
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {SERVICE_LABELS[svc] ?? svc}
                      </span>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/50">Health:</span>
                    <span className={cn('text-xs font-bold', healthColor(project.healthScore))}>
                      {project.healthScore > 0 ? project.healthScore : '--'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 group-hover:text-accent/60 transition-colors">
                    Open <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
