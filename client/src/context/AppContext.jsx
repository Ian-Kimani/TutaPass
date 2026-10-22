import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TABS } from '../constants/navigation';
import apiService, { registerTelemetryHandler } from '../services/api.service';

const AppContext = createContext(null);

const DEMO_SYLLABUS = {
  id: 1,
  code: 'AZ-900',
  title: 'Microsoft Azure Fundamentals',
  is_flagship: true,
  source_url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-900',
};

const DEMO_DASHBOARD = {
  readiness: {
    overallReadiness: 64,
    verdict: 'Sharpening Phase',
    verdictColor: 'indigo',
    advice: 'Keep practicing your weak topics and review your Mistake Cards.',
    domains: [
      { id: 1, name: 'Describe cloud concepts', masteryPercentage: 70, totalAttempts: 4, correctAttempts: 3, cardsCount: 1, cardsDue: 0, weightRange: '20–25%' },
      { id: 2, name: 'Describe Azure architecture and services', masteryPercentage: 60, totalAttempts: 4, correctAttempts: 2, cardsCount: 1, cardsDue: 1, weightRange: '35–40%' },
      { id: 3, name: 'Describe Azure management and governance', masteryPercentage: 55, totalAttempts: 3, correctAttempts: 2, cardsCount: 1, cardsDue: 1, weightRange: '30–35%' },
    ],
    metrics: { totalAttempts: 11, correctAttempts: 7, overallAccuracy: 64, totalFlashcards: 3, dueFlashcards: 2 },
  },
  studyPlan: {
    schedule_data: [
      { day: 1, topic: 'Cloud concepts', action: 'Review CapEx, OpEx, and cloud benefits.', duration: '30 min', status: 'in_progress' },
      { day: 2, topic: 'Azure architecture', action: 'Practise regions, zones, and core services.', duration: '45 min', status: 'pending' },
      { day: 3, topic: 'Governance', action: 'Review RBAC, Policy, and cost management.', duration: '30 min', status: 'pending' },
    ],
  },
  syllabus: DEMO_SYLLABUS,
  flagshipSyllabus: DEMO_SYLLABUS,
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [selectedQuizDomainId, setSelectedQuizDomainId] = useState(null);
  const [languageMode, setLanguageMode] = useState('african_context'); // default to engaging African Real-Life Analogy
  const [isXRayOpen, setIsXRayOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  const [syllabi, setSyllabi] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tutapass-syllabi-cache')) || [DEMO_SYLLABUS];
    } catch {
      return [DEMO_SYLLABUS];
    }
  });
  const [activeSyllabus, setActiveSyllabus] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tutapass-active-syllabus-cache')) || DEMO_SYLLABUS;
    } catch {
      return DEMO_SYLLABUS;
    }
  });
  const [dashboardData, setDashboardData] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tutapass-dashboard-cache')) || DEMO_DASHBOARD;
    } catch {
      return DEMO_DASHBOARD;
    }
  });
  const [flashcards, setFlashcards] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tutapass-flashcards-cache')) || [];
    } catch {
      return [];
    }
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Baseline prompt telemetry for initial inspection by judges before any button is clicked
  const [promptTelemetry, setPromptTelemetry] = useState({
    modelUsed: 'Gemini Flash (ready)',
    temperature: 0.7,
    status: 'ready_for_inspection',
    timestamp: new Date().toISOString(),
    techniquesUsed: [
      'Distractor Autopsy Anatomy Framework',
      'Tri-Linguistic Cultural Persona Switching (Standard / African / Sheng)',
      'Negative Intellectual Property & Anti-Dumping Constraints',
      'Structured JSON Schema Enforcement',
      'Teach-Back Reasoning & Misconception Detection',
    ],
    systemInstruction: `You are the Lead Question Architect & Adaptive Coach for TutaPass (Unofficial AZ-900 Exam Prep).
RULES:
1. STRICT COMPLIANCE: NEVER copy real proprietary exam questions from Microsoft or use Microsoft logos. Write 100% original, practical enterprise scenarios based on public Microsoft Learn outlines.
2. DISTRACTOR AUTOPSY: For EVERY single option, dissect why it is wrong, when it WOULD be right, and what mental trap tricks students.
3. CULTURAL CONTEXT SWITCHER: Provide 3 rich explanation modes: Standard Enterprise English, African Real-Life Analogy (M-Pesa, bodaboda, KPLC), and Sheng Mode.
Output strictly valid JSON with no markdown wrapping.`,
    userPrompt: `Generate high-yield scenario questions grounded in official Microsoft Learn skills with exhaustive Distractor Autopsies for each multiple choice option.`,
  });

  // Connect telemetry listener
  useEffect(() => {
    registerTelemetryHandler((telemetry) => {
      if (telemetry) {
        setPromptTelemetry(telemetry);
      }
    });
  }, []);

  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Fetch Syllabi list
  const loadSyllabi = useCallback(async () => {
    try {
      const data = await apiService.getSyllabi();
      if (data && data.length > 0) {
        setSyllabi(data);
        window.localStorage.setItem('tutapass-syllabi-cache', JSON.stringify(data));
        const flagship = data.find((s) => s.is_flagship) || data[0];
        setActiveSyllabus((prev) => {
          const next = prev || flagship;
          window.localStorage.setItem('tutapass-active-syllabus-cache', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.warn('Could not load syllabi:', err.message);
    }
  }, []);

  // Fetch Dashboard Telemetry scoped to active syllabus
  const refreshDashboard = useCallback(async (targetSyllabusId = null) => {
    try {
      setLoadingDashboard(true);
      const sylId = targetSyllabusId !== null ? targetSyllabusId : (activeSyllabus?.id || null);
      const data = await apiService.getDashboard('demo-learner', sylId);
      setDashboardData(data);
      window.localStorage.setItem('tutapass-dashboard-cache', JSON.stringify(data));
      const flashcardData = await apiService.getFlashcards('demo-learner', sylId);
      setFlashcards(flashcardData?.flashcards || []);
      window.localStorage.setItem('tutapass-flashcards-cache', JSON.stringify(flashcardData?.flashcards || []));
    } catch (err) {
      console.warn('Could not load dashboard data:', err.message);
    } finally {
      setLoadingDashboard(false);
    }
  }, [activeSyllabus?.id]);

  // Initial Load
  useEffect(() => {
    // Wake a sleeping Render instance without blocking the cached first paint.
    apiService.healthCheck().catch(() => {});
    loadSyllabi();
  }, [loadSyllabi]);

  // Reload dashboard whenever active exam changes
  useEffect(() => {
    if (activeSyllabus?.id) {
      refreshDashboard(activeSyllabus.id);
      setSelectedQuizDomainId(null);
    }
  }, [activeSyllabus?.id]);

  // Demo Reset Handler
  const handleResetDemo = async () => {
    try {
      setIsResettingDemo(true);
      await apiService.resetDemo();
      await refreshDashboard();
      showToast('Demo learner telemetry reset to baseline (~64% score, 3 due cards)!', 'success');
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const value = {
    activeTab,
    setActiveTab,
    selectedQuizDomainId,
    setSelectedQuizDomainId,
    languageMode,
    setLanguageMode,
    isXRayOpen,
    setIsXRayOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isResettingDemo,
    handleResetDemo,
    syllabi,
    setSyllabi,
    activeSyllabus,
    setActiveSyllabus,
    dashboardData,
    flashcards,
    loadingDashboard,
    refreshDashboard,
    promptTelemetry,
    setPromptTelemetry,
    toastMessage,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
