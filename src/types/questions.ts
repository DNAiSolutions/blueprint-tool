// ============================================
// ALIGN Question Flow Types
// ============================================

export type QuestionType = 'text' | 'number' | 'percentage' | 'currency' | 'select' | 'yes-no';

export type QuestionSection = 
  | 'goals-context'
  | 'lead-sources'
  | 'lead-handling'
  | 'qualification'
  | 'conversion-events'
  | 'fulfillment';

export interface SelectOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: QuestionSection;
  sectionLabel: string;
  question: string;
  type: QuestionType;
  placeholder?: string;
  required: boolean;
  options?: SelectOption[];
  minValue?: number;
  maxValue?: number;
  skipCondition?: (answers: QuestionAnswers) => boolean;
  coachingHint?: string;
  nodeCreation?: {
    type: 'lead-source' | 'intake' | 'decision' | 'conversion' | 'close' | 'fulfillment' | 'review';
    field?: string;
  };
}

export interface QuestionAnswer {
  questionId: string;
  value: string | number | boolean;
  answeredAt: Date;
}

export type QuestionAnswers = Record<string, QuestionAnswer>;

export interface QuestionFlowState {
  currentQuestionIndex: number;
  answers: QuestionAnswers;
  completedSections: QuestionSection[];
  isComplete: boolean;
  lastSavedAt?: Date;
}

// ============================================
// Question Definitions
// ============================================

