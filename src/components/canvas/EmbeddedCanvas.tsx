import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useSession } from '@/hooks/useSession';
import { useMetricsCalculator } from '@/hooks/useMetricsCalculator';
import { useAIReadiness } from '@/hooks/useAIReadiness';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Plus, Save, Link as LinkIcon, Unlink, Loader2, Edit, Trash2, Copy,
  ZoomIn, ZoomOut, BarChart3, FileDown,
} from 'lucide-react';
import { QuestionPanel } from '@/components/canvas/QuestionPanel';
import { CanvasNode } from '@/components/canvas/CanvasNode';
import { ConnectorsSVG } from '@/components/canvas/CanvasConnector';
import { NodeEditModal } from '@/components/canvas/NodeEditModal';
import { AddNodeModal } from '@/components/canvas/AddNodeModal';
import { AIReadinessPanel } from '@/components/canvas/AIReadinessPanel';
import { SessionNode, NodeType } from '@/types/session';
import {
  calculateFunnelPositions,
  FUNNEL_LEVELS,
  FUNNEL_LEVEL_LABELS,
  getCanvasCenterX,
} from '@/utils/funnelLayout';
import { useCanvasViewport } from '@/hooks/useCanvasViewport';
import { toast } from 'sonner';

interface EmbeddedCanvasProps {
  sessionId: string;
  /** If true, hides the question panel (for compact drawer view) */
  compact?: boolean;
  /** If true, hides the AI readiness sidebar */
  hideReadiness?: boolean;
}

/**
 * Embeddable ALIGN canvas — used both in the full Canvas page
 * and inside the Pipeline drawer's Discovery tab.
 */
