// ============================================
// Canvas Viewport Hook - Center-based zoom/pan
// Provides stable zooming that keeps content aligned
// ============================================

import { useState, useCallback, useRef, useMemo } from 'react';
import { SessionNode } from '@/types/session';

export interface ViewportState {
  zoom: number;           // 0.25 to 2.0
  offset: { x: number; y: number };  // pan offset in screen space
}

interface UseCanvasViewportOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  zoomStep?: number;
}

const DEFAULT_OPTIONS: UseCanvasViewportOptions = {
  minZoom: 0.25,
  maxZoom: 2.0,
  initialZoom: 0.8,
  zoomStep: 0.1,
};

export function useCanvasViewport(options: UseCanvasViewportOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: opts.initialZoom!,
    offset: { x: 0, y: 0 },
  });

  // Pan state for drag handling
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  // Container ref for coordinate calculations
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Clamp zoom to valid range
  const clampZoom = useCallback((z: number) => {
    return Math.max(opts.minZoom!, Math.min(opts.maxZoom!, z));
  }, [opts.minZoom, opts.maxZoom]);

  // Zoom in
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: clampZoom(prev.zoom + opts.zoomStep!),
    }));
  }, [clampZoom, opts.zoomStep]);

  // Zoom out
  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: clampZoom(prev.zoom - opts.zoomStep!),
    }));
  }, [clampZoom, opts.zoomStep]);

  // Reset to default view
  const resetView = useCallback(() => {
    setViewport({
      zoom: opts.initialZoom!,
      offset: { x: 0, y: 0 },
    });
  }, [opts.initialZoom]);

  // Zoom to specific level
  const setZoom = useCallback((newZoom: number) => {
    setViewport(prev => ({
      ...prev,
      zoom: clampZoom(newZoom),
    }));
  }, [clampZoom]);

  // Zoom toward a specific point (for mouse wheel zoom)
  const zoomToPoint = useCallback((
    clientX: number,
    clientY: number,
    deltaZoom: number
  ) => {
    const container = containerRef.current;
    if (!container) {
      // Fallback: simple zoom without point
      setViewport(prev => ({
        ...prev,
        zoom: clampZoom(prev.zoom + deltaZoom),
      }));
      return;
    }

    const rect = container.getBoundingClientRect();
    
    // Get the point in container space where the cursor is
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    setViewport(prev => {
      const oldZoom = prev.zoom;
      const newZoom = clampZoom(prev.zoom + deltaZoom);
      
      if (newZoom === oldZoom) return prev;

      // Calculate the zoom ratio
      const zoomRatio = newZoom / oldZoom;

      // Adjust offset so the point under cursor stays in place
      // The point in canvas space: (cursorX - offset.x) / oldZoom
      // After zoom, we want it at the same cursor position
      const newOffsetX = cursorX - (cursorX - prev.offset.x) * zoomRatio;
      const newOffsetY = cursorY - (cursorY - prev.offset.y) * zoomRatio;

      return {
        zoom: newZoom,
        offset: { x: newOffsetX, y: newOffsetY },
      };
    });
  }, [clampZoom]);

  // Handle wheel event for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -opts.zoomStep! : opts.zoomStep!;
      zoomToPoint(e.clientX, e.clientY, delta);
    }
  }, [opts.zoomStep, zoomToPoint]);

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...viewport.offset };
  }, [viewport.offset]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;

    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    setViewport(prev => ({
      ...prev,
      offset: {
        x: offsetStartRef.current.x + dx,
        y: offsetStartRef.current.y + dy,
      },
    }));
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const container = containerRef.current;
    if (!container) {
      return { x: screenX / viewport.zoom, y: screenY / viewport.zoom };
    }

    const rect = container.getBoundingClientRect();
    const containerX = screenX - rect.left;
    const containerY = screenY - rect.top;

    return {
      x: (containerX - viewport.offset.x) / viewport.zoom,
      y: (containerY - viewport.offset.y) / viewport.zoom,
    };
  }, [viewport]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    const container = containerRef.current;
    if (!container) {
      return { x: canvasX * viewport.zoom, y: canvasY * viewport.zoom };
    }

    const rect = container.getBoundingClientRect();

    return {
      x: canvasX * viewport.zoom + viewport.offset.x + rect.left,
      y: canvasY * viewport.zoom + viewport.offset.y + rect.top,
    };
  }, [viewport]);

  // Fit all nodes in view
  const fitToContent = useCallback((nodes: SessionNode[], padding = 100) => {
    if (nodes.length === 0) {
      resetView();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const nodeWidth = 180;
    const nodeHeight = 80;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    // Calculate zoom to fit
    const zoomX = containerWidth / contentWidth;
    const zoomY = containerHeight / contentHeight;
    const newZoom = clampZoom(Math.min(zoomX, zoomY));

    // Center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const offsetX = containerWidth / 2 - centerX * newZoom;
    const offsetY = containerHeight / 2 - centerY * newZoom;

    setViewport({
      zoom: newZoom,
      offset: { x: offsetX, y: offsetY },
    });
  }, [clampZoom, resetView]);

  // CSS transform string for the canvas content
  const transform = useMemo(() => {
    return `translate(${viewport.offset.x}px, ${viewport.offset.y}px) scale(${viewport.zoom})`;
  }, [viewport]);

  // Is currently panning
  const isPanning = isPanningRef.current;

  return {
    // State
    zoom: viewport.zoom,
    offset: viewport.offset,
    isPanning,
    containerRef,
    
    // Actions
    zoomIn,
    zoomOut,
    setZoom,
    resetView,
    fitToContent,
    
    // Event handlers
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    zoomToPoint,
    
    // Coordinate conversion
    screenToCanvas,
    canvasToScreen,
    
    // CSS
    transform,
  };
}
