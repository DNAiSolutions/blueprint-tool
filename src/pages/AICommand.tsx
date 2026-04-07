import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Terminal, Bot, Cpu, CalendarClock, KanbanSquare,
  Brain, FileText, Activity, Wifi, Circle,
} from 'lucide-react';
import { AgentExplorer } from '@/components/command-center/AgentExplorer';
import { ConsoleTab } from '@/components/command-center/ConsoleTab';
import { AgentsTab } from '@/components/command-center/AgentsTab';
import { SkillsTab } from '@/components/command-center/SkillsTab';
import { SchedulerTab } from '@/components/command-center/SchedulerTab';
import { SprintTab } from '@/components/command-center/SprintTab';
import { MemoryTab } from '@/components/command-center/MemoryTab';
import { DocsTab } from '@/components/command-center/DocsTab';
import { ActivityTab } from '@/components/command-center/ActivityTab';
import { ConnectionsTab } from '@/components/command-center/ConnectionsTab';
import { agents, getStatusColor, cronJobs, integrations } from '@/components/command-center/mockData';

type Tab = 'console' | 'agents' | 'skills' | 'scheduler' | 'sprint' | 'memory' | 'docs' | 'activity' | 'connections';

const tabs: { key: Tab; label: string; icon: typeof Terminal }[] = [
  { key: 'console', label: 'Console', icon: Terminal },
  { key: 'agents', label: 'Agents', icon: Bot },
  { key: 'skills', label: 'Skills', icon: Cpu },
  { key: 'scheduler', label: 'Scheduler', icon: CalendarClock },
  { key: 'sprint', label: 'Sprint', icon: KanbanSquare },
  { key: 'memory', label: 'Memory', icon: Brain },
  { key: 'docs', label: 'Docs', icon: FileText },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'connections', label: 'Connections', icon: Wifi },
];

export default function AICommand() {
  const [activeTab, setActiveTab] = useState<Tab>('console');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const onlineCount = agents.filter(a => a.status !== 'offline').length;
  const activeCrons = cronJobs.filter(c => c.status === 'active').length;
  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;

  return (
    <AppLayout hideContextBar>
      <div className="flex flex-col h-full">
        {/* Top Bar — IDE Title + Agent Status */}
        <header className="flex items-center justify-between h-10 px-4 border-b border-[hsl(var(--ghost-border)/0.15)] bg-[hsl(var(--surface))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent animate-misty-pulse" />
              <span className="text-sm font-bold tracking-tight">DNAi Command</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/40">v1.0</span>
          </div>

          {/* Live Agent Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                    selectedAgentId === agent.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={`${agent.name}: ${agent.status}`}
                >
                  <Circle className={cn('h-1.5 w-1.5 fill-current', getStatusColor(agent.status).replace('bg-', 'text-'))} />
                  <span>{agent.shortName}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="flex border-b border-[hsl(var(--ghost-border)/0.15)] bg-[hsl(var(--surface))] shrink-0 overflow-x-auto scrollbar-thin">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high)/0.3)]'
                )}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content — Resizable Panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel — Agent Explorer */}
            <ResizablePanel defaultSize={16} minSize={12} maxSize={25}>
              <AgentExplorer
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />
            </ResizablePanel>

            <ResizableHandle className="w-px bg-[hsl(var(--ghost-border)/0.15)] hover:bg-accent/30 transition-colors" />

            {/* Center Panel — Active Tab */}
            <ResizablePanel defaultSize={84}>
              <div className="h-full bg-[hsl(var(--surface))]">
                {activeTab === 'console' && <ConsoleTab />}
                {activeTab === 'agents' && <AgentsTab />}
                {activeTab === 'skills' && <SkillsTab />}
                {activeTab === 'scheduler' && <SchedulerTab />}
                {activeTab === 'sprint' && <SprintTab />}
                {activeTab === 'memory' && <MemoryTab />}
                {activeTab === 'docs' && <DocsTab />}
                {activeTab === 'activity' && <ActivityTab />}
                {activeTab === 'connections' && <ConnectionsTab />}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Status Bar */}
        <footer className="flex items-center justify-between h-6 px-4 border-t border-[hsl(var(--ghost-border)/0.15)] bg-[hsl(var(--surface))] shrink-0 text-[10px] font-mono">
          <div className="flex items-center gap-4 text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-success text-success" />
              {onlineCount}/{agents.length} agents
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-2.5 w-2.5" />
              {activeCrons} crons
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="h-2.5 w-2.5" />
              {connectedIntegrations} connected
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground/30">
            <span>Claude Opus 4.6</span>
            <span>Ethereal UI</span>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
