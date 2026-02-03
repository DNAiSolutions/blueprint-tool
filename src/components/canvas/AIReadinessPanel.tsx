import { useState } from 'react';
import { AIReadinessResult, Blocker, PositiveIndicator, PhaseRecommendation } from '@/hooks/useAIReadiness';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Zap,
  Target,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIReadinessPanelProps {
  readiness: AIReadinessResult;
}

export function AIReadinessPanel({ readiness }: AIReadinessPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBlockers, setShowBlockers] = useState(true);
  const [showPositives, setShowPositives] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Status colors and labels
  const statusConfig = {
    'ready': {
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: '🟢 Ready for AI',
      description: 'Implement AI automation now',
    },
    'partial': {
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      label: '🟡 Partial Readiness',
      description: 'Fix Phase 1 blockers first',
    },
    'not-ready': {
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: '🔴 Not AI-Ready',
      description: 'Foundational work needed',
    },
  };

  const status = statusConfig[readiness.readinessStatus];
  const overallScore = Math.round(
    (readiness.efficiencyScore * 0.4) + (readiness.processMaturityScore * 0.6)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with Collapse Toggle */}
      <div 
        className="p-4 border-b border-border border-t-2 border-t-accent cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="text-lg">🤖</span>
            AI Readiness
          </h2>
          <Button variant="ghost" size="icon-sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          <div className="space-y-5">
            
            {/* Overall Status Badge */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              status.bgColor,
              status.borderColor
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-lg font-bold", status.textColor)}>
                  {status.label}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {overallScore}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{status.description}</p>
              
              {/* Progress bar */}
              <div className="mt-3">
                <Progress 
                  value={overallScore} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {/* Efficiency Score */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Efficiency</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold">{readiness.efficiencyScore}</span>
                  <span className="text-xs text-muted-foreground mb-1">/100</span>
                </div>
                <Progress value={readiness.efficiencyScore} className="h-1.5 mt-2" />
              </div>

              {/* Maturity Score */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Maturity</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold">{readiness.processMaturityScore}</span>
                  <span className="text-xs text-muted-foreground mb-1">/100</span>
                </div>
                <Progress value={readiness.processMaturityScore} className="h-1.5 mt-2" />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Timeline to AI-ready:</span>
              <span className="text-sm font-semibold text-foreground ml-auto">
                {readiness.timelineToReadiness}
              </span>
            </div>

            {/* Reasoning */}
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  {readiness.reasoning}
                </p>
              </div>
            </div>

            {/* Blockers Section */}
            {readiness.blockers.length > 0 && (
              <div>
                <button
                  onClick={() => setShowBlockers(!showBlockers)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Blockers ({readiness.blockers.length})
                  </span>
                  {showBlockers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {showBlockers && (
                  <div className="space-y-2">
                    {readiness.blockers.map((blocker, i) => (
                      <BlockerCard key={i} blocker={blocker} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Positives Section */}
            {readiness.positives.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPositives(!showPositives)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Strengths ({readiness.positives.length})
                  </span>
                  {showPositives ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {showPositives && (
                  <div className="space-y-2">
                    {readiness.positives.map((positive, i) => (
                      <PositiveCard key={i} positive={positive} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Section */}
            {readiness.recommendations.length > 0 && (
              <div>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Attack Plan
                  </span>
                  {showRecommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {showRecommendations && (
                  <div className="space-y-3">
                    {readiness.recommendations.map((rec, i) => (
                      <RecommendationCard key={i} recommendation={rec} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

function BlockerCard({ blocker }: { blocker: Blocker }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      blocker.severity === 'critical' 
        ? "bg-red-500/5 border-red-500/30" 
        : "bg-amber-500/5 border-amber-500/30"
    )}>
      <div className="flex items-start gap-2">
        <Badge 
          variant={blocker.severity === 'critical' ? 'destructive' : 'secondary'}
          className="text-[10px] uppercase shrink-0"
        >
          {blocker.severity}
        </Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{blocker.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{blocker.impact}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-accent font-medium">{blocker.fix}</span>
            <span className="text-muted-foreground">• {blocker.timeline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositiveCard({ positive }: { positive: PositiveIndicator }) {
  return (
    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/30">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">{positive.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{positive.message}</p>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, index }: { recommendation: PhaseRecommendation; index: number }) {
  const phaseColors = [
    'border-l-blue-500',
    'border-l-purple-500',
    'border-l-accent',
  ];

  return (
    <div className={cn(
      "p-3 rounded-lg bg-muted/30 border border-border border-l-4",
      phaseColors[index % phaseColors.length]
    )}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs font-semibold">
          {recommendation.phase}
        </Badge>
        <span className="text-xs text-muted-foreground">{recommendation.timeline}</span>
      </div>
      <p className="text-sm font-medium text-foreground mb-2">{recommendation.title}</p>
      <ul className="space-y-1 mb-2">
        {recommendation.tasks.map((task, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="text-accent mt-0.5">→</span>
            {task}
          </li>
        ))}
      </ul>
      <div className="text-xs font-semibold text-accent">
        {recommendation.cost}
      </div>
    </div>
  );
}
