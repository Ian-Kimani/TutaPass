export const TABS = {
  DASHBOARD: 'dashboard',
  PLANNER: 'planner',
  QUIZ: 'quiz',
  FLASHCARDS: 'flashcards',
};

export const TAB_ITEMS = [
  {
    id: TABS.DASHBOARD,
    label: 'Dashboard & Readiness',
    iconName: 'BarChart3',
    description: 'Pass probability, domain mastery, and readiness telemetry',
  },
  {
    id: TABS.PLANNER,
    label: 'Smart Study Planner',
    iconName: 'Calendar',
    description: 'Calendar roadmap weighted by your weakest domains',
  },
  {
    id: TABS.QUIZ,
    label: 'Practice Arena (Smart Quiz)',
    iconName: 'BrainCircuit',
    description: 'Scenario questions with instant Distractor Autopsies',
  },
  {
    id: TABS.FLASHCARDS,
    label: 'Weak-Spot Flashcards',
    iconName: 'Flame',
    description: 'Auto-generated SM-2 spaced repetition deck from missed questions',
  },
];

export const TONE_MODES = [
  {
    id: 'standard',
    shortLabel: 'English',
    label: 'Standard English',
    badge: 'Enterprise',
    description: 'Official enterprise cloud terminology for exam precision.',
  },
  {
    id: 'african_context',
    shortLabel: 'African Analogy',
    label: 'African Real-Life Analogy',
    badge: 'Everyday Life',
    description: 'Relatable parallels using M-Pesa, bodaboda networks, and local commerce.',
  },
  {
    id: 'sheng',
    shortLabel: 'Sheng Mode',
    label: 'Nairobi Sheng Mode',
    badge: 'Street Tech Vibes',
    description: 'East African tech street dialect that makes abstract ideas stick effortlessly.',
  },
];

export const COMPLIANCE_NOTICE = 
  'TutaPass is an independent, unofficial educational prep tool. It is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. All practice questions are synthetically generated and grounded strictly in the publicly available Microsoft Learn skills outline.';
