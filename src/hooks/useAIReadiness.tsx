import { useMemo } from 'react';
import { SessionNode, AIReadinessScore, AIReadinessStatus } from '@/types/session';
import { QuestionAnswers } from '@/types/questions';

// ============================================
// AI READINESS ALGORITHM - Per PRD Spec
// 5 Layers: Efficiency, Maturity, Blockers, Status, Recommendations
// Now enhanced with question answer integration
// ============================================

export interface Blocker {
  name: string;
  severity: 'critical' | 'secondary';
  impact: string;
  fix: string;
  timeline: string;
}

export interface PositiveIndicator {
  name: string;
  message: string;
}

export interface PhaseRecommendation {
  phase: string;
  title: string;
  tasks: string[];
  cost: string;
  timeline: string;
}

export interface AIReadinessResult extends AIReadinessScore {
  blockers: Blocker[];
  positives: PositiveIndicator[];
  recommendations: PhaseRecommendation[];
  timelineToReadiness: string;
}

export interface UseAIReadinessOptions {
  avgDealValue?: number;
  questionAnswers?: QuestionAnswers; // NEW: Question answers for richer insights
}

/**
 * Layer 1: Calculate Efficiency Score (0-100)
 * - Conversion rate analysis (40%)
 * - Revenue leakage analysis (40%)
 * - Process consistency check (20%)
 */
function calculateEfficiencyScore(nodes: SessionNode[], avgDealValue: number): number {
  if (nodes.length === 0) return 0;

  // 1. Conversion Rate Analysis (40%)
  const nodesWithConversion = nodes.filter(n => n.conversionRate > 0);
  let conversionScore = 50; // Default if no conversion data
  
  if (nodesWithConversion.length > 0) {
    const avgConversion = nodesWithConversion.reduce((sum, n) => sum + n.conversionRate, 0) / nodesWithConversion.length;
    
    if (avgConversion >= 50) conversionScore = 90 + ((avgConversion - 50) / 50) * 10;
    else if (avgConversion >= 40) conversionScore = 70 + ((avgConversion - 40) / 10) * 20;
    else if (avgConversion >= 25) conversionScore = 40 + ((avgConversion - 25) / 15) * 30;
    else conversionScore = (avgConversion / 25) * 40;
  }

  // 2. Revenue Leakage Analysis (40%)
  const nodesWithVolume = nodes.filter(n => n.volume > 0);
  let leakageScore = 50; // Default
  
  if (nodesWithVolume.length >= 2) {
    // Calculate total potential vs actual
    const maxVolume = Math.max(...nodesWithVolume.map(n => n.volume));
    const minVolume = Math.min(...nodesWithVolume.map(n => n.volume));
    const leakagePercent = maxVolume > 0 ? ((maxVolume - minVolume) / maxVolume) * 100 : 0;
    
    if (leakagePercent < 25) leakageScore = 90 + ((25 - leakagePercent) / 25) * 10;
    else if (leakagePercent < 50) leakageScore = 70 + ((50 - leakagePercent) / 25) * 20;
    else if (leakagePercent < 80) leakageScore = 40 + ((80 - leakagePercent) / 30) * 30;
    else leakageScore = ((100 - leakagePercent) / 20) * 40;
  }

  // 3. Process Consistency Check (20%)
  let consistencyScore = 50; // Default
  
  if (nodesWithConversion.length >= 2) {
    const conversions = nodesWithConversion.map(n => n.conversionRate);
    const mean = conversions.reduce((a, b) => a + b, 0) / conversions.length;
    const variance = conversions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / conversions.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = mean > 0 ? stdDev / mean : 0;
    
    consistencyScore = Math.max(0, Math.min(100, 100 - (coeffOfVariation * 100)));
  }

  return (conversionScore * 0.4) + (leakageScore * 0.4) + (consistencyScore * 0.2);
}

/**
 * Layer 2: Calculate Process Maturity Score (0-100)
 * - Decision criteria clarity (35%)
 * - Handoff complexity (35%)
 * - Repeatability & documentation (30%)
 */
