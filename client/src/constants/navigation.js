export const TABS = {
  DASHBOARD: 'dashboard',
  PLANNER: 'planner',
  QUIZ: 'quiz',
  FLASHCARDS: 'flashcards',
};

export const TAB_ITEMS = [
  {
    id: TABS.DASHBOARD,
    label: 'Home',
    iconName: 'Home',
    description: 'Exam readiness score, domain progress, and study stats',
  },
  {
    id: TABS.PLANNER,
    label: 'Study Plan',
    iconName: 'Calendar',
    description: 'Daily checklist focused on your weakest exam areas',
  },
  {
    id: TABS.QUIZ,
    label: 'Practice Quiz',
    iconName: 'BrainCircuit',
    description: 'Real scenarios with instant explanations for every answer choice',
  },
  {
    id: TABS.FLASHCARDS,
    label: 'Mistake Cards',
    iconName: 'Flame',
    description: 'Spaced repetition cards created from missed quiz questions',
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
    shortLabel: 'African Life',
    label: 'African Real-Life Analogy',
    badge: 'Everyday Life',
    description: 'Relatable parallels using M-Pesa, bodaboda networks, and local commerce.',
  },
  {
    id: 'sheng',
    shortLabel: 'Sheng',
    label: 'Nairobi Sheng Mode',
    badge: 'Street Tech Vibes',
    description: 'East African tech street dialect that makes abstract ideas stick effortlessly.',
  },
];

export const COMPLIANCE_NOTICE = 
  'TutaPass is an independent, unofficial educational prep tool. It is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. All practice questions are synthetically generated and grounded strictly in the publicly available Microsoft Learn skills outline.';
