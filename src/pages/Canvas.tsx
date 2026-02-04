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
  ZoomIn,
  ZoomOut,
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
  const [zoomLevel, setZoomLevel] = useState(0.8); // Start slightly zoomed out for overview
  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas panning state (Miro-like)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Connect mode state
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [pendingFromNodeId, setPendingFromNodeId] = useState<string | null>(null);

  // Drag-to-connect state
  const [dragConnectFromId, setDragConnectFromId] = useState<string | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);

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

  // Note: sessionId check moved after all hook definitions to avoid React lint errors

  // Handle node click - different behavior in connect mode
  const handleNodeClick = useCallback((node: SessionNode) => {
    console.log('[Connect] Node clicked:', node.label, 'isConnectMode:', isConnectMode, 'pendingFromNodeId:', pendingFromNodeId);
    
    if (isConnectMode) {
      if (!pendingFromNodeId) {
        // First click - select "from" node
        setPendingFromNodeId(node.id);
        setSelectedNodeId(node.id); // Highlight the selected source node
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
          console.log('[Connect] Creating connection:', fromNode.label, '→', node.label);
          updateNode(pendingFromNodeId, {
            connections: [...fromNode.connections, node.id],
          });
          toast.success(`Connected "${fromNode.label}" → "${node.label}"`);
        }
        // After connecting, stay in connect mode but clear pendingFrom for next connection
        setPendingFromNodeId(null);
        setSelectedNodeId(null);
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

  // Handle node drag end - mark as manually positioned to prevent auto-layout
  const handleNodeDragEnd = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position, isManuallyPositioned: true });
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

  // Drag-to-connect handlers
  const handleStartConnectionDrag = useCallback((nodeId: string, startPoint: { x: number; y: number }) => {
    setDragConnectFromId(nodeId);
    setDragCursorPos(startPoint);
  }, []);

  const handleCompleteConnectionDrop = useCallback((toNodeId: string) => {
    if (!dragConnectFromId || dragConnectFromId === toNodeId) {
      setDragConnectFromId(null);
      setDragCursorPos(null);
      return;
    }
    
    const fromNode = currentSession?.nodes.find(n => n.id === dragConnectFromId);
    if (fromNode && !fromNode.connections.includes(toNodeId)) {
      updateNode(dragConnectFromId, {
        connections: [...fromNode.connections, toNodeId],
      });
      const toNode = currentSession?.nodes.find(n => n.id === toNodeId);
      toast.success(`Connected "${fromNode.label}" → "${toNode?.label || 'node'}"`);
    }
    
    setDragConnectFromId(null);
    setDragCursorPos(null);
  }, [dragConnectFromId, currentSession?.nodes, updateNode]);

  // Track mouse position during drag-to-connect
  useEffect(() => {
    if (!dragConnectFromId) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scrollLeft = canvas.scrollLeft;
      const scrollTop = canvas.scrollTop;
      
      // Convert to canvas coordinates, accounting for zoom
      setDragCursorPos({
        x: (e.clientX - rect.left + scrollLeft) / zoomLevel,
        y: (e.clientY - rect.top + scrollTop) / zoomLevel,
      });
    };
    
    const handleMouseUp = () => {
      // If we mouseup without hitting a target node, cancel
      setDragConnectFromId(null);
      setDragCursorPos(null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragConnectFromId, zoomLevel]);

  // Miro-like panning: start panning when clicking on empty canvas background
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning if clicking directly on the canvas (not on a node)
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-pan-area') || 
                                target.closest('.canvas-pan-area');
    
    if (isCanvasBackground && e.button === 0 && !isConnectMode && !dragConnectFromId) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      const canvas = canvasRef.current;
      if (canvas) {
        setScrollStart({ x: canvas.scrollLeft, y: canvas.scrollTop });
      }
    }
  }, [isConnectMode, dragConnectFromId]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && canvasRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasRef.current.scrollLeft = scrollStart.x - dx;
      canvasRef.current.scrollTop = scrollStart.y - dy;
    }
  }, [isPanning, panStart, scrollStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom (Ctrl/Cmd + scroll)
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoomLevel(z => Math.max(0.25, Math.min(2, z + delta)));
    }
  }, []);

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

    // Handle source-to-intake connection mapping (lead source → intake)
    // BATCHED VERSION: Accepts multiple intake IDs at once
    if (nodeType === 'source-to-intake-connection-batch') {
      const leadSourceNode = currentSession.nodes.find(n => n.sourceId === data.leadSourceId);
      
      console.log('[DEBUG] source-to-intake-connection-batch', {
        leadSourceId: data.leadSourceId,
        intakeIds: data.intakeIds,
        leadSourceNode: leadSourceNode ? { id: leadSourceNode.id, label: leadSourceNode.label } : null,
      });
      
      if (!leadSourceNode) {
        console.warn('[DEBUG] Lead source node not found for sourceId:', data.leadSourceId);
        return;
      }
      
      // Collect all intake node IDs
      const intakeNodeIds: string[] = [];
      (data.intakeIds as string[]).forEach((intakeId: string) => {
        const intakeNode = currentSession.nodes.find(n => n.sourceId === intakeId);
        if (intakeNode) {
          intakeNodeIds.push(intakeNode.id);
          console.log('[DEBUG] Found intake node:', { intakeId, nodeId: intakeNode.id, label: intakeNode.label });
        } else {
          console.warn('[DEBUG] Intake node not found for sourceId:', intakeId);
        }
      });
      
      if (intakeNodeIds.length > 0 && updateNode) {
        const existingConnections = leadSourceNode.connections || [];
        // Dedupe: merge existing + new, remove duplicates
        const allConnections = [...new Set([...existingConnections, ...intakeNodeIds])];
        console.log('[DEBUG] Updating connections:', {
          nodeId: leadSourceNode.id,
          before: existingConnections,
          after: allConnections,
        });
        updateNode(leadSourceNode.id, { connections: allConnections });
        toast.success(`Connected ${leadSourceNode.label} → ${intakeNodeIds.length} intake method(s)`);
      }
      return;
    }
    
    // Legacy single-connection handler (keep for backwards compat)
    if (nodeType === 'source-to-intake-connection') {
      const leadSourceNode = currentSession.nodes.find(n => n.sourceId === data.leadSourceId);
      const intakeNode = currentSession.nodes.find(n => n.sourceId === data.intakeId);
      
      if (leadSourceNode && intakeNode && updateNode) {
        const existingConnections = leadSourceNode.connections || [];
        if (!existingConnections.includes(intakeNode.id)) {
          updateNode(leadSourceNode.id, {
            connections: [...existingConnections, intakeNode.id],
          });
        }
      }
      return;
    }
    
    // Handle intake-to-qualification connection batch
    // Connects ALL intake nodes to the qualification decision node
    if (nodeType === 'intake-to-qualification-batch') {
      // Find the qualification decision node (just created)
      const qualificationNode = currentSession.nodes.find(n => n.type === 'decision');
      if (!qualificationNode) {
        console.warn('[DEBUG] Qualification node not found');
        return;
      }
      
      // Find all intake nodes and connect them to qualification
      const intakeNodes = currentSession.nodes.filter(n => n.type === 'intake');
      if (intakeNodes.length === 0) {
        console.warn('[DEBUG] No intake nodes found to connect to qualification');
        return;
      }
      
      // Connect each intake node to the qualification node
      let connectionsUpdated = 0;
      intakeNodes.forEach(intakeNode => {
        const existingConnections = intakeNode.connections || [];
        if (!existingConnections.includes(qualificationNode.id)) {
          updateNode(intakeNode.id, {
            connections: [...existingConnections, qualificationNode.id],
          });
          connectionsUpdated++;
        }
      });
      
      if (connectionsUpdated > 0) {
        console.log('[DEBUG] intake-to-qualification-batch connected', connectionsUpdated, 'intake nodes');
        toast.success(`Connected ${connectionsUpdated} intake method(s) → Qualification`);
      }
      return;
    }
    
    // Handle qualification-to-paths connection batch
    // Connects the qualification node to all qualified/disqualified workflow nodes
    if (nodeType === 'qualification-to-paths-batch') {
      const pathType = data.pathType as 'qualified' | 'disqualified';
      const pathSourceIds = data.pathSourceIds as string[];
      
      // Find the qualification decision node
      const qualificationNode = currentSession.nodes.find(n => n.type === 'decision');
      if (!qualificationNode) {
        console.warn('[DEBUG] Qualification node not found for path connection');
        return;
      }
      
      // Find all workflow nodes with matching sourceIds
      const workflowNodeIds: string[] = [];
      pathSourceIds.forEach(sourceId => {
        const workflowNode = currentSession.nodes.find(n => 
          n.type === 'workflow' && n.sourceId === sourceId
        );
        if (workflowNode) {
          workflowNodeIds.push(workflowNode.id);
        }
      });
      
      if (workflowNodeIds.length > 0) {
        const existingConnections = qualificationNode.connections || [];
        const allConnections = [...new Set([...existingConnections, ...workflowNodeIds])];
        updateNode(qualificationNode.id, { connections: allConnections });
        console.log('[DEBUG] qualification-to-paths-batch connected', workflowNodeIds.length, pathType, 'paths');
        toast.success(`Connected Qualification → ${workflowNodeIds.length} ${pathType} path(s)`);
      }
      return;
    }
    
    // Create new node (id is generated by addNode)
    // For intake nodes, auto-connect to all existing lead sources
    let connectToNodeIds: string[] = [];
    if (data.autoConnectToLeadSources && currentSession) {
      const leadSourceNodes = currentSession.nodes.filter(n => n.type === 'lead-source');
      // Get all lead source node IDs to create connections TO them
      connectToNodeIds = leadSourceNodes.map(n => n.id);
    }
    
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
      // Store which lead sources this intake is connected to
      sourceConnections: connectToNodeIds.length > 0 ? connectToNodeIds : undefined,
      // Store qualification criteria (for decision nodes)
      criteria: data.criteria,
      criteriaLabels: data.criteriaLabels,
      // Store workflow path type (qualified/disqualified)
      pathType: data.pathType,
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

  // Redirect if no session found - moved after all hooks
  if (!sessionId) {
    navigate('/');
    return null;
  }

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

        {/* Center Canvas - Miro-like panning */}
        <main 
          ref={canvasRef}
          className={`flex-1 relative overflow-auto bg-background focus:outline-none ${isPanning ? 'cursor-grabbing' : ''}`}
          tabIndex={0}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
          onClick={(e) => {
            // Deselect when clicking on empty canvas (not while panning)
            if (!isConnectMode && !isPanning) {
              setSelectedNodeId(null);
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Zoomable Canvas Content */}
          <div 
            className="absolute inset-0 origin-top-left transition-transform duration-100"
            style={{
              transform: `scale(${zoomLevel})`,
              minWidth: `${Math.max(100 / zoomLevel, 150)}%`,
              minHeight: `${Math.max(100 / zoomLevel, 180)}%`,
            }}
          >
            {/* Canvas Grid Background - panning target */}
            <div 
              className="canvas-pan-area absolute inset-0"
              style={{
                minHeight: '1800px', // Taller canvas for deeper funnel stages
                minWidth: '2000px',  // Wider canvas for more horizontal spread
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border) / 0.25) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border) / 0.25) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px', // Larger grid cells
                cursor: isPanning ? 'grabbing' : 'grab',
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

            {/* Drag-to-connect preview line */}
            {dragConnectFromId && dragCursorPos && (
              <svg
                className="absolute inset-0 pointer-events-none z-40"
                style={{ minWidth: '100%', minHeight: '100%' }}
              >
                {(() => {
                  const fromNode = positionedNodes.find(n => n.id === dragConnectFromId);
                  if (!fromNode) return null;
                  
                  const startX = fromNode.position.x + 175; // Right edge of node
                  const startY = fromNode.position.y + 40;  // Center height
                  
                  return (
                    <line
                      x1={startX}
                      y1={startY}
                      x2={dragCursorPos.x}
                      y2={dragCursorPos.y}
                      stroke="hsl(var(--accent))"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      opacity="0.7"
                    />
                  );
                })()}
              </svg>
            )}

            {/* Render Nodes with Context Menu */}
            {positionedNodes.length > 0 && (
              <div className="absolute inset-0 min-h-[1800px] min-w-[2000px]">
                {positionedNodes.map((node) => (
                  <ContextMenu key={node.id}>
                    <ContextMenuTrigger asChild>
                      <div>
                        <CanvasNode
                          node={node}
                          isSelected={node.id === selectedNodeId || node.id === pendingFromNodeId}
                          isConnectionDragging={!!dragConnectFromId && dragConnectFromId !== node.id}
                          onClick={handleNodeClick}
                          onDoubleClick={handleNodeDoubleClick}
                          onDragEnd={handleNodeDragEnd}
                          onContextMenu={handleContextMenu}
                          onStartConnectionDrag={handleStartConnectionDrag}
                          onCompleteConnectionDrop={handleCompleteConnectionDrop}
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
          </div>

          {/* Connect Mode Indicator - Outside zoom container so it stays fixed */}
          {isConnectMode && pendingFromNode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-accent text-accent-foreground shadow-lg">
              <p className="text-sm font-medium">
                Connecting from: <strong>{pendingFromNode.label}</strong>
              </p>
              <p className="text-xs opacity-80">Click another node or click same node to cancel</p>
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

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoomLevel(z => Math.max(0.25, z - 0.1))}
                disabled={zoomLevel <= 0.25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}
                disabled={zoomLevel >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />
            
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