function calculateMaturityScore(nodes: SessionNode[]): number {
  if (nodes.length === 0) return 0;

  // 1. Decision Criteria Clarity (35%)
  const decisionNodes = nodes.filter(n => n.type === 'decision');
  let clarityScore = 50; // Default if no decision nodes
  
  if (decisionNodes.length > 0) {
    // Check if decision nodes have notes (criteria documented)
    const nodesWithNotes = decisionNodes.filter(n => n.notes && n.notes.length > 10);
    clarityScore = (nodesWithNotes.length / decisionNodes.length) * 100;
  } else {
    // No decision nodes mapped at all - lower score
    clarityScore = 20;
  }

  // 2. Handoff Complexity (35%)
  // Fewer unique owners = better handoff complexity
  const owners = nodes.map(n => n.owner).filter(Boolean);
  const uniqueOwners = new Set(owners).size;
  let handoffScore = 100;
  
  if (uniqueOwners > 6) handoffScore = 10;
  else if (uniqueOwners > 4) handoffScore = 30;
  else if (uniqueOwners > 2) handoffScore = 60;
  else handoffScore = 90;
  
  // Also consider connection complexity
  const avgConnections = nodes.reduce((sum, n) => sum + n.connections.length, 0) / nodes.length;
  if (avgConnections > 3) handoffScore *= 0.7; // Penalize complex branching

  // 3. Repeatability & Documentation (30%)
  // Based on how many nodes have complete data
  const completeNodes = nodes.filter(n => 
    n.volume > 0 || n.conversionRate > 0 || (n.notes && n.notes.length > 0)
  );
  const repeatabilityScore = (completeNodes.length / nodes.length) * 100;

  return (clarityScore * 0.35) + (handoffScore * 0.35) + (repeatabilityScore * 0.3);
}

/**
 * Layer 3: Detect Blockers and Positive Indicators
 * Enhanced with question answer analysis
 */