export const QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────
  // SECTION 1: Goals & Context
  // ─────────────────────────────────────────────
  {
    id: 'q1',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: 'What are you trying to grow? (Revenue, clients, capacity, etc.)',
    type: 'text',
    placeholder: 'e.g., We want to grow revenue by hiring more techs',
    required: true,
    coachingHint: "Start broad - understand their primary growth goal.",
  },
  {
    id: 'q2',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: "What's your target annual revenue?",
    type: 'currency',
    placeholder: 'e.g., 500000',
    required: true,
    coachingHint: "This helps frame the scale of opportunity.",
  },
  {
    id: 'q3',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: "What's your biggest bottleneck right now?",
    type: 'text',
    placeholder: 'e.g., We can\'t get enough leads / Can\'t close enough deals',
    required: true,
    coachingHint: "Great. Let's map where your leads come from.",
  },

  // ─────────────────────────────────────────────
  // SECTION 2: Lead Sources
  // ─────────────────────────────────────────────
  {
    id: 'q4',
    section: 'lead-sources',
    sectionLabel: 'Lead Sources',
    question: 'How do you get leads?',
    type: 'select',
    options: [
      { value: 'paid-ads', label: 'Paid Ads (Google, Facebook, etc.)' },
      { value: 'organic', label: 'Organic (SEO, content, word of mouth)' },
      { value: 'referral', label: 'Referrals' },
      { value: 'direct', label: 'Direct (walk-ins, cold calls)' },
      { value: 'mixed', label: 'Mixed (multiple sources)' },
    ],
    required: true,
    coachingHint: "Understanding lead sources helps identify where to focus.",
  },
  {
    id: 'q5',
    section: 'lead-sources',
    sectionLabel: 'Lead Sources',
    question: 'How many leads do you get per month (total)?',
    type: 'number',
    placeholder: 'e.g., 500',
    required: true,
    minValue: 0,
    nodeCreation: {
      type: 'lead-source',
      field: 'volume',
    },
    coachingHint: "This is the top of your funnel.",
  },
  {
    id: 'q6',
    section: 'lead-sources',
    sectionLabel: 'Lead Sources',
    question: "If you're running paid ads, what's your monthly spend?",
    type: 'currency',
    placeholder: 'e.g., 1500',
    required: false,
    skipCondition: (answers) => {
      const source = answers['q4']?.value;
      return source !== 'paid-ads' && source !== 'mixed';
    },
    coachingHint: "This helps calculate cost per lead.",
  },

  // ─────────────────────────────────────────────
  // SECTION 3: Lead Handling
  // ─────────────────────────────────────────────
  {
    id: 'q7',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'What happens when someone raises their hand? (Form submit, call, text, etc.)',
    type: 'text',
    placeholder: 'e.g., They fill out a form and we call them back',
    required: false,
    nodeCreation: {
      type: 'intake',
    },
    coachingHint: "Let's map your intake process.",
  },
  {
    id: 'q8',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'How quickly do you respond to new leads?',
    type: 'select',
    options: [
      { value: 'under-5min', label: 'Under 5 minutes' },
      { value: 'under-1hr', label: 'Within 1 hour' },
      { value: 'same-day', label: 'Same day' },
      { value: 'next-day', label: 'Next business day' },
      { value: 'varies', label: 'It varies' },
    ],
    required: true,
    coachingHint: "Speed to lead is critical for conversion.",
  },
  {
    id: 'q9',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: "What happens if they don't answer on the first try?",
    type: 'text',
    placeholder: 'e.g., We try again the next day / We send a text / Nothing',
    required: true,
    coachingHint: "Do prospects who don't answer get a second chance?",
  },

  // ─────────────────────────────────────────────
  // SECTION 4: Qualification
  // ─────────────────────────────────────────────
  {
    id: 'q10',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'Do you qualify leads before booking a call or appointment?',
    type: 'yes-no',
    required: true,
    coachingHint: "Understanding if there's a filter before conversion events.",
  },
  {
    id: 'q11',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'What are your qualification criteria?',
    type: 'text',
    placeholder: 'e.g., Budget OK, needs clear, decision maker, timeline',
    required: true,
    skipCondition: (answers) => answers['q10']?.value === false,
    nodeCreation: {
      type: 'decision',
    },
    coachingHint: "This helps identify what makes someone a 'good fit'.",
  },
  {
    id: 'q12',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'Roughly what % of leads meet your qualification criteria?',
    type: 'percentage',
    placeholder: 'e.g., 50',
    required: true,
    minValue: 0,
    maxValue: 100,
    skipCondition: (answers) => answers['q10']?.value === false,
    coachingHint: "This is a key conversion point in your funnel.",
  },

  // ─────────────────────────────────────────────
  // SECTION 5: Conversion Events
  // ─────────────────────────────────────────────
  {
    id: 'q13',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: 'Of qualified leads (or all leads if no qualification), how many schedule a call/appointment?',
    type: 'percentage',
    placeholder: 'e.g., 28',
    required: true,
    minValue: 0,
    maxValue: 100,
    nodeCreation: {
      type: 'conversion',
      field: 'conversionRate',
    },
    coachingHint: "This measures booking rate.",
  },
  {
    id: 'q14',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: 'Of scheduled calls/appointments, how many actually happen (show rate)?',
    type: 'percentage',
    placeholder: 'e.g., 80',
    required: true,
    minValue: 0,
    maxValue: 100,
    coachingHint: "No-shows are a common leak point.",
  },
  {
    id: 'q15',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: "What's your close rate on calls/appointments that happen?",
    type: 'percentage',
    placeholder: 'e.g., 71',
    required: true,
    minValue: 0,
    maxValue: 100,
    nodeCreation: {
      type: 'close',
      field: 'conversionRate',
    },
    coachingHint: "Your close rate shows sales process effectiveness.",
  },

  // ─────────────────────────────────────────────
  // SECTION 6: Fulfillment
  // ─────────────────────────────────────────────
  {
    id: 'q16',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'What happens after closing a deal? (Delivery, installation, service, etc.)',
    type: 'text',
    placeholder: 'e.g., We schedule the job within 2 weeks and complete it',
    required: false,
    nodeCreation: {
      type: 'fulfillment',
    },
    coachingHint: "Let's map what happens post-sale.",
  },
  {
    id: 'q17',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'Do you intentionally ask for reviews or referrals?',
    type: 'yes-no',
    required: true,
    nodeCreation: {
      type: 'review',
    },
    coachingHint: "Reviews and referrals close the loop.",
  },
  {
    id: 'q18',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'What % of clients leave a review or send a referral?',
    type: 'percentage',
    placeholder: 'e.g., 20',
    required: false,
    minValue: 0,
    maxValue: 100,
    skipCondition: (answers) => answers['q17']?.value === false,
    coachingHint: "You've mapped your entire process! Ready to see insights?",
  },
];

// Section metadata for display
export const SECTION_META: Record<QuestionSection, { label: string; icon: string }> = {
  'goals-context': { label: 'Goals & Context', icon: '🎯' },
  'lead-sources': { label: 'Lead Sources', icon: '📣' },
  'lead-handling': { label: 'Lead Handling', icon: '📞' },
  'qualification': { label: 'Qualification', icon: '✅' },
  'conversion-events': { label: 'Conversion Events', icon: '📈' },
  'fulfillment': { label: 'Fulfillment', icon: '🏁' },
};

// Get questions for a specific section
export function getQuestionsForSection(section: QuestionSection): Question[] {
  return QUESTIONS.filter(q => q.section === section);
}

// Get unique sections in order
export function getSections(): QuestionSection[] {
  const seen = new Set<QuestionSection>();
  const sections: QuestionSection[] = [];
  
  for (const q of QUESTIONS) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push(q.section);
    }
  }
  
  return sections;
}
