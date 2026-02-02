// ============================================
// ALIGN Session Types - Per PRD Data Model
// ============================================

export type Industry = 
  | 'roofing'
  | 'pest-control'
  | 'hvac'
  | 'plumbing'
  | 'landscaping'
  | 'cleaning'
  | 'other-service'
  | 'custom';

export type NodeType = 
  | 'lead-source'
  | 'intake'
  | 'decision'
  | 'conversion'
  | 'close'
  | 'fulfillment'
  | 'review'
  | 'custom';

export type AIReadinessStatus = 'ready' | 'partial' | 'not-ready';

export interface SessionNode {
  id: string;
  type: NodeType;
  label: string;
  volume: number;
  conversionRate: number;
  value: number;
  owner?: string;
  notes?: string;
  position: { x: number; y: number };
  connections: string[];
}

export interface SessionMetrics {
  conversionByStage: Record<string, number>;
  dropoffByStage: Record<string, number>;
  revenueLeakByStage: Record<string, number>;
  totalRevenueAtRisk: number;
  biggestLeak?: {
    stageId: string;
    stageName: string;
    reason: string;
    impact: number;
  };
}

export interface AIReadinessScore {
  efficiencyScore: number;
  processMaturityScore: number;
  readinessStatus: AIReadinessStatus;
  reasoning: string;
  recommendedPhases: Array<{
    phase: string;
    aiUseCases: string[];
  }>;
}

export interface AlignSession {
  id: string;
  clientName: string;
  industry?: Industry;
  repName: string;
  repId: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: SessionNode[];
  metrics: SessionMetrics;
  aiReadiness?: AIReadinessScore;
  status: 'draft' | 'in-progress' | 'completed' | 'exported';
}

export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: 'roofing', label: 'Roofing' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'other-service', label: 'Other Service Business' },
  { value: 'custom', label: 'Custom (I\'ll tell you)' },
];
