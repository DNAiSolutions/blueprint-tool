import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Question,
  QuestionSection,
  QuestionAnswers,
  QuestionFlowState,
  QUESTIONS,
  SECTION_META,
  getSections,
  getIndustryOptions,
} from '@/types/questions';
import { Industry } from '@/types/session';

const INITIAL_STATE: QuestionFlowState = {
  currentQuestionIndex: 0,
  answers: {},
  completedSections: [],
  isComplete: false,
  dynamicQuestions: [],
  selectedLeadSources: [],
  selectedIntakeMethods: [],
};

export function useQuestionFlow(sessionId?: string, industry?: Industry) {
  const [state, setState] = useState<QuestionFlowState>(() => {
    // Try to load from localStorage
    if (sessionId) {
      const saved = localStorage.getItem(`align-questions-${sessionId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return INITIAL_STATE;
  });

  // Get industry-specific options
  const industryOptions = useMemo(() => getIndustryOptions(industry), [industry]);

  // Combine static questions with dynamic ones and resolve industry-specific options
  const allQuestions = useMemo(() => {
    // First, resolve industry-specific options for static questions
    const resolvedQuestions = QUESTIONS.map(q => {
      if (q.optionKey && industryOptions[q.optionKey]) {
        return { ...q, options: industryOptions[q.optionKey] };
      }
      // Also resolve specific question IDs that need industry options
      if (q.id === 'q4') {
        return { ...q, options: industryOptions.leadSources };
      }
      if (q.id === 'q_intake_methods') {
        return { ...q, options: industryOptions.intakeMethods };
      }
      if (q.id === 'q11') {
        return { ...q, options: industryOptions.qualificationCriteria };
      }
      return q;
    });

    const dynamicQuestions = state.dynamicQuestions || [];
    
    if (dynamicQuestions.length === 0) return resolvedQuestions;
    
    // Separate dynamic questions by section
    const leadHandlingDynamic = dynamicQuestions.filter(dq => dq.section === 'lead-handling');
    const metricsDynamic = dynamicQuestions.filter(dq => dq.section === 'metrics');
    
    let result = [...resolvedQuestions];
    
    // Find insertion point for intake mapping questions (after q_intake_methods)
    const intakeIndex = result.findIndex(q => q.id === 'q_intake_methods');
    if (intakeIndex !== -1 && leadHandlingDynamic.length > 0) {
      result = [
        ...result.slice(0, intakeIndex + 1),
        ...leadHandlingDynamic,
        ...result.slice(intakeIndex + 1),
      ];
    }
    
    // Insert volume/spend questions at the START of metrics section
    // Find the first metrics question
    const firstMetricsIndex = result.findIndex(q => q.section === 'metrics');
    if (firstMetricsIndex !== -1 && metricsDynamic.length > 0) {
      result = [
        ...result.slice(0, firstMetricsIndex),
        ...metricsDynamic,
        ...result.slice(firstMetricsIndex),
      ];
    } else if (metricsDynamic.length > 0) {
      // If no metrics section yet, append at end
      result = [...result, ...metricsDynamic];
    }
    
    return result;
  }, [state.dynamicQuestions, industryOptions]);

  // Get questions that should be shown (respecting skip conditions)
  const activeQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (!q.skipCondition) return true;
      return !q.skipCondition(state.answers);
    });
  }, [allQuestions, state.answers]);

  // Current question
  const currentQuestion = useMemo(() => {
    return activeQuestions[state.currentQuestionIndex] || null;
  }, [activeQuestions, state.currentQuestionIndex]);

  // Current section info
  const currentSection = useMemo(() => {
    if (!currentQuestion) return null;
    return {
      id: currentQuestion.section,
      ...SECTION_META[currentQuestion.section],
    };
  }, [currentQuestion]);

  // Section progress
  const sectionProgress = useMemo(() => {
    const sections = getSections();
    const progress: Record<QuestionSection, { total: number; answered: number; status: 'waiting' | 'active' | 'completed' }> = {} as any;
    
    for (const section of sections) {
      const sectionQuestions = activeQuestions.filter(q => q.section === section);
      const answeredCount = sectionQuestions.filter(q => state.answers[q.id]).length;
      
      let status: 'waiting' | 'active' | 'completed' = 'waiting';
      if (currentQuestion?.section === section) {
        status = 'active';
      } else if (answeredCount === sectionQuestions.length && sectionQuestions.length > 0) {
        status = 'completed';
      } else if (answeredCount > 0) {
        status = 'active';
      }
      
      progress[section] = {
        total: sectionQuestions.length,
        answered: answeredCount,
        status,
      };
    }
    
    return progress;
  }, [activeQuestions, state.answers, currentQuestion]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    const answered = Object.keys(state.answers).length;
    return Math.round((answered / activeQuestions.length) * 100);
  }, [state.answers, activeQuestions]);

  // Inject dynamic questions (called after multi-select answers)
  // De-duplicates by id to prevent double-injection
  const injectDynamicQuestions = useCallback((questions: Question[]) => {
    setState(prev => {
      const existingIds = new Set((prev.dynamicQuestions || []).map(q => q.id));
      const newQuestions = questions.filter(q => !existingIds.has(q.id));
      if (newQuestions.length === 0) return prev;
      return {
        ...prev,
        dynamicQuestions: [...(prev.dynamicQuestions || []), ...newQuestions],
      };
    });
  }, []);

  // Answer current question
  const answerQuestion = useCallback((value: string | number | boolean | string[]) => {
    if (!currentQuestion) return;

    setState(prev => {
      const newAnswers: QuestionAnswers = {
        ...prev.answers,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          value,
          answeredAt: new Date(),
        },
      };

      // Track selected lead sources for later use
      let selectedLeadSources = prev.selectedLeadSources || [];
      let selectedIntakeMethods = prev.selectedIntakeMethods || [];
      
      if (currentQuestion.id === 'q4' && Array.isArray(value)) {
        selectedLeadSources = value;
      }
      if (currentQuestion.id === 'q_intake_methods' && Array.isArray(value)) {
        selectedIntakeMethods = value;
      }

      // Find next question index
      let nextIndex = prev.currentQuestionIndex + 1;
      
      // Rebuild the full question list matching allQuestions logic
      // This ensures dynamic questions (lead-handling, metrics) are in the right places
      const dynamicQuestions = prev.dynamicQuestions || [];
      const leadHandlingDynamic = dynamicQuestions.filter(dq => dq.section === 'lead-handling');
      const metricsDynamic = dynamicQuestions.filter(dq => dq.section === 'metrics');
      
      // Start with static questions
      let questionsToCheck = [...QUESTIONS];
      
      // Insert lead-handling dynamic questions after q_intake_methods
      const intakeIndex = questionsToCheck.findIndex(q => q.id === 'q_intake_methods');
      if (intakeIndex !== -1 && leadHandlingDynamic.length > 0) {
        questionsToCheck = [
          ...questionsToCheck.slice(0, intakeIndex + 1),
          ...leadHandlingDynamic,
          ...questionsToCheck.slice(intakeIndex + 1),
        ];
      }
      
      // Insert metrics dynamic questions at the start of metrics section
      const firstMetricsIndex = questionsToCheck.findIndex(q => q.section === 'metrics');
      if (firstMetricsIndex !== -1 && metricsDynamic.length > 0) {
        questionsToCheck = [
          ...questionsToCheck.slice(0, firstMetricsIndex),
          ...metricsDynamic,
          ...questionsToCheck.slice(firstMetricsIndex),
        ];
      } else if (metricsDynamic.length > 0) {
        questionsToCheck = [...questionsToCheck, ...metricsDynamic];
      }
      
      // Filter by skip conditions with new answers
      const updatedActiveQuestions = questionsToCheck.filter(q => {
        if (!q.skipCondition) return true;
        return !q.skipCondition(newAnswers);
      });
      
      // Skip questions that should be skipped based on new answers
      while (nextIndex < updatedActiveQuestions.length) {
        const nextQ = updatedActiveQuestions[nextIndex];
        if (nextQ?.skipCondition && nextQ.skipCondition(newAnswers)) {
          nextIndex++;
        } else {
          break;
        }
      }

      const isComplete = nextIndex >= updatedActiveQuestions.length;

      // Track completed sections
      const completedSections = [...prev.completedSections];
      const sectionQuestions = updatedActiveQuestions.filter(q => q.section === currentQuestion.section);
      const sectionAnswers = sectionQuestions.filter(q => newAnswers[q.id]);
      
      if (sectionAnswers.length === sectionQuestions.length && !completedSections.includes(currentQuestion.section)) {
        completedSections.push(currentQuestion.section);
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        answers: newAnswers,
        completedSections,
        isComplete,
        lastSavedAt: new Date(),
        selectedLeadSources,
        selectedIntakeMethods,
      };
    });
  }, [currentQuestion]);

  // Skip current question (only if optional)
  const skipQuestion = useCallback(() => {
    if (!currentQuestion || currentQuestion.required) return;

    setState(prev => {
      let nextIndex = prev.currentQuestionIndex + 1;
      
      // Skip questions that should be skipped
      while (nextIndex < activeQuestions.length) {
        const nextQ = activeQuestions[nextIndex];
        if (nextQ?.skipCondition && nextQ.skipCondition(prev.answers)) {
          nextIndex++;
        } else {
          break;
        }
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete: nextIndex >= activeQuestions.length,
      };
    });
  }, [currentQuestion, activeQuestions]);

  // Go to specific question
  const goToQuestion = useCallback((questionId: string) => {
    const index = activeQuestions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: index,
      }));
    }
  }, [activeQuestions]);

  // Get answer for a question
  const getAnswer = useCallback((questionId: string) => {
    return state.answers[questionId]?.value;
  }, [state.answers]);

  // Get previous questions with answers
  const answeredQuestions = useMemo(() => {
    return activeQuestions
      .slice(0, state.currentQuestionIndex)
      .map(q => ({
        question: q,
        answer: state.answers[q.id],
      }))
      .filter(qa => qa.answer);
  }, [activeQuestions, state.currentQuestionIndex, state.answers]);

  // Get upcoming questions
  const upcomingQuestions = useMemo(() => {
    return activeQuestions.slice(state.currentQuestionIndex + 1, state.currentQuestionIndex + 4);
  }, [activeQuestions, state.currentQuestionIndex]);

  // Reset flow
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    if (sessionId) {
      localStorage.removeItem(`align-questions-${sessionId}`);
    }
  }, [sessionId]);

  // Auto-save to localStorage
  useEffect(() => {
    if (sessionId && Object.keys(state.answers).length > 0) {
      localStorage.setItem(`align-questions-${sessionId}`, JSON.stringify(state));
    }
  }, [sessionId, state]);

  return {
    // State
    currentQuestion,
    currentSection,
    sectionProgress,
    progressPercent,
    isComplete: state.isComplete,
    answers: state.answers,
    selectedLeadSources: state.selectedLeadSources,
    selectedIntakeMethods: state.selectedIntakeMethods,
    
    // Computed
    answeredQuestions,
    upcomingQuestions,
    activeQuestions,
    
    // Actions
    answerQuestion,
    skipQuestion,
    goToQuestion,
    getAnswer,
    reset,
    injectDynamicQuestions,
  };
}
