// ============================================
// AI Questions Hook - Dynamic question generation
// Uses LLM to generate contextual fulfillment questions
// Supports chain mode for "what happens next" flow
// ============================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionSection, QuestionAnswers, SelectOption } from '@/types/questions';
import { Industry, NodeType } from '@/types/session';
import { FULFILLMENT_CHAIN_OPTIONS } from '@/types/suggestionOptions';

export interface AIQuestionContext {
  industry?: Industry;
  currentStage: 'fulfillment' | 'review' | 'custom';
  previousAnswers: QuestionAnswers;
  existingNodes: Array<{ type: string; label: string }>;
  sessionId?: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multi-select' | 'number' | 'yes-no';
  options?: string[];
  hint?: string;
  followUpNodeType?: NodeType;
}

// Fallback questions when AI fails
const FALLBACK_FULFILLMENT_QUESTIONS: Question[] = [
  {
    id: 'ai_fulfill_fallback_1',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'What happens immediately after the sale closes?',
    type: 'multi-select',
    options: FULFILLMENT_CHAIN_OPTIONS.slice(0, 8),
    required: false,
    allowCustom: true,
    coachingHint: 'Understanding the first step post-sale helps map the handoff.',
  },
  {
    id: 'ai_fulfill_fallback_2',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'Who is responsible for delivering the service?',
    type: 'multi-select',
    options: [
      { value: 'technician', label: 'Technician', category: 'Field' },
      { value: 'therapist', label: 'Therapist/Provider', category: 'Service' },
      { value: 'project-manager', label: 'Project Manager', category: 'Management' },
      { value: 'sales-rep', label: 'Sales Rep (Handoff)', category: 'Sales' },
      { value: 'office-staff', label: 'Office Staff', category: 'Admin' },
      { value: 'owner', label: 'Owner/Founder', category: 'Leadership' },
    ],
    required: false,
    allowCustom: true,
    coachingHint: 'Identify the person or team responsible for fulfillment.',
  },
  {
    id: 'ai_fulfill_fallback_3',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'How do you communicate with the customer post-sale?',
    type: 'multi-select',
    options: [
      { value: 'email', label: 'Email updates', category: 'Digital' },
      { value: 'text', label: 'Text messages', category: 'Digital' },
      { value: 'phone', label: 'Phone calls', category: 'Voice' },
      { value: 'portal', label: 'Customer portal', category: 'Digital' },
      { value: 'none', label: 'No structured communication', category: 'None' },
    ],
    required: false,
    allowCustom: true,
    coachingHint: 'Post-sale communication is key to customer experience.',
  },
];

