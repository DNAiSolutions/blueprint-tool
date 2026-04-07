import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileText, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { docFiles, agents, getAgent, getAgentBgClass } from './mockData';

export function DocsTab() {
  const [selectedFileId, setSelectedFileId] = useState(docFiles[0]?.id || null);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({ ceo: true, content: true });

  const selectedFile = docFiles.find(f => f.id === selectedFileId);

  // Group files by agent
  const filesByAgent: Record<string, typeof docFiles> = {};
  docFiles.forEach(f => {
    if (!filesByAgent[f.agentId]) filesByAgent[f.agentId] = [];
    filesByAgent[f.agentId].push(f);
  });

  const toggleAgent = (id: string) => setExpandedAgents(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="h-full flex">
      {/* File Tree */}
      <div className="w-56 shrink-0 border-r border-[hsl(var(--ghost-border)/0.15)] flex flex-col">
        <div className="px-3 py-2 border-b border-[hsl(var(--ghost-border)/0.15)]">
          <span className="ai-label">Files</span>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin py-1">
          {Object.entries(filesByAgent).map(([agentId, files]) => {
            const agent = getAgent(agentId);
            const isExpanded = expandedAgents[agentId];
            return (
              <div key={agentId}>
                <button
                  onClick={() => toggleAgent(agentId)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <FolderOpen className="h-3 w-3 text-accent/50" />
                  <span>{agent?.shortName || agentId}/</span>
                </button>
                {isExpanded && files.map(file => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={cn(
                      'w-full flex items-center gap-2 pl-8 pr-3 py-1 text-[11px] transition-colors',
                      selectedFileId === file.id
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))]'
                    )}
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono">{file.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="px-4 py-2 border-b border-[hsl(var(--ghost-border)/0.15)] flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-mono font-semibold">{selectedFile.name}</span>
              {(() => {
                const agent = getAgent(selectedFile.agentId);
                return agent ? (
                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', getAgentBgClass(agent.id))}>
                    {agent.shortName}
                  </span>
                ) : null;
              })()}
              <span className="ml-auto text-[10px] text-muted-foreground/40 uppercase">{selectedFile.type}</span>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto scrollbar-thin">
              <div className="p-4 font-mono text-[12px] leading-relaxed">
                {selectedFile.content.split('\n').map((line, i) => (
                  <div key={i} className="flex hover:bg-[hsl(var(--surface-high)/0.5)] -mx-4 px-4">
                    <span className="w-8 shrink-0 text-right pr-3 text-muted-foreground/25 select-none text-[11px]">
                      {i + 1}
                    </span>
                    <span className={cn(
                      'flex-1',
                      line.startsWith('#') ? 'text-accent font-bold' :
                      line.startsWith('##') ? 'text-accent/80 font-semibold' :
                      line.startsWith('-') || line.startsWith('*') ? 'text-foreground/80' :
                      line.startsWith('"') || line.startsWith('  "') ? 'text-success/70' :
                      line.match(/^\s*[{}[\],]/) ? 'text-muted-foreground' :
                      'text-foreground/70'
                    )}>
                      {line || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground/40 text-sm">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  );
}
