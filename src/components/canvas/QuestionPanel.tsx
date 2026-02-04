import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Question, 
  QuestionSection, 
  SECTION_META,
  LEAD_SOURCE_OPTIONS,
  INTAKE_METHOD_OPTIONS,
  FOLLOW_UP_OPTIONS,
  generateLeadSourceFollowUps,
  generateIntakeMappingQuestions,
  getIndustryOptions,
} from '@/types/questions';
import { Industry } from '@/types/session';
import { useQuestionFlow } from '@/hooks/useQuestionFlow';
import { MultiSelectCheckbox } from '@/components/ui/multi-select-checkbox';
import { ChevronDown, ChevronUp, Check, ArrowRight, SkipForward, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionPanelProps {
  sessionId?: string;
  industry?: Industry;
  onNodeCreate?: (nodeType: string, data: Record<string, any>) => void;
}

export function QuestionPanel({ sessionId, industry, onNodeCreate }: QuestionPanelProps) {
  const {
    currentQuestion,
    currentSection,
    sectionProgress,
    progressPercent,
    isComplete,
    answeredQuestions,
    upcomingQuestions,
    answerQuestion,
    skipQuestion,
    injectDynamicQuestions,
    selectedLeadSources,
    selectedIntakeMethods,
  } = useQuestionFlow(sessionId, industry);

  const [inputValue, setInputValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [showAllAnswered, setShowAllAnswered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get industry-specific options
  const industryOptions = useMemo(() => getIndustryOptions(industry), [industry]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentQuestion) return;

    // Handle multi-select separately
    if (currentQuestion.type === 'multi-select') {
      if (currentQuestion.required && multiSelectValue.length === 0) {
        setError('Please select at least one option');
        return;
      }

      // Submit the multi-select answer
      answerQuestion(multiSelectValue);

      // If this question triggers dynamic follow-ups for lead sources (q4)
      if (currentQuestion.dynamicFollowUp && currentQuestion.id === 'q4') {
        const followUpQuestions = generateLeadSourceFollowUps(multiSelectValue, industry);
        injectDynamicQuestions(followUpQuestions);
      }

      // If this is intake methods (q_intake_methods), generate mapping questions
      if (currentQuestion.dynamicFollowUp && currentQuestion.id === 'q_intake_methods') {
        // Generate mapping questions: "Which intake methods apply to {source}?"
        if (selectedLeadSources && selectedLeadSources.length > 0) {
          const mappingQuestions = generateIntakeMappingQuestions(selectedLeadSources, multiSelectValue, industry);
          injectDynamicQuestions(mappingQuestions);
        }
      }

      // Handle intake-to-source mapping questions (q_intake_map_*)
      // BATCHED: Pass all intake IDs at once to avoid race conditions
      const intakeMappingMatch = currentQuestion.id.match(/^q_intake_map_(.+)$/);
      if (intakeMappingMatch && onNodeCreate) {
        const leadSourceId = intakeMappingMatch[1];
        // Batch all intake IDs into a single call to prevent lost connections
        onNodeCreate('source-to-intake-connection-batch', {
          leadSourceId: leadSourceId,
          intakeIds: multiSelectValue, // array of all selected intakes
        });
      }

      // Create nodes for each selection if applicable
      if (currentQuestion.nodeCreation?.createPerSelection && onNodeCreate) {
        // Determine if these are workflow nodes that should connect FROM qualification
        const isQualifiedPath = currentQuestion.id === 'q_qualified_path';
        const isDisqualifiedPath = currentQuestion.id === 'q_disqualified_path';
        
        // Collect all created node IDs for batch connection
        const createdNodeIds: string[] = [];
        
        multiSelectValue.forEach((value) => {
          const option = currentQuestion.options?.find(o => o.value === value);
          const label = option?.label || value.replace(/-/g, ' ');
          const nodeId = `${currentQuestion.nodeCreation!.type}-${value}-${Date.now()}`;
          
          // Add metadata for qualified/disqualified paths
          const nodeData: Record<string, any> = {
            sourceId: value,
            label: label,
            questionId: currentQuestion.id,
            autoConnectToLeadSources: false,
          };
          
          // Mark qualified vs disqualified paths for visual distinction
          if (isQualifiedPath) {
            nodeData.pathType = 'qualified';
          } else if (isDisqualifiedPath) {
            nodeData.pathType = 'disqualified';
          }
          
          onNodeCreate(currentQuestion.nodeCreation!.type, nodeData);
          createdNodeIds.push(value); // Track source IDs for connection
        });
        
        // After creating qualified path nodes, connect FROM the qualification decision node
        if (isQualifiedPath && createdNodeIds.length > 0) {
          onNodeCreate('qualification-to-paths-batch', {
            pathType: 'qualified',
            pathSourceIds: createdNodeIds,
          });
        }
        
        // Same for disqualified paths
        if (isDisqualifiedPath && createdNodeIds.length > 0) {
          onNodeCreate('qualification-to-paths-batch', {
            pathType: 'disqualified',
            pathSourceIds: createdNodeIds,
          });
        }
      }

      // Handle single node with all selections (e.g., qualification criteria)
      // This runs when createPerSelection is FALSE - creates ONE node with all criteria
      if (currentQuestion.nodeCreation && !currentQuestion.nodeCreation.createPerSelection && onNodeCreate) {
        const labels = multiSelectValue.map(value => {
          const option = currentQuestion.options?.find(o => o.value === value);
          return option?.label || value;
        });
        
        onNodeCreate(currentQuestion.nodeCreation.type, {
          label: `Qualification (${multiSelectValue.length} criteria)`,
          criteria: multiSelectValue,
          criteriaLabels: labels,
          questionId: currentQuestion.id,
        });
        
        // Auto-connect all intake nodes TO this qualification node
        onNodeCreate('intake-to-qualification-batch', {
          criteriaCount: multiSelectValue.length,
        });
      }

      // Check for leak detection - if "nothing" is selected in follow-up
      if (currentQuestion.id === 'q9' && multiSelectValue.includes('nothing')) {
        // Flag this as a leak point
        onNodeCreate?.('leak-alert', {
          label: 'No Follow-Up (LEAK)',
          isLeak: true,
          leakReason: 'Leads who don\'t answer are not followed up',
        });
      }

      setMultiSelectValue([]);
      setError(null);
      return;
    }

    // Validate regular inputs
    const validation = validateInput(currentQuestion, inputValue);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    // Parse value based on type
    let parsedValue: string | number | boolean = inputValue;
    if (currentQuestion.type === 'number' || currentQuestion.type === 'currency' || currentQuestion.type === 'percentage') {
      parsedValue = parseFloat(inputValue);
    }

    // Submit answer
    answerQuestion(parsedValue);

    // Trigger node creation if applicable
    if (currentQuestion.nodeCreation && onNodeCreate) {
      // Check if this is a dynamic volume question for a specific source
      const volumeMatch = currentQuestion.id.match(/^q_volume_(.+)$/);
      const spendMatch = currentQuestion.id.match(/^q_spend_(.+)$/);
      
      if (volumeMatch) {
        const sourceId = volumeMatch[1];
        // Update the existing node with volume only - don't override label
        onNodeCreate('lead-source-update', {
          sourceId: sourceId,
          volume: parsedValue,
        });
      } else if (spendMatch) {
        const sourceId = spendMatch[1];
        // Update the existing node with spend only - don't override label
        onNodeCreate('lead-source-update', {
          sourceId: sourceId,
          spend: parsedValue,
        });
      } else {
        onNodeCreate(currentQuestion.nodeCreation.type, {
          [currentQuestion.nodeCreation.field || 'value']: parsedValue,
          questionId: currentQuestion.id,
        });
      }
    }

    // Reset
    setInputValue('');
    setError(null);
  }, [currentQuestion, inputValue, multiSelectValue, answerQuestion, onNodeCreate, injectDynamicQuestions]);

  // Handle yes/no
  const handleYesNo = useCallback((value: boolean) => {
    if (!currentQuestion) return;
    answerQuestion(value);

    if (currentQuestion.nodeCreation && onNodeCreate) {
      onNodeCreate(currentQuestion.nodeCreation.type, {
        value,
        questionId: currentQuestion.id,
      });
    }

    setInputValue('');
    setError(null);
  }, [currentQuestion, answerQuestion, onNodeCreate]);

  // Handle select
  const handleSelect = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  // Validate input
  const validateInput = (question: Question, value: string): { valid: boolean; error?: string } => {
    if (question.required && !value.trim()) {
      return { valid: false, error: 'This field is required' };
    }

    if (question.type === 'text' && value.trim()) {
      if (value.length < 3) return { valid: false, error: 'Please provide more detail (min 3 characters)' };
      if (value.length > 500) return { valid: false, error: 'Response too long (max 500 characters)' };
    }

    if (question.type === 'number' || question.type === 'currency' || question.type === 'percentage') {
      const num = parseFloat(value);
      if (isNaN(num)) return { valid: false, error: 'Please enter a valid number' };
      if (question.minValue !== undefined && num < question.minValue) {
        return { valid: false, error: `Value must be at least ${question.minValue}` };
      }
      if (question.maxValue !== undefined && num > question.maxValue) {
        return { valid: false, error: `Value must be at most ${question.maxValue}` };
      }
    }

    return { valid: true };
  };

  // Format answer for display
  const formatAnswer = (question: Question, value: any): string => {
    if (question.type === 'yes-no') return value ? 'Yes' : 'No';
    if (question.type === 'currency') return `$${Number(value).toLocaleString()}`;
    if (question.type === 'percentage') return `${value}%`;
    if (question.type === 'multi-select') {
      if (Array.isArray(value)) {
        if (value.length <= 2) {
          return value.map(v => {
            const option = question.options?.find(o => o.value === v);
            return option?.label || v;
          }).join(', ');
        }
        return `${value.length} selected`;
      }
      return String(value);
    }
    if (question.type === 'select') {
      const option = question.options?.find(o => o.value === value);
      return option?.label || value;
    }
    return String(value);
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="text-lg">✅</span>
            Complete!
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You've mapped the entire process!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ready to see the insights and revenue leakage analysis?
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="default" className="gap-2">
                View Metrics
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sections for sidebar
  const sections = Object.entries(sectionProgress) as [QuestionSection, typeof sectionProgress[QuestionSection]][];
  const visibleAnswered = showAllAnswered ? answeredQuestions : answeredQuestions.slice(-3);

  return (
    <div className="flex flex-col h-full">
      {/* Header with progress */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <span className="text-lg">📋</span>
          Questions
        </h2>
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progressPercent}% complete</p>
      </div>
      
      {/* Questions Flow */}
      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        <div className="space-y-3">
          {/* Previous Answers (collapsed) */}
          {answeredQuestions.length > 0 && (
            <div className="space-y-2">
              {visibleAnswered.map(({ question, answer }) => (
                <div 
                  key={question.id}
                  className="p-3 rounded-lg bg-success/10 border border-success/20"
                >
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{question.question}</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatAnswer(question, answer.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {answeredQuestions.length > 3 && (
                <button
                  onClick={() => setShowAllAnswered(!showAllAnswered)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1"
                >
                  {showAllAnswered ? (
                    <>Show less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Show {answeredQuestions.length - 3} more <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Current Question */}
          {currentQuestion && currentSection && (
            <div className="p-4 rounded-lg bg-accent/10 border-l-2 border-accent animate-fade-in">
              {/* Section badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>{SECTION_META[currentQuestion.section].icon}</span>
                <span>{currentSection.label}</span>
              </div>
              
              {/* Question */}
              <p className="text-sm font-medium text-foreground mb-4">
                {currentQuestion.question}
                {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
              </p>

              {/* Multi-select input */}
              {currentQuestion.type === 'multi-select' && currentQuestion.options && (
                <MultiSelectCheckbox
                  options={currentQuestion.options}
                  value={multiSelectValue}
                  onChange={setMultiSelectValue}
                  allowCustom={currentQuestion.allowCustom}
                  maxHeight={280}
                />
              )}

              {/* Text input */}
              {currentQuestion.type === 'text' && (
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  placeholder={currentQuestion.placeholder}
                  className={cn(error && 'border-destructive')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              )}

              {/* Number/Currency/Percentage inputs */}
              {(currentQuestion.type === 'number' || currentQuestion.type === 'currency' || currentQuestion.type === 'percentage') && (
                <div className="relative">
                  {currentQuestion.type === 'currency' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  )}
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setError(null);
                    }}
                    placeholder={currentQuestion.placeholder}
                    className={cn(
                      currentQuestion.type === 'currency' && 'pl-7',
                      currentQuestion.type === 'percentage' && 'pr-7',
                      error && 'border-destructive'
                    )}
                    min={currentQuestion.minValue}
                    max={currentQuestion.maxValue}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  {currentQuestion.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  )}
                </div>
              )}

              {/* Select input */}
              {currentQuestion.type === 'select' && currentQuestion.options && (
                <Select value={inputValue} onValueChange={handleSelect}>
                  <SelectTrigger className={cn(error && 'border-destructive')}>
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          {option.category && (
                            <span className="text-xs text-muted-foreground">
                              ({option.category})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Yes/No buttons */}
              {currentQuestion.type === 'yes-no' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleYesNo(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleYesNo(false)}
                  >
                    No
                  </Button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}

              {/* Coaching hint */}
              {currentQuestion.coachingHint && (
                <p className="text-xs text-accent/80 mt-3 italic">
                  💡 {currentQuestion.coachingHint}
                </p>
              )}

              {/* Action buttons */}
              {currentQuestion.type !== 'yes-no' && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={handleSubmit}
                    disabled={
                      currentQuestion.type === 'multi-select' 
                        ? (currentQuestion.required && multiSelectValue.length === 0)
                        : (currentQuestion.required && !inputValue.trim())
                    }
                  >
                    Answer & Continue
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  {!currentQuestion.required && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={skipQuestion}
                      className="gap-1"
                    >
                      <SkipForward className="h-3 w-3" />
                      Skip
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Questions Preview */}
          {upcomingQuestions.length > 0 && (
            <div className="space-y-2 pt-2">
              {upcomingQuestions.map((question, idx) => (
                <div 
                  key={question.id}
                  className="p-3 rounded-lg bg-muted/50 opacity-60"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span className="text-xs">{idx === 0 ? '▶' : '•'}</span>
                    <span className="truncate">{question.question}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Add Node Button */}
      <div className="p-4 border-t border-border bg-card">
        <Button 
          variant="default" 
          className="w-full gap-2"
          onClick={() => onNodeCreate?.('add-node-modal', {})}
        >
          <span className="text-lg">+</span>
          Add Node
        </Button>
      </div>

      {/* Section progress at bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-1">
          {sections.map(([section, progress]) => (
            <div
              key={section}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                progress.status === 'completed' && 'bg-success/20 text-success',
                progress.status === 'active' && 'bg-accent/20 text-accent',
                progress.status === 'waiting' && 'bg-muted text-muted-foreground'
              )}
            >
              {SECTION_META[section].icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
