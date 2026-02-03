// ============================================
// ALIGN Question Flow Types
// ============================================

// Re-export industry-specific options for external use
export {
  getLeadSourceOptionsForIndustry,
  getQualificationOptionsForIndustry,
  getIntakeOptionsForIndustry,
  getIndustryOptions,
} from './industryOptions';

export type QuestionType = 'text' | 'number' | 'percentage' | 'currency' | 'select' | 'yes-no' | 'multi-select';

export type QuestionSection = 
  | 'goals-context'
  | 'lead-sources'
  | 'lead-handling'
  | 'qualification'
  | 'conversion-events'
  | 'fulfillment'
  | 'metrics'; // NEW: Separate section for all quantitative questions

export interface SelectOption {
  value: string;
  label: string;
  category?: string; // For grouping options
  isPaid?: boolean;  // For lead sources that have ad spend
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
    type: 'lead-source' | 'intake' | 'decision' | 'conversion' | 'close' | 'fulfillment' | 'review' | 'workflow' | 'verification' | 'handoff';
    field?: string;
    createPerSelection?: boolean; // Create individual nodes per multi-select choice
  };
  allowCustom?: boolean; // Allow custom text input for multi-select
  dynamicFollowUp?: boolean; // Generates follow-up questions dynamically
  optionKey?: 'leadSources' | 'qualificationCriteria' | 'intakeMethods'; // Key for industry-specific options
}

export interface QuestionAnswer {
  questionId: string;
  value: string | number | boolean | string[];
  answeredAt: Date;
}

export type QuestionAnswers = Record<string, QuestionAnswer>;

export interface QuestionFlowState {
  currentQuestionIndex: number;
  answers: QuestionAnswers;
  completedSections: QuestionSection[];
  isComplete: boolean;
  lastSavedAt?: Date;
  dynamicQuestions?: Question[]; // Dynamically generated follow-up questions
  selectedLeadSources?: string[]; // Track selected lead sources for follow-ups
  selectedIntakeMethods?: string[]; // Track selected intake methods
}

// ============================================
// Lead Source Options (Default - Home Services)
// Kept for backward compatibility
// ============================================
import {
  LEAD_SOURCE_OPTIONS_HOME_SERVICES,
  QUALIFICATION_OPTIONS_HOME_SERVICES,
  INTAKE_OPTIONS_HOME_SERVICES,
} from './industryOptions';

export const LEAD_SOURCE_OPTIONS: SelectOption[] = LEAD_SOURCE_OPTIONS_HOME_SERVICES;

// ============================================
// Intake Method Options (Default - Home Services)
// ============================================
export const INTAKE_METHOD_OPTIONS: SelectOption[] = INTAKE_OPTIONS_HOME_SERVICES;

// ============================================
// Qualification Criteria Options (Default - Home Services)
// ============================================
export const QUALIFICATION_OPTIONS: SelectOption[] = QUALIFICATION_OPTIONS_HOME_SERVICES;

// ============================================
// Response Time Options
// ============================================
export const RESPONSE_TIME_OPTIONS: SelectOption[] = [
  { value: 'under-1min', label: 'Under 1 minute', category: 'Speed to Lead Champion!' },
  { value: '1-5min', label: '1-5 minutes', category: 'Great response time' },
  { value: '5-30min', label: '5-30 minutes', category: 'Room for improvement' },
  { value: '30min-1hr', label: '30 min - 1 hour', category: 'Leads are cooling' },
  { value: 'same-day', label: 'Same day', category: 'Many leads lost by now' },
  { value: 'next-day', label: 'Next day or longer', category: 'Critical leak point' },
];

// ============================================
// Follow-Up Options
// ============================================
export const FOLLOW_UP_OPTIONS: SelectOption[] = [
  { value: 'call-5min', label: 'Call back within 5 minutes', category: 'Immediate' },
  { value: 'call-1hr', label: 'Call back within 1 hour', category: 'Same Day' },
  { value: 'call-same-day', label: 'Call back same day', category: 'Same Day' },
  { value: 'text-message', label: 'Text message', category: 'Digital' },
  { value: 'email-follow-up', label: 'Email follow-up', category: 'Digital' },
  { value: 'voicemail-text', label: 'Voicemail + text combo', category: 'Combined' },
  { value: 'automated-sequence', label: 'Automated follow-up sequence', category: 'Automated' },
  { value: 'nothing', label: 'Nothing (DROP-OFF)', category: 'LEAK ALERT' },
];

