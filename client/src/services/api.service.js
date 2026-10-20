import apiClient from '../lib/apiClient';

/**
 * Service Layer mapping to backend Express API.
 * Emits promptTelemetry automatically whenever an AI call returns.
 */

let onTelemetryCallback = null;

export const registerTelemetryHandler = (callback) => {
  onTelemetryCallback = callback;
};

const handleResponse = (response) => {
  if (response?.promptTelemetry && onTelemetryCallback) {
    onTelemetryCallback(response.promptTelemetry);
  }
  return response?.data;
};

export const apiService = {
  // Syllabi
  getSyllabi: async () => {
    const res = await apiClient.get('/syllabus');
    return handleResponse(res);
  },

  importSyllabus: async (rawText, title) => {
    const res = await apiClient.post('/syllabus/import', { rawText, title });
    return handleResponse(res);
  },

  // Dashboard & Plan
  getDashboard: async (userId = 'demo-learner') => {
    const res = await apiClient.get(`/dashboard?userId=${userId}`);
    return handleResponse(res);
  },

  saveStudyPlan: async (planData) => {
    const res = await apiClient.post('/dashboard/plan', planData);
    return handleResponse(res);
  },

  resetDemo: async () => {
    const res = await apiClient.post('/dashboard/reset-demo');
    return handleResponse(res);
  },

  // Quiz Arena
  getQuizQuestions: async (domainId = null, limit = 10) => {
    const endpoint = domainId ? `/quiz?domainId=${domainId}&limit=${limit}` : `/quiz?limit=${limit}`;
    const res = await apiClient.get(endpoint);
    return handleResponse(res);
  },

  submitQuizAttempt: async (attemptData) => {
    const res = await apiClient.post('/quiz/attempt', attemptData);
    return handleResponse(res);
  },

  generateMoreQuestions: async (generateData) => {
    const res = await apiClient.post('/quiz/generate', generateData);
    return handleResponse(res);
  },

  // Flashcards (Spaced Repetition)
  getFlashcards: async (userId = 'demo-learner') => {
    const res = await apiClient.get(`/flashcards?userId=${userId}`);
    return handleResponse(res);
  },

  reviewFlashcard: async (cardId, rating) => {
    const res = await apiClient.post(`/flashcards/${cardId}/review`, { rating });
    return handleResponse(res);
  },

  // On-demand AI Explanation
  explainConcept: async (concept, topic, mode = 'african_context') => {
    const res = await apiClient.post('/ai/explain', { concept, topic, mode });
    return handleResponse(res);
  },
};

export default apiService;
