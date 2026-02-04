// ============================================
// AI Questions Hook - Dynamic question generation
// Uses LLM to generate contextual fulfillment questions
// ============================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionSection, QuestionAnswers, SelectOption } from '@/types/questions';
import { Industry, NodeType } from '@/types/session';

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
    type: 'text',
    placeholder: 'e.g., We schedule the job, send a confirmation email...',
    required: false,
    coachingHint: 'Understanding the first step post-sale helps map the handoff.',
  },
  {
    id: 'ai_fulfill_fallback_2',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'Who is responsible for delivering the service?',
    type: 'text',
    placeholder: 'e.g., Technician, therapist, project manager...',
    required: false,
    coachingHint: 'Identify the person or team responsible for fulfillment.',
  },
  {
    id: 'ai_fulfill_fallback_3',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'How do you communicate with the customer post-sale?',
    type: 'multi-select',
    options: [
      { value: 'email', label: 'Email updates' },
      { value: 'text', label: 'Text messages' },
      { value: 'phone', label: 'Phone calls' },
      { value: 'portal', label: 'Customer portal' },
      { value: 'none', label: 'No structured communication' },
    ],
    required: false,
    allowCustom: true,
    coachingHint: 'Post-sale communication is key to customer experience.',
  },
  {
    id: 'ai_fulfill_fallback_4',
    section: 'fulfillment' as QuestionSection,
    sectionLabel: 'Fulfillment',
    question: 'Do you have a formal handoff process between sales and fulfillment?',
    type: 'yes-no',
    required: false,
    coachingHint: 'Handoffs are common leak points.',
  },
];

export function useAIQuestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

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
      };

      // Add options for select/multi-select
      if (q.options && q.options.length > 0) {
        baseQuestion.options = q.options.map(opt => ({
          value: opt.toLowerCase().replace(/\s+/g, '-'),
          label: opt,
        }));
        baseQuestion.allowCustom = true;
      }

      // Add node creation if specified
      if (q.followUpNodeType) {
        const validTypes = ['lead-source', 'intake', 'decision', 'conversion', 'close', 'fulfillment', 'review', 'workflow', 'verification', 'handoff'] as const;
        type ValidNodeType = typeof validTypes[number];
        if (validTypes.includes(q.followUpNodeType as ValidNodeType)) {
          baseQuestion.nodeCreation = {
            type: q.followUpNodeType as ValidNodeType,
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
            closeProcess: typeof closeProcess === 'string' ? closeProcess : '',
            fulfillmentStart: typeof fulfillmentStart === 'string' ? fulfillmentStart : '',
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
  }, []);

  return {
    // State
    isGenerating,
    generatedQuestions,
    error,
    hasGenerated,

    // Actions
    generateFulfillmentQuestions,
    shouldGenerateAI,
    reset,
  };
}