export function EmbeddedCanvas({ sessionId, compact = false, hideReadiness = false }: EmbeddedCanvasProps) {
  const { currentSession, loadSession, addNode, updateNode, deleteNode, duplicateNode, isSessionReady } = useSession();
  const [canvasWidth, setCanvasWidth] = useState(1000);

  const {
    zoom: zoomLevel, offset, containerRef: viewportContainerRef,
    zoomIn, zoomOut, setZoom, resetView, fitToContent,
    handleWheel: handleViewportWheel,
    handlePanStart: handleViewportPanStart,
    handlePanMove: handleViewportPanMove,
    handlePanEnd: handleViewportPanEnd,
    screenToCanvas, transform: viewportTransform, isPanning,
  } = useCanvasViewport({ initialZoom: compact ? 0.6 : 0.8 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const [isConnectMode, setIsConnectMode] = useState(false);
  const [pendingFromNodeId, setPendingFromNodeId] = useState<string | null>(null);
  const [dragConnectFromId, setDragConnectFromId] = useState<string | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [editingNode, setEditingNode] = useState<SessionNode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (sessionId) loadSession(sessionId);
  }, [sessionId, loadSession]);

  const positionedNodes = useMemo(() => {
    if (!currentSession?.nodes) return [];
    const centerX = getCanvasCenterX(canvasWidth);
    return calculateFunnelPositions(currentSession.nodes, centerX);
  }, [currentSession?.nodes, canvasWidth]);

  const metrics = useMetricsCalculator(currentSession?.nodes || []);
  const aiReadiness = useAIReadiness(currentSession?.nodes || [], { questionAnswers });

  // --- All the same handlers from Canvas.tsx, condensed ---

  const handleNodeClick = useCallback((node: SessionNode) => {
    if (isConnectMode) {
      if (!pendingFromNodeId) {
        setPendingFromNodeId(node.id);
        setSelectedNodeId(node.id);
        toast.info(`Selected "${node.label}" as source. Click another node to connect.`);
      } else {
        if (pendingFromNodeId === node.id) { setPendingFromNodeId(null); return; }
        const fromNode = currentSession?.nodes.find(n => n.id === pendingFromNodeId);
        if (fromNode?.connections.includes(node.id)) { toast.warning('Connection already exists'); setPendingFromNodeId(null); return; }
        if (fromNode && updateNode) {
          updateNode(pendingFromNodeId, { connections: [...fromNode.connections, node.id] });
          toast.success(`Connected "${fromNode.label}" → "${node.label}"`);
        }
        setPendingFromNodeId(null);
        setSelectedNodeId(null);
      }
    } else {
      setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    }
  }, [isConnectMode, pendingFromNodeId, currentSession?.nodes, updateNode, selectedNodeId]);

  const handleNodeDoubleClick = useCallback((node: SessionNode) => {
    setEditingNode(node); setShowEditModal(true);
  }, []);

  const handleNodeDragEnd = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position, isManuallyPositioned: true });
  }, [updateNode]);

  const handleConnectorClick = useCallback((fromNodeId: string, toNodeId: string) => {
    const fromNode = currentSession?.nodes.find(n => n.id === fromNodeId);
    if (fromNode && window.confirm('Remove this connection?')) {
      updateNode(fromNodeId, { connections: fromNode.connections.filter(id => id !== toNodeId) });
      toast.success('Connection removed');
    }
  }, [currentSession?.nodes, updateNode]);

  const handleClearConnections = useCallback(() => {
    if (!selectedNodeId || !currentSession) return;
    const node = currentSession.nodes.find(n => n.id === selectedNodeId);
    if (node && updateNode) { updateNode(selectedNodeId, { connections: [] }); toast.success(`Cleared connections from "${node.label}"`); }
  }, [selectedNodeId, currentSession, updateNode]);

  const handleStartConnectionDrag = useCallback((nodeId: string, startPoint: { x: number; y: number }) => {
    setDragConnectFromId(nodeId); setDragCursorPos(startPoint);
  }, []);

  const handleCompleteConnectionDrop = useCallback((toNodeId: string) => {
    if (!dragConnectFromId || dragConnectFromId === toNodeId) { setDragConnectFromId(null); setDragCursorPos(null); return; }
    const fromNode = currentSession?.nodes.find(n => n.id === dragConnectFromId);
    if (fromNode && !fromNode.connections.includes(toNodeId)) {
      updateNode(dragConnectFromId, { connections: [...fromNode.connections, toNodeId] });
      const toNode = currentSession?.nodes.find(n => n.id === toNodeId);
      toast.success(`Connected "${fromNode.label}" → "${toNode?.label || 'node'}"`);
    }
    setDragConnectFromId(null); setDragCursorPos(null);
  }, [dragConnectFromId, currentSession?.nodes, updateNode]);

  useEffect(() => {
    if (!dragConnectFromId) return;
    const handleMouseMove = (e: MouseEvent) => { setDragCursorPos(screenToCanvas(e.clientX, e.clientY)); };
    const handleMouseUp = () => { setDragConnectFromId(null); setDragCursorPos(null); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [dragConnectFromId, screenToCanvas]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-pan-area') || target.closest('.canvas-pan-area');
    if (isCanvasBackground && e.button === 0 && !isConnectMode && !dragConnectFromId) handleViewportPanStart(e);
  }, [isConnectMode, dragConnectFromId, handleViewportPanStart]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => { handleViewportPanMove(e); }, [handleViewportPanMove]);
  const handleCanvasMouseUp = useCallback(() => { handleViewportPanEnd(); }, [handleViewportPanEnd]);
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => { handleViewportWheel(e); }, [handleViewportWheel]);

  // Node creation handler (from question engine)
  const handleNodeCreate = useCallback((nodeType: string, data: Record<string, any>) => {
    if (!currentSession) return;
    if (nodeType === 'add-node-modal') { setShowAddModal(true); return; }
    if (nodeType === 'lead-source-update') {
      const existingNode = currentSession.nodes.find(n => n.sourceId === data.sourceId);
      if (existingNode && updateNode) {
        const updates: Partial<SessionNode> = {};
        if (data.volume !== undefined) updates.volume = data.volume;
        if (data.spend !== undefined) updates.spend = data.spend;
        if (data.label) updates.label = data.label;
        updateNode(existingNode.id, updates);
      }
      return;
    }
    if (nodeType === 'leak-alert') {
      addNode({ type: 'custom' as any, label: data.label || 'Leak Point', volume: 0, conversionRate: 0, value: 0, position: { x: 0, y: 0 }, connections: [], isLeak: true, leakReason: data.leakReason });
      return;
    }
    if (nodeType === 'source-to-intake-connection-batch') {
      const leadSourceNode = currentSession.nodes.find(n => n.sourceId === data.leadSourceId);
      if (!leadSourceNode) return;
      const intakeNodeIds: string[] = [];
      (data.intakeIds as string[]).forEach((intakeId: string) => {
        const intakeNode = currentSession.nodes.find(n => n.sourceId === intakeId);
        if (intakeNode) intakeNodeIds.push(intakeNode.id);
      });
      if (intakeNodeIds.length > 0 && updateNode) {
        const allConnections = [...new Set([...(leadSourceNode.connections || []), ...intakeNodeIds])];
        updateNode(leadSourceNode.id, { connections: allConnections });
        toast.success(`Connected ${leadSourceNode.label} → ${intakeNodeIds.length} intake method(s)`);
      }
      return;
    }
    if (nodeType === 'source-to-intake-connection') {
      const leadSourceNode = currentSession.nodes.find(n => n.sourceId === data.leadSourceId);
      const intakeNode = currentSession.nodes.find(n => n.sourceId === data.intakeId);
      if (leadSourceNode && intakeNode && updateNode) {
        const existing = leadSourceNode.connections || [];
        if (!existing.includes(intakeNode.id)) updateNode(leadSourceNode.id, { connections: [...existing, intakeNode.id] });
      }
      return;
    }
    if (nodeType === 'intake-to-qualification-batch') {
      const qualNode = currentSession.nodes.find(n => n.type === 'decision');
      if (!qualNode) return;
      const intakeNodes = currentSession.nodes.filter(n => n.type === 'intake');
      intakeNodes.forEach(intakeNode => {
        const existing = intakeNode.connections || [];
        if (!existing.includes(qualNode.id)) updateNode(intakeNode.id, { connections: [...existing, qualNode.id] });
      });
      return;
    }
    if (nodeType === 'qualification-to-paths-batch') {
      const qualNode = currentSession.nodes.find(n => n.type === 'decision');
      if (!qualNode) return;
      const workflowNodeIds: string[] = [];
      (data.pathSourceIds as string[]).forEach(sourceId => {
        const wn = currentSession.nodes.find(n => n.type === 'workflow' && n.sourceId === sourceId);
        if (wn) workflowNodeIds.push(wn.id);
      });
      if (workflowNodeIds.length > 0) {
        const allConns = [...new Set([...(qualNode.connections || []), ...workflowNodeIds])];
        updateNode(qualNode.id, { connections: allConns });
      }
      return;
    }

    let connectToNodeIds: string[] = [];
    if (data.autoConnectToLeadSources && currentSession) {
      connectToNodeIds = currentSession.nodes.filter(n => n.type === 'lead-source').map(n => n.id);
    }
    addNode({
      type: nodeType as any, label: data.label || nodeType, volume: data.volume || 0,
      conversionRate: data.conversionRate || 0, value: data.value || 0, position: { x: 0, y: 0 },
      connections: [], sourceId: data.sourceId, spend: data.spend, isLeak: data.isLeak,
      leakReason: data.leakReason, sourceConnections: connectToNodeIds.length > 0 ? connectToNodeIds : undefined,
      criteria: data.criteria, criteriaLabels: data.criteriaLabels, pathType: data.pathType,
    });
  }, [currentSession, addNode, updateNode]);

  const handleAddNode = useCallback((nodeData: { type: NodeType; label: string; volume: number; conversionRate: number; spend?: number }) => {
    addNode({ type: nodeData.type, label: nodeData.label, volume: nodeData.volume, conversionRate: nodeData.conversionRate, value: 0, position: { x: 0, y: 0 }, connections: [], spend: nodeData.spend });
    toast.success(`Added "${nodeData.label}"`);
  }, [addNode]);

  const handleEditNode = useCallback((nodeId: string, updates: Partial<SessionNode>) => {
    updateNode(nodeId, updates); toast.success('Node updated');
  }, [updateNode]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    deleteNode(nodeId); setSelectedNodeId(null); toast.success('Node deleted');
  }, [deleteNode]);

  const pendingFromNode = pendingFromNodeId ? currentSession?.nodes.find(n => n.id === pendingFromNodeId) : null;

  if (!isSessionReady) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left Sidebar - Questions Panel (hidden in compact) */}
      {!compact && (
        <aside className="w-80 bg-card flex flex-col shrink-0 hidden lg:flex">
          <QuestionPanel
            sessionId={sessionId}
            industry={currentSession?.industry}
            onNodeCreate={handleNodeCreate}
            onAnswersChange={setQuestionAnswers}
          />
        </aside>
      )}

      {/* Center Canvas */}
      <main
        ref={canvasRef}
        className={`flex-1 relative overflow-auto bg-background focus:outline-none ${isPanning ? 'cursor-grabbing' : ''}`}
        tabIndex={0}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        onClick={() => { if (!isConnectMode && !isPanning) setSelectedNodeId(null); }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute origin-top-left transition-transform duration-100"
          style={{ transform: viewportTransform, width: '2000px', height: '1800px' }}
        >
          {/* Grid */}
          <div
            className="canvas-pan-area absolute inset-0"
            style={{
              minHeight: '1800px', minWidth: '2000px',
              backgroundImage: `linear-gradient(to right, hsl(var(--border) / 0.25) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.25) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
            ref={(el) => { if (el && el.clientWidth !== canvasWidth) setCanvasWidth(el.clientWidth); }}
          />

          {/* Funnel Labels */}
          <div className="absolute left-4 top-0 bottom-0 w-36 pointer-events-none">
            {FUNNEL_LEVELS.map((level) => (
              <div key={level.level} className="absolute text-[11px] text-muted-foreground/70 font-medium uppercase tracking-normal" style={{ top: level.yOffset + 20 }}>
                {FUNNEL_LEVEL_LABELS[level.level] || level.name.replace(/-/g, ' ')}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {(!currentSession?.nodes || currentSession.nodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md p-8">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">Start Building Your Map</h2>
                <p className="mb-6 text-muted-foreground text-sm">
                  {compact ? 'Use the question panel to guide discovery.' : 'Answer the questions on the left to guide your discovery call.'}
                </p>
                <Button onClick={() => setShowAddModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Node Manually</Button>
              </div>
            </div>
          )}

          {/* Connectors */}
          {positionedNodes.length > 0 && (
            <ConnectorsSVG nodes={positionedNodes} selectedNodeId={selectedNodeId || undefined} nodeMetrics={metrics.nodeMetrics} onConnectorClick={handleConnectorClick} />
          )}

          {/* Drag-to-connect preview */}
          {dragConnectFromId && dragCursorPos && (
            <svg className="absolute inset-0 pointer-events-none z-40" style={{ minWidth: '100%', minHeight: '100%' }}>
              {(() => {
                const fromNode = positionedNodes.find(n => n.id === dragConnectFromId);
                if (!fromNode) return null;
                return <line x1={fromNode.position.x + 175} y1={fromNode.position.y + 40} x2={dragCursorPos.x} y2={dragCursorPos.y} stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />;
              })()}
            </svg>
          )}

          {/* Nodes */}
          {positionedNodes.length > 0 && (
            <div className="absolute inset-0 min-h-[1800px] min-w-[2000px]">
              {positionedNodes.map((node) => (
                <ContextMenu key={node.id}>
                  <ContextMenuTrigger asChild>
                    <div>
                      <CanvasNode
                        node={node} isSelected={node.id === selectedNodeId || node.id === pendingFromNodeId}
                        isConnectionDragging={!!dragConnectFromId && dragConnectFromId !== node.id}
                        isConnectModeActive={isConnectMode} isPendingSource={node.id === pendingFromNodeId}
                        onClick={handleNodeClick} onDoubleClick={handleNodeDoubleClick}
                        onDragEnd={handleNodeDragEnd} onContextMenu={() => {}}
                        onStartConnectionDrag={handleStartConnectionDrag} onCompleteConnectionDrop={handleCompleteConnectionDrop}
                      />
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => { setEditingNode(node); setShowEditModal(true); }}><Edit className="h-4 w-4 mr-2" />Edit</ContextMenuItem>
                    <ContextMenuItem onClick={() => { duplicateNode(node.id); toast.success(`Duplicated "${node.label}"`); }}><Copy className="h-4 w-4 mr-2" />Duplicate</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => { if (window.confirm(`Delete "${node.label}"?`)) { deleteNode(node.id); setSelectedNodeId(null); toast.success('Node deleted'); } }} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </div>

        {/* Connect Mode Indicator */}
        {isConnectMode && pendingFromNode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-lg">
            <p className="text-sm font-medium">Connecting from: <strong>{pendingFromNode.label}</strong></p>
            <p className="text-xs opacity-80">Click another node or click same node to cancel</p>
          </div>
        )}

        {/* Canvas Action Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl bg-card shadow-level-2">
          <div className="flex items-center gap-2 px-2">
            <Switch id="connect-mode-embedded" checked={isConnectMode} onCheckedChange={(checked) => { setIsConnectMode(checked); setPendingFromNodeId(null); if (checked) toast.info('Connect Mode ON'); }} />
            <Label htmlFor="connect-mode-embedded" className={`text-sm cursor-pointer flex items-center gap-1 ${isConnectMode ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              <LinkIcon className="h-3.5 w-3.5" />Connect
            </Label>
          </div>
          <div className="w-px h-6 bg-muted" />
          {selectedNodeId && !isConnectMode && (
            <>
              <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleClearConnections}><Unlink className="h-4 w-4" />Clear</Button>
              <div className="w-px h-6 bg-muted" />
            </>
          )}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={zoomLevel <= 0.25}><ZoomOut className="h-4 w-4" /></Button>
            <button className="text-xs text-muted-foreground w-12 text-center hover:text-foreground transition-colors" onClick={resetView}>{Math.round(zoomLevel * 100)}%</button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={zoomLevel >= 2}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => fitToContent(positionedNodes)}>Fit</Button>
          </div>
        </div>
      </main>

      {/* Right Sidebar - AI Readiness (hidden in compact or when requested) */}
      {!compact && !hideReadiness && (
        <aside className="w-80 bg-card flex flex-col shrink-0 hidden xl:flex overflow-hidden">
          <div className="flex">
            <button className="flex-1 py-3 px-4 text-sm font-medium bg-primary/10 text-primary border-b-2 border-primary">🤖 AI Readiness</button>
          </div>
          <AIReadinessPanel readiness={aiReadiness} />
        </aside>
      )}

      {/* Modals */}
      <NodeEditModal node={editingNode} open={showEditModal} onOpenChange={setShowEditModal} onSave={handleEditNode} onDelete={handleDeleteNode} />
      <AddNodeModal open={showAddModal} onOpenChange={setShowAddModal} onAdd={handleAddNode} />
    </div>
  );
}