function detectBlockers(nodes: SessionNode[], questionAnswers?: QuestionAnswers): Blocker[] {
  const blockers: Blocker[] = [];

  // Check for undefined qualification criteria
  const decisionNodes = nodes.filter(n => n.type === 'decision');
  if (decisionNodes.length === 0) {
    blockers.push({
      name: "Qualification criteria undefined",
      severity: 'critical',
      impact: "Can't automate what isn't defined",
      fix: "Phase 0, Week 1 — Define Ideal Client Profile",
      timeline: "1 week"
    });
  } else if (decisionNodes.every(n => !n.notes || n.notes.length < 10)) {
    blockers.push({
      name: "Qualification criteria undocumented",
      severity: 'critical',
      impact: "Your decision criteria are vague or subjective",
      fix: "Phase 0, Week 1 — Codify decision criteria",
      timeline: "1 week"
    });
  }

  // NEW: Check response time from question answers (q8)
  if (questionAnswers?.['q8']?.value) {
    const responseTime = questionAnswers['q8'].value as string;
    if (responseTime === 'same-day' || responseTime === 'next-day') {
      blockers.push({
        name: "Slow lead response time",
        severity: 'critical',
        impact: "Leads responding after 30 minutes have 21x lower contact rate",
        fix: "Phase 0, Week 1 — Implement speed-to-lead automation",
        timeline: "1 week"
      });
    } else if (responseTime === '30min-1hr') {
      blockers.push({
        name: "Response time needs improvement",
        severity: 'secondary',
        impact: "Leads are cooling while waiting for response",
        fix: "Phase 1 — Add instant automated response + notification",
        timeline: "1-2 weeks"
      });
    }
  }

  // NEW: Check follow-up system from question answers (q9)
  if (questionAnswers?.['q9']?.value) {
    const followUp = questionAnswers['q9'].value as string[];
    if (Array.isArray(followUp) && followUp.includes('nothing')) {
      blockers.push({
        name: "No follow-up system",
        severity: 'critical',
        impact: "Leads who don't answer are permanently lost",
        fix: "Phase 0, Week 1 — Build automated follow-up sequence",
        timeline: "1 week"
      });
    }
  }

  // NEW: Check for bottleneck awareness from question answers (q3)
  if (questionAnswers?.['q3']?.value) {
    const bottlenecks = questionAnswers['q3'].value as string[];
    if (Array.isArray(bottlenecks)) {
      if (bottlenecks.includes('leads-dont-respond') || bottlenecks.includes('slow-response')) {
        // They're aware of the problem - good for prioritizing
        if (!blockers.some(b => b.name.includes('response'))) {
          blockers.push({
            name: "Lead responsiveness identified as bottleneck",
            severity: 'secondary',
            impact: "You've identified this as a problem area",
            fix: "Phase 1 — Implement multi-channel follow-up automation",
            timeline: "2 weeks"
          });
        }
      }
      if (bottlenecks.includes('no-follow-up')) {
        if (!blockers.some(b => b.name.includes('follow-up'))) {
          blockers.push({
            name: "Follow-up identified as bottleneck",
            severity: 'secondary',
            impact: "Missing follow-up is losing deals",
            fix: "Phase 1 — Build automated follow-up sequences",
            timeline: "2 weeks"
          });
        }
      }
    }
  }

  // Check for no follow-up system from nodes
  const intakeNodes = nodes.filter(n => n.type === 'intake');
  const conversionRate = intakeNodes.length > 0 
    ? intakeNodes.reduce((sum, n) => sum + n.conversionRate, 0) / intakeNodes.length
    : 0;
  
  if (intakeNodes.length > 0 && conversionRate < 30 && !blockers.some(b => b.name.includes('follow-up'))) {
    blockers.push({
      name: "Low lead follow-up rate",
      severity: 'critical',
      impact: "Losing leads due to poor response/follow-up",
      fix: "Phase 1, Weeks 1-2 — Build automated follow-up",
      timeline: "2 weeks"
    });
  }

  // Check for inconsistent process execution
  const nodesWithConversion = nodes.filter(n => n.conversionRate > 0);
  if (nodesWithConversion.length >= 2) {
    const conversions = nodesWithConversion.map(n => n.conversionRate);
    const mean = conversions.reduce((a, b) => a + b, 0) / conversions.length;
    const variance = conversions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / conversions.length;
    const coeffOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;
    
    if (coeffOfVariation > 0.5) {
      blockers.push({
        name: "Inconsistent process execution",
        severity: 'critical',
        impact: "Conversion rates vary wildly - can't train AI on inconsistent data",
        fix: "Phase 0, Week 2 — Document & train on consistent process",
        timeline: "1 week"
      });
    }
  }

  // NEW: Check close rate from question answers (q15)
  if (questionAnswers?.['q15']?.value) {
    const closeRate = Number(questionAnswers['q15'].value);
    if (!isNaN(closeRate) && closeRate < 25) {
      blockers.push({
        name: "Weak sales close rate",
        severity: 'secondary',
        impact: `Only ${closeRate}% of appointments convert to sales`,
        fix: "Phase 1 — Sales process optimization and training",
        timeline: "4 weeks"
      });
    }
  }

  // Secondary blockers
  const totalVolume = nodes.reduce((sum, n) => sum + n.volume, 0);
  const closeNodes = nodes.filter(n => n.type === 'close');
  const closeVolume = closeNodes.reduce((sum, n) => sum + n.volume, 0);
  
  if (totalVolume > 0 && closeVolume > 0) {
    const overallConversion = (closeVolume / nodes[0]?.volume || 1) * 100;
    if (overallConversion < 10 && !blockers.some(b => b.name.includes('conversion'))) {
      blockers.push({
        name: "Low overall conversion rate",
        severity: 'secondary',
        impact: `Only ${overallConversion.toFixed(1)}% of leads convert to close`,
        fix: "Phase 1 — Optimize messaging and follow-up",
        timeline: "4 weeks"
      });
    }
  }

  // Check handoff complexity
  const owners = nodes.map(n => n.owner).filter(Boolean);
  const uniqueOwners = new Set(owners).size;
  if (uniqueOwners > 5) {
    blockers.push({
      name: "High handoff complexity",
      severity: 'secondary',
      impact: `${uniqueOwners} different people/systems involved - fragile process`,
      fix: "Phase 1 — Consolidate handoffs, reduce complexity",
      timeline: "3 weeks"
    });
  }

  // NEW: Check if no reviews/referrals system (q17)
  if (questionAnswers?.['q17']?.value === false) {
    blockers.push({
      name: "No review/referral system",
      severity: 'secondary',
      impact: "Missing word-of-mouth growth opportunity",
      fix: "Phase 1 — Implement automated review/referral asks",
      timeline: "1 week"
    });
  }

  return blockers;
}

