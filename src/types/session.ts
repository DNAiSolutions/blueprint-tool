// ============================================
// ALIGN Session Types - Per PRD Data Model
// ============================================

// Industry categories for broader service business support
export type IndustryCategory = 
  | 'home-services'
  | 'healthcare-wellness'
  | 'childcare-education'
  | 'professional-services'
  | 'transportation-logistics'
  | 'automotive'
  | 'personal-services'
  | 'custom';

// Backward compatible - includes old values + new categories
export type Industry = IndustryCategory | 'roofing' | 'pest-control' | 'hvac' | 'plumbing' | 'landscaping' | 'cleaning' | 'other-service';

export interface IndustryCategoryOption {
  value: IndustryCategory;
  label: string;
  icon: string;
  description: string;
  examples: string[];
}

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
  // Phase 3: Source-to-intake connections
  sourceConnections?: string[];  // IDs of lead sources this intake is connected to
  intakeConnections?: string[];  // IDs of intake methods this node connects to
  // Phase 5: Leak detection
  isLeak?: boolean;              // True if this is a major drop-off point
  leakReason?: string;           // Why this is flagged as a leak
  // Metadata
  sourceId?: string;             // Original source value (e.g., 'google-ads')
  spend?: number;                // Monthly spend (for paid sources)
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

export const INDUSTRY_CATEGORIES: IndustryCategoryOption[] = [
  {
    value: 'home-services',
    label: 'Home Services',
    icon: '🏠',
    description: 'Blue-collar trades & home repair',
    examples: ['Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Pest Control', 'Landscaping', 'Cleaning', 'Painting'],
  },
  {
    value: 'healthcare-wellness',
    label: 'Healthcare & Wellness',
    icon: '🩺',
    description: 'Medical, mental health, wellness',
    examples: ['Mental Health Practice', 'Therapy/Counseling', 'Chiropractic', 'Dental', 'Med Spa', 'Physical Therapy'],
  },
  {
    value: 'childcare-education',
    label: 'Childcare & Education',
    icon: '👶',
    description: 'Youth services & learning',
    examples: ['Daycare/Childcare', 'Tutoring', 'Private School', 'After-School Programs'],
  },
  {
    value: 'professional-services',
    label: 'Professional Services',
    icon: '💼',
    description: 'B2B consulting & expertise',
    examples: ['Business Consulting', 'Marketing Agency', 'Legal Services', 'Accounting', 'IT Services'],
  },
  {
    value: 'transportation-logistics',
    label: 'Transportation & Logistics',
    icon: '🚚',
    description: 'Moving, shipping, freight',
    examples: ['Freight/Trucking', 'Moving Company', 'Courier/Delivery', 'Auto Transport'],
  },
  {
    value: 'automotive',
    label: 'Automotive',
    icon: '🚗',
    description: 'Vehicle-related services',
    examples: ['Auto Repair', 'Detailing', 'Tire Shop', 'Body Shop', 'Towing'],
  },
  {
    value: 'personal-services',
    label: 'Personal Services',
    icon: '✂️',
    description: 'Consumer-facing lifestyle',
    examples: ['Salon/Barbershop', 'Photography', 'Event Planning', 'Pet Services', 'Fitness/Training'],
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: '⚙️',
    description: "I'll describe my industry",
    examples: ['AI will research and adapt to your specific business'],
  },
];

// Legacy support - flat list for backward compatibility
export const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = INDUSTRY_CATEGORIES.map(cat => ({
  value: cat.value,
  label: cat.label,
}));
