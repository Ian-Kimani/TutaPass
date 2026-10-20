import React from 'react';
import { useApp } from '../context/AppContext';
import { TABS } from '../constants/navigation';
import DashboardPage from '../pages/DashboardPage';
import PlannerPage from '../pages/PlannerPage';
import QuizArenaPage from '../pages/QuizArenaPage';
import FlashcardsPage from '../pages/FlashcardsPage';

export default function AppRoutes() {
  const { activeTab } = useApp();

  switch (activeTab) {
    case TABS.DASHBOARD:
      return <DashboardPage />;
    case TABS.PLANNER:
      return <PlannerPage />;
    case TABS.QUIZ:
      return <QuizArenaPage />;
    case TABS.FLASHCARDS:
      return <FlashcardsPage />;
    default:
      return <DashboardPage />;
  }
}