function detectPositives(nodes: SessionNode[], questionAnswers?: QuestionAnswers): PositiveIndicator[] {
  const positives: PositiveIndicator[] = [];

  // Clear close process
  const closeNodes = nodes.filter(n => n.type === 'close');
  if (closeNodes.length > 0 && closeNodes.some(n => n.conversionRate >= 50)) {
    positives.push({
      name: "Strong close process",
      message: "Your sales team has a great close rate. AI can learn from this pattern."
    });
  }

  // NEW: Fast response time from answers
  if (questionAnswers?.['q8']?.value) {
    const responseTime = questionAnswers['q8'].value as string;
    if (responseTime === 'under-1min' || responseTime === '1-5min') {
      positives.push({
        name: "Speed-to-lead champion",
        message: "Your fast response time is a major competitive advantage!"
      });
    }
  }

  // NEW: Automated follow-up from answers
  if (questionAnswers?.['q9']?.value) {
    const followUp = questionAnswers['q9'].value as string[];
    if (Array.isArray(followUp) && followUp.includes('automated-sequence')) {
      positives.push({
        name: "Automated follow-up in place",
        message: "You already have automated sequences - AI will enhance them."
      });
    }
  }

  // Defined lead sources
  const leadSourceNodes = nodes.filter(n => n.type === 'lead-source');
  if (leadSourceNodes.length >= 2 && leadSourceNodes.every(n => n.volume > 0)) {
    positives.push({
      name: "Well-tracked lead sources",
      message: "You have good visibility into where leads come from. AI can optimize spend."
    });
  }

  // Existing fulfillment
  const fulfillmentNodes = nodes.filter(n => n.type === 'fulfillment');
  if (fulfillmentNodes.length > 0) {
    positives.push({
      name: "Systematized fulfillment",
      message: "Your fulfillment process is mapped. AI follow-up automation will complement it."
    });
  }

  // Good intake coverage
  const intakeNodes = nodes.filter(n => n.type === 'intake');
  if (intakeNodes.length >= 3) {
    positives.push({
      name: "Multiple intake channels",
      message: "You cover multiple ways prospects can reach you. Good for automation."
    });
  }

  // NEW: High close rate from answers
  if (questionAnswers?.['q15']?.value) {
    const closeRate = Number(questionAnswers['q15'].value);
    if (!isNaN(closeRate) && closeRate >= 60) {
      positives.push({
        name: "Excellent close rate",
        message: `${closeRate}% close rate is outstanding. AI can help you get more at-bats.`
      });
    }
  }

  // NEW: Active review system
  if (questionAnswers?.['q17']?.value === true) {
    positives.push({
      name: "Review system in place",
      message: "Asking for reviews closes the loop and builds social proof."
    });
  }

  return positives;
}

/**
 * Layer 4 & 5: Calculate Overall Score, Status, and Generate Recommendations
 */
function calculateReadiness(
  efficiencyScore: number,
  maturityScore: number,
  blockers: Blocker[]
): { score: number; status: AIReadinessStatus } {
  // 40% efficiency, 60% maturity (maturity is more important)
  const overallScore = (efficiencyScore * 0.4) + (maturityScore * 0.6);
  
  // Critical blockers can cap the status
  const criticalBlockerCount = blockers.filter(b => b.severity === 'critical').length;
  
  let status: AIReadinessStatus;
  if (overallScore >= 75 && criticalBlockerCount === 0) {
    status = 'ready';
  } else if (overallScore >= 50 || criticalBlockerCount <= 1) {
    status = 'partial';
  } else {
    status = 'not-ready';
  }

  return { score: Math.round(overallScore), status };
}

