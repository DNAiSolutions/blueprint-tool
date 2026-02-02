import { useMemo } from 'react';
import { SessionNode, SessionMetrics } from '@/types/session';
import { NODE_LEVELS } from '@/utils/funnelLayout';

interface MetricsOutput extends SessionMetrics {
  nodeMetrics: Record<string, {
    dropoff: number;
    dropoffPercent: number;
    revenueLeak: number;
  }>;
}

interface UseMetricsCalculatorOptions {
  avgDealValue?: number; // Default: $5000
}

/**
 * Calculate real-time funnel metrics from nodes
 */
export function useMetricsCalculator(
  nodes: SessionNode[],
  options: UseMetricsCalculatorOptions = {}
): MetricsOutput {
  const { avgDealValue = 5000 } = options;

  return useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return {
        conversionByStage: {},
        dropoffByStage: {},
        revenueLeakByStage: {},
        totalRevenueAtRisk: 0,
        nodeMetrics: {},
      };
    }

    // Sort nodes by funnel level
    const sortedNodes = [...nodes].sort((a, b) => {
      const levelA = NODE_LEVELS[a.type] ?? 3;
      const levelB = NODE_LEVELS[b.type] ?? 3;
      return levelA - levelB;
    });

    // Group nodes by level
    const nodesByLevel: Record<number, SessionNode[]> = {};
    sortedNodes.forEach(node => {
      const level = NODE_LEVELS[node.type] ?? 3;
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(node);
    });

    // Calculate level totals
    const levelTotals: Record<number, number> = {};
    Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr);
      levelTotals[level] = levelNodes.reduce((sum, node) => sum + (node.volume || 0), 0);
    });

    const conversionByStage: Record<string, number> = {};
    const dropoffByStage: Record<string, number> = {};
    const revenueLeakByStage: Record<string, number> = {};
    const nodeMetrics: Record<string, { dropoff: number; dropoffPercent: number; revenueLeak: number }> = {};

    let totalRevenueAtRisk = 0;
    let biggestLeak: SessionMetrics['biggestLeak'] = undefined;
    let maxLeakImpact = 0;

    // Calculate metrics per level and per node
    const levels = Object.keys(levelTotals).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < levels.length; i++) {
      const currentLevel = levels[i];
      const previousLevel = i > 0 ? levels[i - 1] : null;
      
      const currentTotal = levelTotals[currentLevel];
      const previousTotal = previousLevel !== null ? levelTotals[previousLevel] : null;

      // Calculate conversion rate from previous level to this level
      if (previousTotal !== null && previousTotal > 0) {
        const conversionRate = (currentTotal / previousTotal) * 100;
        const dropoff = previousTotal - currentTotal;
        const dropoffPercent = (dropoff / previousTotal) * 100;
        const revenueLeak = dropoff * avgDealValue;

        // Store per-level metrics
        const levelKey = `level_${currentLevel}`;
        conversionByStage[levelKey] = conversionRate;
        dropoffByStage[levelKey] = dropoff;
        revenueLeakByStage[levelKey] = revenueLeak;

        totalRevenueAtRisk += revenueLeak;

        // Track biggest leak
        if (revenueLeak > maxLeakImpact) {
          maxLeakImpact = revenueLeak;
          const levelNodes = nodesByLevel[currentLevel];
          biggestLeak = {
            stageId: levelKey,
            stageName: levelNodes?.[0]?.label || `Level ${currentLevel}`,
            reason: dropoffPercent > 50 
              ? `${dropoffPercent.toFixed(0)}% drop-off - major leak`
              : `${dropoffPercent.toFixed(0)}% drop-off`,
            impact: revenueLeak,
          };
        }
      }

      // Calculate per-node metrics within this level
      const levelNodes = nodesByLevel[currentLevel];
      levelNodes.forEach(node => {
        const nodeVolume = node.volume || 0;
        
        // Use node's conversion rate if available, otherwise calculate from level
        let dropoff = 0;
        let dropoffPercent = 0;
        
        if (node.conversionRate > 0) {
          // Node has its own conversion rate
          const expectedOutput = nodeVolume * (node.conversionRate / 100);
          dropoff = nodeVolume - expectedOutput;
          dropoffPercent = 100 - node.conversionRate;
        } else if (previousTotal !== null && previousTotal > 0) {
          // Use level-based calculation
          dropoffPercent = ((previousTotal - currentTotal) / previousTotal) * 100;
          dropoff = nodeVolume * (dropoffPercent / 100);
        }

        const revenueLeak = dropoff * avgDealValue;

        nodeMetrics[node.id] = {
          dropoff: Math.round(dropoff),
          dropoffPercent: Math.round(dropoffPercent),
          revenueLeak: Math.round(revenueLeak),
        };

        // Store per-node conversion
        if (node.conversionRate > 0) {
          conversionByStage[node.id] = node.conversionRate;
          dropoffByStage[node.id] = Math.round(dropoff);
          revenueLeakByStage[node.id] = Math.round(revenueLeak);
        }
      });
    }

    return {
      conversionByStage,
      dropoffByStage,
      revenueLeakByStage,
      totalRevenueAtRisk: Math.round(totalRevenueAtRisk),
      biggestLeak,
      nodeMetrics,
    };
  }, [nodes, avgDealValue]);
}

/**
 * Determine if a node should be flagged as a leak
 */
export function isLeakNode(node: SessionNode, threshold: number = 25): boolean {
  return node.conversionRate > 0 && node.conversionRate < threshold;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}
