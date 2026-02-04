// ============================================
// Funnel Layout Calculator
// Positions nodes in a vertical funnel shape
// ============================================

import { NodeType, SessionNode } from '@/types/session';

export type FunnelLevelName = 
  | 'top-of-funnel' 
  | 'intake' 
  | 'qualification' 
  | 'conversion' 
  | 'close' 
  | 'fulfillment';

export interface FunnelLevel {
  level: number;
  name: FunnelLevelName;
  yOffset: number;
}

// Map node types to funnel levels
// Updated to support deeper funnels with better separation
export const NODE_LEVELS: Record<NodeType, number> = {
  'lead-source': 0,    // Top of funnel (widest)
  'intake': 1,         // Second row
  'decision': 2,       // Qualification level
  'verification': 2,   // Same level as qualification
  'workflow': 3,       // Qualified/Disqualified paths (post-qualification)
  'handoff': 3,        // Handoff steps (same level)
  'conversion': 4,     // Appointments/Calls
  'close': 5,          // Close level
  'fulfillment': 6,    // Bottom (narrowest)
  'review': 6,         // Bottom (with fulfillment)
  'custom': 4,         // Default to middle
};

// Increased vertical spacing to prevent bunching as maps grow
// Extended to 7 levels for deeper funnels
export const FUNNEL_LEVELS: FunnelLevel[] = [
  { level: 0, name: 'top-of-funnel', yOffset: 100 },
  { level: 1, name: 'intake', yOffset: 300 },
  { level: 2, name: 'qualification', yOffset: 500 },
  { level: 3, name: 'conversion', yOffset: 700 },   // Qualified/Disqualified paths
  { level: 4, name: 'conversion', yOffset: 900 },   // Conversion events
  { level: 5, name: 'close', yOffset: 1100 },
  { level: 6, name: 'fulfillment', yOffset: 1300 },
];

// Canvas dimensions - increased for better spacing
const CANVAS_CENTER_X = 700; // Will be dynamic based on canvas width
const MAX_FUNNEL_WIDTH = 1400;
const MIN_FUNNEL_WIDTH = 350;
const NODE_WIDTH = 180;
const NODE_GAP = 48; // Generous horizontal gap

/**
 * Calculate the width available at each funnel level
 * Level 0 is widest, Level 5 is narrowest
 */
export function calculateLevelWidth(level: number): number {
  const reductionPerLevel = (MAX_FUNNEL_WIDTH - MIN_FUNNEL_WIDTH) / 5;
  return MAX_FUNNEL_WIDTH - (level * reductionPerLevel);
}

/**
 * Position nodes at a specific funnel level
 * Spreads them evenly across the available width
 */
export function positionNodesAtLevel(
  nodes: SessionNode[],
  level: number,
  canvasCenterX: number = CANVAS_CENTER_X
): SessionNode[] {
  const levelWidth = calculateLevelWidth(level);
  const levelY = FUNNEL_LEVELS[level]?.yOffset || 80 + (level * 140);
  
  const nodeCount = nodes.length;
  if (nodeCount === 0) return [];
  
  // Calculate total width needed for all nodes
  const totalNodesWidth = (nodeCount * NODE_WIDTH) + ((nodeCount - 1) * NODE_GAP);
  
  // Starting X position (centered)
  const startX = canvasCenterX - (totalNodesWidth / 2);
  
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: startX + (index * (NODE_WIDTH + NODE_GAP)),
      y: levelY,
    },
  }));
}

/**
 * Calculate positions for all nodes based on their types
 * Groups nodes by level and positions them in a funnel shape
 * Respects manually positioned nodes (isManuallyPositioned = true)
 */
export function calculateFunnelPositions(
  nodes: SessionNode[],
  canvasCenterX: number = CANVAS_CENTER_X
): SessionNode[] {
  // Separate manually positioned nodes from auto-positioned ones
  const manualNodes = nodes.filter(n => n.isManuallyPositioned);
  const autoNodes = nodes.filter(n => !n.isManuallyPositioned);
  
  // Group auto-positioned nodes by their funnel level
  const nodesByLevel: Record<number, SessionNode[]> = {};
  
  autoNodes.forEach(node => {
    // Use custom funnelLevel if specified, otherwise use type-based level
    const level = node.funnelLevel ?? NODE_LEVELS[node.type] ?? 3;
    if (!nodesByLevel[level]) {
      nodesByLevel[level] = [];
    }
    nodesByLevel[level].push(node);
  });
  
  // Position only auto-positioned nodes at each level
  const positionedAutoNodes: SessionNode[] = [];
  
  Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
    const level = parseInt(levelStr);
    const positioned = positionNodesAtLevel(levelNodes, level, canvasCenterX);
    positionedAutoNodes.push(...positioned);
  });
  
  // Return both: auto-positioned nodes + manual nodes (preserving their positions)
  return [...positionedAutoNodes, ...manualNodes];
}

/**
 * Get the Y position for a specific funnel level
 */
export function getLevelYPosition(level: number): number {
  return FUNNEL_LEVELS[level]?.yOffset || 80 + (level * 140);
}

/**
 * Calculate connector path between two nodes
 * Uses bezier curves for smooth connections
 */
export function calculateConnectorPath(
  fromNode: SessionNode,
  toNode: SessionNode
): string {
  const fromX = fromNode.position.x + NODE_WIDTH / 2;
  const fromY = fromNode.position.y + 60; // Bottom of node
  const toX = toNode.position.x + NODE_WIDTH / 2;
  const toY = toNode.position.y; // Top of node
  
  // Calculate control points for bezier curve
  const midY = (fromY + toY) / 2;
  
  return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
}

/**
 * Get the level name for display
 */
export function getLevelName(level: number): string {
  const names: Record<number, string> = {
    0: 'Top of Funnel',
    1: 'Lead Intake',
    2: 'Qualification',
    3: 'Conversion',
    4: 'Close',
    5: 'Fulfillment & Reviews',
  };
  return names[level] || 'Custom';
}

/**
 * Calculate the center X position based on canvas width
 */
export function getCanvasCenterX(canvasWidth: number): number {
  return Math.max(canvasWidth / 2, CANVAS_CENTER_X);
}