function generateRecommendations(
  status: AIReadinessStatus,
  blockers: Blocker[]
): PhaseRecommendation[] {
  const recommendations: PhaseRecommendation[] = [];

  if (status === 'ready') {
    recommendations.push({
      phase: 'Phase 2',
      title: 'Implement AI Now',
      tasks: [
        'AI lead qualification chatbot',
        'Predictive lead scoring',
        'Automated proposal generation'
      ],
      cost: '$3,000-5,000/month',
      timeline: '4-6 weeks'
    });
  } else if (status === 'partial') {
    recommendations.push({
      phase: 'Phase 1',
      title: 'Automation Foundation',
      tasks: [
        'Automate lead follow-up (SMS/email)',
        'Build qualification automation',
        'Measure & improve conversion'
      ],
      cost: '$2,000-3,500',
      timeline: '2-4 weeks'
    });
    recommendations.push({
      phase: 'Phase 2',
      title: 'Add AI (After Phase 1)',
      tasks: [
        'AI chatbot for qualification',
        'Predictive lead scoring',
        'Automated proposals'
      ],
      cost: '+$1,500-3,000/month',
      timeline: '4-6 weeks after Phase 1'
    });
  } else {
    recommendations.push({
      phase: 'Phase 0',
      title: 'Build Foundation',
      tasks: [
        'Define qualification criteria',
        'Document decision rules',
        'Train team on process'
      ],
      cost: '$1,500-2,500',
      timeline: 'Weeks 1-2'
    });
    recommendations.push({
      phase: 'Phase 1',
      title: 'Automate Basics',
      tasks: [
        'Implement follow-up automation',
        'Build qualification process',
        'Measure improvements'
      ],
      cost: '$2,000-3,500',
      timeline: 'Weeks 3-6'
    });
    recommendations.push({
      phase: 'Phase 2',
      title: 'Add AI (Week 7+)',
      tasks: [
        'AI qualification chatbot',
        'Predictive scoring',
        'Auto-proposals'
      ],
      cost: '+$1,500-3,000/month',
      timeline: 'After foundation complete'
    });
  }

  return recommendations;
}

function getTimelineToReadiness(status: AIReadinessStatus): string {
  switch (status) {
    case 'ready': return '2-4 weeks';
    case 'partial': return '6-12 weeks';
    case 'not-ready': return '3-6 months';
  }
}

function generateReasoning(
  status: AIReadinessStatus,
  efficiencyScore: number,
  maturityScore: number,
  blockers: Blocker[]
): string {
  const criticalCount = blockers.filter(b => b.severity === 'critical').length;
  
  if (status === 'ready') {
    return `Your business processes are well-defined (maturity: ${Math.round(maturityScore)}/100) and executing effectively (efficiency: ${Math.round(efficiencyScore)}/100). You're ready to implement AI automation immediately.`;
  } else if (status === 'partial') {
    return `You're almost there! Your efficiency score is ${Math.round(efficiencyScore)}/100 and maturity is ${Math.round(maturityScore)}/100. Fix ${criticalCount} critical issue(s) first, then AI becomes a force multiplier.`;
  } else {
    return `Your processes need foundation work before AI. Efficiency: ${Math.round(efficiencyScore)}/100, Maturity: ${Math.round(maturityScore)}/100. ${criticalCount} critical blockers must be resolved. Implementing AI now would automate broken processes.`;
  }
}

/**
 * Main Hook: Calculate AI Readiness from Session Nodes and Question Answers
 */
export function useAIReadiness(
  nodes: SessionNode[],
  options: UseAIReadinessOptions = {}
): AIReadinessResult {
  const { avgDealValue = 5000, questionAnswers } = options;

  return useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return {
        efficiencyScore: 0,
        processMaturityScore: 0,
        readinessStatus: 'not-ready' as AIReadinessStatus,
        reasoning: 'Add nodes to the canvas to calculate AI readiness.',
        recommendedPhases: [],
        blockers: [],
        positives: [],
        recommendations: [],
        timelineToReadiness: 'N/A',
      };
    }

    // Layer 1: Efficiency Score
    const efficiencyScore = calculateEfficiencyScore(nodes, avgDealValue);

    // Layer 2: Maturity Score
    const maturityScore = calculateMaturityScore(nodes);

    // Layer 3: Blockers & Positives (now with question answers)
    const blockers = detectBlockers(nodes, questionAnswers);
    const positives = detectPositives(nodes, questionAnswers);

    // Layer 4: Overall Score & Status
    const { score, status } = calculateReadiness(efficiencyScore, maturityScore, blockers);

    // Layer 5: Recommendations
    const recommendations = generateRecommendations(status, blockers);
    const timelineToReadiness = getTimelineToReadiness(status);
    const reasoning = generateReasoning(status, efficiencyScore, maturityScore, blockers);

    // Map to recommended phases format
    const recommendedPhases = recommendations.map(r => ({
      phase: r.phase,
      aiUseCases: r.tasks,
    }));

    return {
      efficiencyScore: Math.round(efficiencyScore),
      processMaturityScore: Math.round(maturityScore),
      readinessStatus: status,
      reasoning,
      recommendedPhases,
      blockers,
      positives,
      recommendations,
      timelineToReadiness,
    };
  }, [nodes, avgDealValue, questionAnswers]);
}