// ============================================
// Qualified Path Options (What happens when qualified)
// ============================================
export const QUALIFIED_PATH_OPTIONS: SelectOption[] = [
  { value: 'schedule-consultation', label: 'Schedule Consultation', category: 'Scheduling' },
  { value: 'schedule-intake', label: 'Schedule Intake Session', category: 'Scheduling' },
  { value: 'send-intake-forms', label: 'Send Intake Forms', category: 'Documentation' },
  { value: 'insurance-verification', label: 'Verify Insurance', category: 'Verification' },
  { value: 'therapist-matching', label: 'Match with Provider/Therapist', category: 'Assignment' },
  { value: 'assign-to-staff', label: 'Assign to Staff Member', category: 'Assignment' },
  { value: 'send-welcome-packet', label: 'Send Welcome Packet', category: 'Communication' },
  { value: 'collect-payment', label: 'Collect Initial Payment', category: 'Financial' },
  { value: 'schedule-estimate', label: 'Schedule On-Site Estimate', category: 'Scheduling' },
  { value: 'send-quote', label: 'Send Quote/Proposal', category: 'Documentation' },
  { value: 'other', label: 'Other', category: 'Custom' },
];

// ============================================
// Disqualified Path Options (What happens when NOT qualified)
// ============================================
export const DISQUALIFIED_PATH_OPTIONS: SelectOption[] = [
  { value: 'refer-out', label: 'Refer to Another Provider', category: 'Referral' },
  { value: 'add-to-nurture', label: 'Add to Nurture List', category: 'Future' },
  { value: 'politely-decline', label: 'Politely Decline', category: 'Close' },
  { value: 'waitlist', label: 'Add to Waitlist', category: 'Future' },
  { value: 'send-resources', label: 'Send Resources/Alternatives', category: 'Referral' },
  { value: 'nothing', label: 'Nothing (DROP-OFF)', category: 'LEAK ALERT' },
];

// ============================================
// Question Definitions - REORDERED
// Phase 1: Process Mapping (Qualitative)
// Phase 2: Metrics Collection (Quantitative)
// ============================================