export function useAIQuestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Chain mode state
  const [fulfillmentChainDepth, setFulfillmentChainDepth] = useState(0);
  const [fulfillmentSteps, setFulfillmentSteps] = useState<string[]>([]);
  const [isFulfillmentComplete, setIsFulfillmentComplete] = useState(false);

  // Convert AI response to Question objects
  const convertToQuestions = useCallback((
    generated: GeneratedQuestion[]
  ): Question[] => {
    return generated.map(q => {
      const baseQuestion: Question = {
        id: q.id,
        section: 'fulfillment' as QuestionSection,
        sectionLabel: 'Fulfillment (AI)',
        question: q.question,
        type: q.type,
        required: false,
        coachingHint: q.hint,
        allowCustom: true,
      };

      // Add options for select/multi-select
      if (q.options && q.options.length > 0) {
        baseQuestion.options = q.options.map(opt => ({
          value: opt.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          label: opt,
        }));
      }

      // Add node creation if specified
      if (q.followUpNodeType) {
        const validTypes = ['lead-source', 'intake', 'decision', 'conversion', 'close', 'fulfillment', 'review', 'workflow', 'verification', 'handoff'] as const;
        type ValidNodeType = typeof validTypes[number];
        if (validTypes.includes(q.followUpNodeType as ValidNodeType)) {
          baseQuestion.nodeCreation = {
            type: q.followUpNodeType as ValidNodeType,
            createPerSelection: true,
          };
        }
      }

      return baseQuestion;
    });
  }, []);

  // Generate fulfillment questions using AI
  const generateFulfillmentQuestions = useCallback(async (
    context: AIQuestionContext
  ): Promise<Question[]> => {
    // Prevent double generation
    if (hasGenerated) {
      return generatedQuestions;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Extract relevant info from previous answers
      const leadSources = context.previousAnswers['q4']?.value;
      const intakeMethods = context.previousAnswers['q_intake_methods']?.value;
      const qualificationCriteria = context.previousAnswers['q11']?.value;
      const closeProcess = context.previousAnswers['q_conversion_type']?.value;
      const fulfillmentStart = context.previousAnswers['q16']?.value;

      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          industry: context.industry || 'general',
          currentStage: context.currentStage,
          previousAnswers: {
            leadSources: Array.isArray(leadSources) ? leadSources : [],
            intakeMethods: Array.isArray(intakeMethods) ? intakeMethods : [],
            qualificationCriteria: Array.isArray(qualificationCriteria) ? qualificationCriteria : [],
            closeProcess: Array.isArray(closeProcess) ? closeProcess.join(', ') : (typeof closeProcess === 'string' ? closeProcess : ''),
            fulfillmentStart: Array.isArray(fulfillmentStart) ? fulfillmentStart.join(', ') : (typeof fulfillmentStart === 'string' ? fulfillmentStart : ''),
          },
          existingNodes: context.existingNodes,
        },
      });

      if (fnError) {
        console.error('[AI Questions] Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to generate questions');
      }

      if (!data?.questions || data.questions.length === 0) {
        console.warn('[AI Questions] No questions returned, using fallback');
        setGeneratedQuestions(FALLBACK_FULFILLMENT_QUESTIONS);
        setHasGenerated(true);
        return FALLBACK_FULFILLMENT_QUESTIONS;
      }

      const questions = convertToQuestions(data.questions);
      setGeneratedQuestions(questions);
      setHasGenerated(true);
      
      console.log('[AI Questions] Generated', questions.length, 'questions');
      return questions;

    } catch (err) {
      console.error('[AI Questions] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      
      // Return fallback questions on error
      setGeneratedQuestions(FALLBACK_FULFILLMENT_QUESTIONS);
      setHasGenerated(true);
      return FALLBACK_FULFILLMENT_QUESTIONS;

    } finally {
      setIsGenerating(false);
    }
  }, [hasGenerated, generatedQuestions, convertToQuestions]);

  // Generate next "what happens next" question in chain mode
  const generateNextChainQuestion = useCallback(async (
    lastStep: string,
    industry?: Industry
  ): Promise<Question | null> => {
    // Check for "final step" selection
    if (lastStep.toLowerCase().includes('final step') || lastStep.toLowerCase().includes('this is the final')) {
      setIsFulfillmentComplete(true);
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-questions', {
        body: {
          industry: industry || 'general',
          currentStage: 'fulfillment',
          previousAnswers: {},
          existingNodes: fulfillmentSteps.map(s => ({ type: 'fulfillment', label: s })),
          chainMode: true,
          lastFulfillmentStep: lastStep,
          fulfillmentChainDepth,
        },
      });

      if (fnError) {
        console.error('[AI Questions] Chain mode error:', fnError);
        throw new Error(fnError.message || 'Failed to generate chain question');
      }

      if (!data?.questions || data.questions.length === 0) {
        console.warn('[AI Questions] No chain question returned');
        return null;
      }

      const question = convertToQuestions(data.questions)[0];
      
      // Update chain state
      setFulfillmentChainDepth(prev => prev + 1);
      setFulfillmentSteps(prev => [...prev, lastStep]);
      
      console.log('[AI Questions] Generated chain question:', question.question);
      return question;

    } catch (err) {
      console.error('[AI Questions] Chain error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate chain question');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [fulfillmentChainDepth, fulfillmentSteps, convertToQuestions]);

  // Mark fulfillment as complete manually
  const markFulfillmentComplete = useCallback(() => {
    setIsFulfillmentComplete(true);
    console.log('[AI Questions] Fulfillment marked complete by user');
  }, []);

  // Check if we should trigger AI generation
  // Returns true when user completes the initial fulfillment question (q16)
  const shouldGenerateAI = useCallback((
    currentQuestionId: string,
    answers: QuestionAnswers
  ): boolean => {
    // Trigger after the first fulfillment question is answered
    if (currentQuestionId === 'q16' && answers['q16']?.value) {
      return !hasGenerated;
    }
    return false;
  }, [hasGenerated]);

  // Reset for new session
  const reset = useCallback(() => {
    setGeneratedQuestions([]);
    setError(null);
    setHasGenerated(false);
    setIsGenerating(false);
    setFulfillmentChainDepth(0);
    setFulfillmentSteps([]);
    setIsFulfillmentComplete(false);
  }, []);

  return {
    // State
    isGenerating,
    generatedQuestions,
    error,
    hasGenerated,
    
    // Chain mode state
    fulfillmentChainDepth,
    fulfillmentSteps,
    isFulfillmentComplete,

    // Actions
    generateFulfillmentQuestions,
    generateNextChainQuestion,
    markFulfillmentComplete,
    shouldGenerateAI,
    reset,
  };
}
