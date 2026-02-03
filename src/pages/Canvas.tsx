import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/hooks/useAuth';
import { useMetricsCalculator, formatCurrency } from '@/hooks/useMetricsCalculator';
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
  ArrowLeft, 
  Save, 
  Menu,
  Plus,
  BarChart3,
  FileDown,
  Link as LinkIcon,
  Unlink,
  Loader2,
  Edit,
  Trash2,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';
import { QuestionPanel } from '@/components/canvas/QuestionPanel';
import { CanvasNode } from '@/components/canvas/CanvasNode';
import { ConnectorsSVG } from '@/components/canvas/CanvasConnector';
import { NodeEditModal } from '@/components/canvas/NodeEditModal';
import { AddNodeModal } from '@/components/canvas/AddNodeModal';
import { AIReadinessPanel } from '@/components/canvas/AIReadinessPanel';
import { SessionNode, NodeType } from '@/types/session';
import { 
  calculateFunnelPositions, 
  NODE_LEVELS, 
  FUNNEL_LEVELS,
  getCanvasCenterX,
} from '@/utils/funnelLayout';
import { toast } from 'sonner';

// Auto-save interval in milliseconds
const AUTO_SAVE_INTERVAL = 30000;

export default function Canvas() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { currentSession, loadSession, addNode, updateNode, deleteNode, duplicateNode, isSessionReady } = useSession();
  const { user } = useAuth();
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Connect mode state
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [pendingFromNodeId, setPendingFromNodeId] = useState<string | null>(null);

  // Modal states
  const [editingNode, setEditingNode] = useState<SessionNode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Context menu state
  const [contextMenuNode, setContextMenuNode] = useState<SessionNode | null>(null);

  // Selected node for highlighting
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Calculate positioned nodes
  const positionedNodes = useMemo(() => {
    if (!currentSession?.nodes) return [];
    const centerX = getCanvasCenterX(canvasWidth);
    return calculateFunnelPositions(currentSession.nodes, centerX);
  }, [currentSession?.nodes, canvasWidth]);

  // Calculate metrics
  const metrics = useMetricsCalculator(currentSession?.nodes || []);
  
  // Calculate AI Readiness
  const aiReadiness = useAIReadiness(currentSession?.nodes || []);

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSession && currentSession.nodes.length > 0) {
        // Session is already being saved to localStorage by useSession
        setLastSaved(new Date());
        toast.success('Saved', { duration: 2000 });
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          // Deselect node, exit connect mode
          setSelectedNodeId(null);
          setIsConnectMode(false);
          setPendingFromNodeId(null);
          break;
        case 'Tab':
          // Cycle through nodes
          e.preventDefault();
          if (positionedNodes.length > 0) {
            const currentIndex = positionedNodes.findIndex(n => n.id === selectedNodeId);
            const nextIndex = e.shiftKey
              ? (currentIndex - 1 + positionedNodes.length) % positionedNodes.length
              : (currentIndex + 1) % positionedNodes.length;
            setSelectedNodeId(positionedNodes[nextIndex].id);
          }
          break;
        case 'Enter':
          // Open edit modal for selected node
          if (selectedNodeId) {
            const node = positionedNodes.find(n => n.id === selectedNodeId);
            if (node) {
              setEditingNode(node);
              setShowEditModal(true);
            }
          }
          break;
        case 'Delete':
        case 'Backspace':
          // Delete selected node
          if (selectedNodeId && !showEditModal && !showAddModal) {
            e.preventDefault();
            const node = positionedNodes.find(n => n.id === selectedNodeId);
            if (node && window.confirm(`Delete "${node.label}"?`)) {
              deleteNode(selectedNodeId);
              setSelectedNodeId(null);
              toast.success('Node deleted');
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [positionedNodes, selectedNodeId, deleteNode, showEditModal, showAddModal]);

  // Redirect if no session found
  if (!sessionId) {
    navigate('/');
    return null;
  }

  // Handle node click - different behavior in connect mode
  const handleNodeClick = useCallback((node: SessionNode) => {
    if (isConnectMode) {
      if (!pendingFromNodeId) {
        // First click - select "from" node
        setPendingFromNodeId(node.id);
        toast.info(`Selected "${node.label}" as source. Click another node to connect.`);
      } else {
        // Second click - create connection
        if (pendingFromNodeId === node.id) {
          // Clicked same node - cancel
          setPendingFromNodeId(null);
          toast.info('Connection cancelled');
          return;
        }
        
        // Check if connection already exists
        const fromNode = currentSession?.nodes.find(n => n.id === pendingFromNodeId);
        if (fromNode?.connections.includes(node.id)) {
          toast.warning('Connection already exists');
          setPendingFromNodeId(null);
          return;
        }
        
        // Create the connection
        if (fromNode && updateNode) {
          updateNode(pendingFromNodeId, {
            connections: [...fromNode.connections, node.id],
          });
          toast.success(`Connected "${fromNode.label}" → "${node.label}"`);
        }
        setPendingFromNodeId(null);
      }
    } else {
      // Normal mode - toggle selection for highlighting
      setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    }
  }, [isConnectMode, pendingFromNodeId, currentSession?.nodes, updateNode, selectedNodeId]);

  // Handle double-click to edit
  const handleNodeDoubleClick = useCallback((node: SessionNode) => {
    setEditingNode(node);
    setShowEditModal(true);
  }, []);

  // Handle node drag end
  const handleNodeDragEnd = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position });
  }, [updateNode]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, node: SessionNode) => {
    setContextMenuNode(node);
    setSelectedNodeId(node.id);
  }, []);

  // Context menu actions
  const handleEditFromContext = useCallback(() => {
    if (contextMenuNode) {
      setEditingNode(contextMenuNode);
      setShowEditModal(true);
    }
  }, [contextMenuNode]);

  const handleDeleteFromContext = useCallback(() => {
    if (contextMenuNode && window.confirm(`Delete "${contextMenuNode.label}"?`)) {
      deleteNode(contextMenuNode.id);
      setSelectedNodeId(null);
      toast.success('Node deleted');
    }
  }, [contextMenuNode, deleteNode]);

  const handleDuplicateFromContext = useCallback(() => {
    if (contextMenuNode) {
      const newNode = duplicateNode(contextMenuNode.id);
      if (newNode) {
        toast.success(`Duplicated "${contextMenuNode.label}"`);
      }
    }
  }, [contextMenuNode, duplicateNode]);

  // Clear connections for selected node
  const handleClearConnections = useCallback(() => {
    if (!selectedNodeId || !currentSession) return;
    
    const node = currentSession.nodes.find(n => n.id === selectedNodeId);
    if (node && updateNode) {
      updateNode(selectedNodeId, { connections: [] });
      toast.success(`Cleared all connections from "${node.label}"`);
    }
  }, [selectedNodeId, currentSession, updateNode]);

  // Handle connector click - remove connection
  const handleConnectorClick = useCallback((fromNodeId: string, toNodeId: string) => {
    const fromNode = currentSession?.nodes.find(n => n.id === fromNodeId);
    if (fromNode && window.confirm('Remove this connection?')) {
      updateNode(fromNodeId, {
        connections: fromNode.connections.filter(id => id !== toNodeId),
      });
      toast.success('Connection removed');
    }
  }, [currentSession?.nodes, updateNode]);

  // Handle manual save
  const handleManualSave = useCallback(() => {
    setLastSaved(new Date());
    toast.success('Saved', { duration: 2000 });
  }, []);

  // Handle node creation from question answers
  const handleNodeCreate = useCallback((nodeType: string, data: Record<string, any>) => {
    if (!currentSession) {
      console.warn('Cannot create node: session not loaded');
      return;
    }

    // Handle opening add node modal
    if (nodeType === 'add-node-modal') {
      setShowAddModal(true);
      return;
    }
    
    // Handle node updates (for volume/spend data)
    if (nodeType === 'lead-source-update') {
      const existingNode = currentSession.nodes.find(n => 
        n.sourceId === data.sourceId
      );
      if (existingNode && updateNode) {
        // Only update fields that are explicitly provided
        const updates: Partial<SessionNode> = {};
        if (data.volume !== undefined) updates.volume = data.volume;
        if (data.spend !== undefined) updates.spend = data.spend;
        if (data.label) updates.label = data.label;
        updateNode(existingNode.id, updates);
      }
      return;
    }

    // Handle leak alerts
    if (nodeType === 'leak-alert') {
      addNode({
        type: 'custom' as any,
        label: data.label || 'Leak Point',
        volume: 0,
        conversionRate: 0,
        value: 0,
        position: { x: 0, y: 0 },
        connections: [],
        isLeak: true,
        leakReason: data.leakReason,
      });
      return;
    }

    // Handle intake-to-source connection mapping
    if (nodeType === 'intake-connection') {
      const intakeNode = currentSession.nodes.find(n => n.sourceId === data.intakeId);
      if (intakeNode && updateNode) {
        const existingConnections = intakeNode.sourceConnections || [];
        // Prevent duplicates
        if (!existingConnections.includes(data.leadSourceId)) {
          updateNode(intakeNode.id, {
            sourceConnections: [...existingConnections, data.leadSourceId],
          });
        }
      }
      return;
    }
    
    // Create new node (id is generated by addNode)
    addNode({
      type: nodeType as any,
      label: data.label || getNodeLabel(nodeType, data),
      volume: data.volume || 0,
      conversionRate: data.conversionRate || 0,
      value: data.value || 0,
      position: { x: 0, y: 0 },
      connections: [],
      sourceId: data.sourceId,
      spend: data.spend,
      isLeak: data.isLeak,
      leakReason: data.leakReason,
    });
  }, [currentSession, addNode, updateNode]);

  // Handle adding node from modal
  const handleAddNode = useCallback((nodeData: {
    type: NodeType;
    label: string;
    volume: number;
    conversionRate: number;
    spend?: number;
  }) => {
    addNode({
      type: nodeData.type,
      label: nodeData.label,
      volume: nodeData.volume,
      conversionRate: nodeData.conversionRate,
      value: 0,
      position: { x: 0, y: 0 },
      connections: [],
      spend: nodeData.spend,
    });
    toast.success(`Added "${nodeData.label}"`);
  }, [addNode]);

  // Handle editing node from modal
  const handleEditNode = useCallback((nodeId: string, updates: Partial<SessionNode>) => {
    updateNode(nodeId, updates);
    toast.success('Node updated');
  }, [updateNode]);

  // Handle deleting node from modal
  const handleDeleteNode = useCallback((nodeId: string) => {
    deleteNode(nodeId);
    setSelectedNodeId(null);
    toast.success('Node deleted');
  }, [deleteNode]);

  // Get the "from" node for connect mode indicator
  const pendingFromNode = pendingFromNodeId 
    ? currentSession?.nodes.find(n => n.id === pendingFromNodeId) 
    : null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo & Back */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <img src={dnaiLogo} alt="DNAi" className="h-6 w-auto" />
          </Button>
          
          {/* Session Info */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">
              {currentSession?.clientName || 'New Session'}
            </span>
            {currentSession?.industry && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground capitalize">
                  {currentSession.industry.replace('-', ' ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleManualSave}>
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Canvas Area - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Questions Panel */}
        <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0 hidden lg:flex">
          {!isSessionReady ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Loading session...</p>
              </div>
            </div>
          ) : (
            <QuestionPanel 
              sessionId={sessionId} 
              industry={currentSession?.industry}
              onNodeCreate={handleNodeCreate}
            />
          )}
        </aside>

        {/* Center Canvas */}
        <main 
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-background focus:outline-none"
          tabIndex={0}
          onClick={() => {
            // Deselect when clicking on empty canvas
            if (!isConnectMode) {
              setSelectedNodeId(null);
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Canvas Grid Background */}
          <div 
            className="absolute inset-0 min-h-[900px]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
            ref={(el) => {
              if (el) {
                const width = el.clientWidth;
                if (width !== canvasWidth) {
                  setCanvasWidth(width);
                }
              }
            }}
          />

          {/* Funnel Level Labels */}
          <div className="absolute left-4 top-0 bottom-0 w-24 pointer-events-none">
            {FUNNEL_LEVELS.map((level) => (
              <div
                key={level.name}
                className="absolute text-xs text-muted-foreground/50 font-medium uppercase tracking-wider"
                style={{ top: level.yOffset + 20 }}
              >
                {level.name.replace(/-/g, ' ')}
              </div>
            ))}
          </div>

          {/* Connect Mode Indicator */}
          {isConnectMode && pendingFromNode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-accent text-accent-foreground shadow-lg">
              <p className="text-sm font-medium">
                Connecting from: <strong>{pendingFromNode.label}</strong>
              </p>
              <p className="text-xs opacity-80">Click another node or click same node to cancel</p>
            </div>
          )}

          {/* Canvas Content - Empty State */}
          {(!currentSession?.nodes || currentSession.nodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md p-8">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20">
                  <Plus className="h-10 w-10 text-accent" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Start Building Your Map
                </h2>
                <p className="mb-6 text-muted-foreground text-sm">
                  Answer the questions on the left to guide your discovery call. Nodes will be created automatically as you progress.
                </p>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Node Manually
                </Button>
              </div>
            </div>
          )}

          {/* SVG for Connectors */}
          {positionedNodes.length > 0 && (
            <ConnectorsSVG 
              nodes={positionedNodes} 
              selectedNodeId={selectedNodeId || undefined}
              nodeMetrics={metrics.nodeMetrics}
              onConnectorClick={handleConnectorClick}
            />
          )}

          {/* Render Nodes with Context Menu */}
          {positionedNodes.length > 0 && (
            <div className="absolute inset-0 min-h-[900px]">
              {positionedNodes.map((node) => (
                <ContextMenu key={node.id}>
                  <ContextMenuTrigger asChild>
                    <div>
                      <CanvasNode
                        node={node}
                        isSelected={node.id === selectedNodeId || node.id === pendingFromNodeId}
                        onClick={handleNodeClick}
                        onDoubleClick={handleNodeDoubleClick}
                        onDragEnd={handleNodeDragEnd}
                        onContextMenu={handleContextMenu}
                      />
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => {
                      setEditingNode(node);
                      setShowEditModal(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => {
                      duplicateNode(node.id);
                      toast.success(`Duplicated "${node.label}"`);
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                      onClick={() => {
                        if (window.confirm(`Delete "${node.label}"?`)) {
                          deleteNode(node.id);
                          setSelectedNodeId(null);
                          toast.success('Node deleted');
                        }
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}

          {/* Canvas Action Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-lg">
            {/* Connect Mode Toggle */}
            <div className="flex items-center gap-2 px-2">
              <Switch
                id="connect-mode"
                checked={isConnectMode}
                onCheckedChange={(checked) => {
                  setIsConnectMode(checked);
                  setPendingFromNodeId(null);
                  if (checked) {
                    toast.info('Connect Mode ON - Click nodes to link them');
                  }
                }}
              />
              <Label 
                htmlFor="connect-mode" 
                className={`text-sm cursor-pointer flex items-center gap-1 ${isConnectMode ? 'text-accent font-medium' : 'text-muted-foreground'}`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Connect
              </Label>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            {/* Clear Connections - Only show when node is selected */}
            {selectedNodeId && !isConnectMode && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleClearConnections}
                >
                  <Unlink className="h-4 w-4" />
                  Clear Links
                </Button>
                <div className="w-px h-6 bg-border" />
              </>
            )}
            
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Funnel View
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </main>

        {/* Right Sidebar - AI Readiness & Metrics Panel */}
        <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0 hidden xl:flex overflow-hidden">
          {/* Tab Toggle */}
          <div className="flex border-b border-border">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                true ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              🤖 AI Readiness
            </button>
          </div>
          
          {/* AI Readiness Panel */}
          <AIReadinessPanel readiness={aiReadiness} />
        </aside>
      </div>

      {/* Modals */}
      <NodeEditModal
        node={editingNode}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleEditNode}
        onDelete={handleDeleteNode}
      />

      <AddNodeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={handleAddNode}
      />
    </div>
  );
}

// Helper: Get node label from type and data
function getNodeLabel(nodeType: string, data: Record<string, any>): string {
  // If a label was provided, use it
  if (data.label) return data.label;
  
  // Default labels
  const labels: Record<string, string> = {
    'lead-source': 'Lead Source',
    'intake': 'Intake',
    'decision': 'Qualification',
    'conversion': 'Conversion',
    'close': 'Close',
    'fulfillment': 'Fulfillment',
    'review': 'Reviews & Referrals',
  };
  return labels[nodeType] || 'Custom';
}