export const QUESTIONS: Question[] = [
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: PROCESS MAPPING (Qualitative - Draw the flow first)
  // ═══════════════════════════════════════════════════════════
  
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
  // SECTION 2: Lead Sources (MULTI-SELECT - No volume yet)
  // ─────────────────────────────────────────────
  {
    id: 'q4',
    section: 'lead-sources',
    sectionLabel: 'Lead Sources',
    question: 'Where do your leads come from? (Select all that apply)',
    type: 'multi-select',
    options: LEAD_SOURCE_OPTIONS,
    required: true,
    allowCustom: true,
    dynamicFollowUp: true, // Triggers volume/spend questions in metrics phase
    nodeCreation: {
      type: 'lead-source',
      createPerSelection: true,
    },
    coachingHint: "Select all sources - we'll get the numbers later.",
  },

  // ─────────────────────────────────────────────
  // SECTION 3: Lead Handling (MULTI-SELECT)
  // ─────────────────────────────────────────────
  {
    id: 'q_intake_methods',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'How do leads reach you? (Select all that apply)',
    type: 'multi-select',
    options: INTAKE_METHOD_OPTIONS,
    required: true,
    allowCustom: true,
    dynamicFollowUp: true,
    nodeCreation: {
      type: 'intake',
      createPerSelection: true,
    },
    coachingHint: "Select all intake methods used across your lead sources.",
  },
  
  {
    id: 'q8',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'How quickly do you respond to new leads?',
    type: 'select',
    options: RESPONSE_TIME_OPTIONS,
    required: true,
    coachingHint: "Speed to lead is critical for conversion.",
  },
  {
    id: 'q9',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: "What happens if they don't answer on the first try?",
    type: 'multi-select',
    options: FOLLOW_UP_OPTIONS,
    required: true,
    allowCustom: true,
    coachingHint: "Do prospects who don't answer get a second chance?",
  },

  // ─────────────────────────────────────────────
  // SECTION 4: Qualification (Process)
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
    question: 'What criteria do you use to qualify leads? (Select all that apply)',
    type: 'multi-select',
    options: QUALIFICATION_OPTIONS,
    required: true,
    allowCustom: true,
    skipCondition: (answers) => answers['q10']?.value === false,
    nodeCreation: {
      type: 'decision',
      createPerSelection: false, // Single decision node with all criteria
    },
    coachingHint: "This helps identify what makes someone a 'good fit'.",
  },
  // What happens when qualified? (Multi-select to create workflow nodes)
  {
    id: 'q_qualified_path',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'What happens when a lead IS qualified? (Select all steps)',
    type: 'multi-select',
    options: QUALIFIED_PATH_OPTIONS,
    required: true,
    allowCustom: true,
    skipCondition: (answers) => answers['q10']?.value === false,
    nodeCreation: {
      type: 'workflow',
      createPerSelection: true, // Create individual nodes per step
    },
    coachingHint: "Select the steps that happen after qualification.",
  },
  // What happens when disqualified? (Multi-select to create workflow nodes)
  {
    id: 'q_disqualified_path',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'What happens when a lead is NOT qualified? (Select handling)',
    type: 'multi-select',
    options: DISQUALIFIED_PATH_OPTIONS,
    required: false,
    allowCustom: true,
    skipCondition: (answers) => answers['q10']?.value === false,
    nodeCreation: {
      type: 'workflow',
      createPerSelection: true,
    },
    coachingHint: "Select how you handle disqualified leads.",
  },

  // ─────────────────────────────────────────────
  // SECTION 5: Conversion Events (Process description)
  // ─────────────────────────────────────────────
  {
    id: 'q_conversion_type',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: 'What type of conversion event happens? (Call, consultation, estimate, etc.)',
    type: 'text',
    placeholder: 'e.g., Free consultation call, on-site estimate, intake session',
    required: true,
    nodeCreation: {
      type: 'conversion',
    },
    coachingHint: "What's the key event before someone becomes a client?",
  },

  // ─────────────────────────────────────────────
  // SECTION 6: Fulfillment (Process)
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

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: METRICS COLLECTION (Quantitative - Numbers time!)
  // Dynamic volume/spend questions are injected here after q4
  // ═══════════════════════════════════════════════════════════
  
  // ─────────────────────────────────────────────
  // SECTION 7: Metrics (All numbers at the end)
  // ─────────────────────────────────────────────
  {
    id: 'q12',
    section: 'metrics',
    sectionLabel: 'Metrics',
    question: 'Roughly what % of leads meet your qualification criteria?',
    type: 'percentage',
    placeholder: 'e.g., 50',
    required: true,
    minValue: 0,
    maxValue: 100,
    skipCondition: (answers) => answers['q10']?.value === false,
    coachingHint: "This is a key conversion point in your funnel.",
  },
  {
    id: 'q13',
    section: 'metrics',
    sectionLabel: 'Metrics',
    question: 'Of qualified leads (or all leads if no qualification), what % schedule a call/appointment?',
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
    section: 'metrics',
    sectionLabel: 'Metrics',
    question: 'Of scheduled calls/appointments, what % actually happen (show rate)?',
    type: 'percentage',
    placeholder: 'e.g., 80',
    required: true,
    minValue: 0,
    maxValue: 100,
    coachingHint: "No-shows are a common leak point.",
  },
  {
    id: 'q15',
    section: 'metrics',
    sectionLabel: 'Metrics',
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
  {
    id: 'q_avg_deal',
    section: 'metrics',
    sectionLabel: 'Metrics',
    question: "What's your average deal value?",
    type: 'currency',
    placeholder: 'e.g., 5000',
    required: true,
    coachingHint: "This helps calculate revenue impact.",
  },
  {
    id: 'q18',
    section: 'metrics',
    sectionLabel: 'Metrics',
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
  'metrics': { label: 'Metrics', icon: '📊' },
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

// Generate dynamic follow-up questions for selected lead sources
// These are now injected into the METRICS phase, not immediately after q4
export function generateLeadSourceFollowUps(selectedSources: string[]): Question[] {
  const questions: Question[] = [];
  
  selectedSources.forEach((sourceValue) => {
    const sourceOption = LEAD_SOURCE_OPTIONS.find(o => o.value === sourceValue);
    if (!sourceOption) return;
    
    const sourceLabel = sourceOption.label;
    
    // Volume question for each source - now in metrics section
    questions.push({
      id: `q_volume_${sourceValue}`,
      section: 'metrics',
      sectionLabel: 'Metrics',
      question: `How many leads per month from ${sourceLabel}?`,
      type: 'number',
      placeholder: 'e.g., 50',
      required: true,
      minValue: 0,
      coachingHint: `This helps us understand the volume from ${sourceLabel}.`,
    });
    
    // Spend question for paid sources
    if (sourceOption.isPaid) {
      questions.push({
        id: `q_spend_${sourceValue}`,
        section: 'metrics',
        sectionLabel: 'Metrics',
        question: `What's your monthly spend on ${sourceLabel}?`,
        type: 'currency',
        placeholder: 'e.g., 1500',
        required: false,
        coachingHint: `This helps calculate cost per lead for ${sourceLabel}.`,
      });
    }
  });
  
  return questions;
}

// Generate intake-to-source mapping questions
export function generateIntakeMappingQuestions(
  selectedSources: string[],
  selectedIntakes: string[]
): Question[] {
  const questions: Question[] = [];
  
  selectedSources.forEach((sourceValue) => {
    const sourceOption = LEAD_SOURCE_OPTIONS.find(o => o.value === sourceValue);
    if (!sourceOption) return;
    
    // Create a mapping question for each lead source
    questions.push({
      id: `q_intake_map_${sourceValue}`,
      section: 'lead-handling',
      sectionLabel: 'Lead Handling',
      question: `Which intake methods apply to ${sourceOption.label}?`,
      type: 'multi-select',
      options: selectedIntakes.map(intake => {
        const intakeOption = INTAKE_METHOD_OPTIONS.find(o => o.value === intake);
        return {
          value: intake,
          label: intakeOption?.label || intake,
        };
      }),
      required: true,
      coachingHint: `Select all ways leads from ${sourceOption.label} reach you.`,
    });
  });
  
  return questions;
}